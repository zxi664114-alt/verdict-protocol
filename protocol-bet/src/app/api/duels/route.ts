// src/app/api/duels/route.ts
import { NextRequest, NextResponse } from 'next/server';

const CHAINS = [
  { chainId: 5003, name: 'Mantle Sepolia', contract: '0xE731a80668Ad0439a6B55e57f65C1D7885827566', rpc: 'https://rpc.sepolia.mantle.xyz', token: 'MNT', cacheKey: 'duels:mantle5003' },
  { chainId: 97,   name: 'BNB Testnet',    contract: '0xa0A997cF05F7Baf21becEA4130209fD7C7D1A994', rpc: 'https://data-seed-prebsc-1-s1.bnbchain.org:8545', token: 'tBNB', cacheKey: 'duels:bnb97' },
];

const CACHE_TTL = 60;
const COMBINED_CACHE_KEY = 'duels:all:v2'; // v2 to bust old cache

// RPC with timeout + retry
async function rpcCall(rpc: string, method: string, params: any[], timeoutMs = 8000, retries = 2): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      if (data.error) throw new Error(`RPC error: ${JSON.stringify(data.error)}`);
      return data.result;
    } catch (e: any) {
      if (attempt === retries) throw e;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
}

async function kvGet(key: string) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    return data.result ? JSON.parse(data.result) : null;
  } catch { return null; }
}

async function kvSetEx(key: string, value: any, ttl: number) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;
  try {
    await fetch(`${url}/setex/${encodeURIComponent(key)}/${ttl}/${encodeURIComponent(JSON.stringify(value))}`, { headers: { Authorization: `Bearer ${token}` } });
  } catch {}
}

function parseDuel(id: number, hex: string, poolRedHex: string, poolBlueHex: string) {
  if (!hex || hex === '0x' || hex.length < 10) return null;
  const data = hex.slice(2);
  const addr = (offset: number) => '0x' + data.slice(offset * 64 + 24, offset * 64 + 64);
  const uint = (offset: number) => BigInt('0x' + (data.slice(offset * 64, offset * 64 + 64) || '0'));
  const red = addr(0);
  if (red === '0x0000000000000000000000000000000000000000') return null;
  return {
    id, red, blue: addr(1), token: addr(2),
    wager: uint(3).toString(), audioBps: uint(4).toString(), deadline: uint(5).toString(),
    claimHash: '0x' + data.slice(6 * 64, 7 * 64), ruleHash: '0x' + data.slice(7 * 64, 8 * 64),
    vis: Number(uint(8)), status: Number(uint(9)), winner: Number(uint(10)), settledAt: uint(11).toString(),
    poolRed: poolRedHex && poolRedHex !== '0x' ? BigInt(poolRedHex).toString() : '0',
    poolBlue: poolBlueHex && poolBlueHex !== '0x' ? BigInt(poolBlueHex).toString() : '0',
  };
}

async function syncChain(chain: typeof CHAINS[0]): Promise<any[]> {
  try {
    // 1. get counter
    const counterHex = await rpcCall(chain.rpc, 'eth_call', [{ to: chain.contract, data: '0x61bc221a' }, 'latest']);
    const count = parseInt(counterHex, 16);
    if (!count) return [];

    // 2. fetch all duels in parallel with timeout
    const calls = [];
    for (let i = 1; i <= count; i++) {
      const idHex = i.toString(16).padStart(64, '0');
      calls.push({ to: chain.contract, data: '0x565e614f' + idHex });
      calls.push({ to: chain.contract, data: '0xd831f3c5' + idHex });
      calls.push({ to: chain.contract, data: '0x3a33cdea' + idHex });
    }
    const results = await Promise.all(calls.map(call => rpcCall(chain.rpc, 'eth_call', [call, 'latest'])));

    // 3. parse
    const duels: any[] = [];
    for (let i = 0; i < count; i++) {
      const duel = parseDuel(i + 1, results[i * 3], results[i * 3 + 1], results[i * 3 + 2]);
      if (duel) duels.push({
        ...duel,
        chainId: chain.chainId,
        chainName: chain.name,
        chainToken: chain.token,
        id: chain.chainId * 100000 + duel.id,
        originalId: duel.id,
      });
    }

    // 4. fetch claim/rule texts
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (url && token) {
      await Promise.all(duels.map(async (duel) => {
        try {
          const [claimRes, ruleRes] = await Promise.all([
            fetch(`${url}/get/${encodeURIComponent('claim:' + duel.claimHash)}`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${url}/get/${encodeURIComponent('rule:' + duel.ruleHash)}`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          const [claimData, ruleData] = await Promise.all([claimRes.json(), ruleRes.json()]);
          if (claimData.result) duel.claimText = claimData.result;
          if (ruleData.result) duel.ruleText = ruleData.result;
        } catch {}
      }));
    }

    // 5. save per-chain cache as fallback
    await kvSetEx(chain.cacheKey, duels, CACHE_TTL * 5);
    return duels;

  } catch (e) {
    console.error(`[${chain.name}] sync failed:`, e);
    // fallback: return per-chain cached data
    const fallback = await kvGet(chain.cacheKey);
    if (fallback && Array.isArray(fallback)) {
      console.log(`[${chain.name}] using cached fallback (${fallback.length} duels)`);
      return fallback;
    }
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const forceSync = searchParams.get('sync') === '1';

    if (!forceSync) {
      const cached = await kvGet(COMBINED_CACHE_KEY);
      if (cached) return NextResponse.json({ duels: cached, cached: true });
    }

    // sync all chains in parallel, each with independent fallback
    const results = await Promise.allSettled(CHAINS.map(c => syncChain(c)));
    const allDuels = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => (r as PromiseFulfilledResult<any[]>).value);

    await kvSetEx(COMBINED_CACHE_KEY, allDuels, CACHE_TTL);
    return NextResponse.json({ duels: allDuels, cached: false, count: allDuels.length });

  } catch (e: any) {
    return NextResponse.json({ error: e.message, duels: [] }, { status: 500 });
  }
}
