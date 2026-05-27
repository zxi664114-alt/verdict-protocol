// src/app/api/notify/route.ts
import { NextRequest, NextResponse } from 'next/server';

// 多链配置
const CHAINS = [
  { chainId: 5003, name: 'Mantle Sepolia', contract: '0xE731a80668Ad0439a6B55e57f65C1D7885827566', rpc: 'https://rpc.sepolia.mantle.xyz', token: 'MNT' },
  { chainId: 97, name: 'BNB Testnet', contract: '0xa0A997cF05F7Baf21becEA4130209fD7C7D1A994', rpc: 'https://data-seed-prebsc-1-s1.bnbchain.org:8545', token: 'tBNB' },
];

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const KV_URL = process.env.KV_REST_API_URL || '';
const KV_TOKEN = process.env.KV_REST_API_TOKEN || '';

async function kvGet(key: string) {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } });
    const data = await res.json();
    return data.result || null;
  } catch { return null; }
}

async function kvSet(key: string, value: string) {
  if (!KV_URL || !KV_TOKEN) return;
  await fetch(`${KV_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } });
}

async function rpcCall(rpc: string, method: string, params: any[]) {
  const res = await fetch(rpc, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }) });
  const data = await res.json();
  return data.result;
}

async function sendTelegramMessage(chatId: string, text: string) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }) });
}

function fmtEther(weiStr: string): string {
  try {
    const val = parseFloat((BigInt(weiStr) * 10000n / BigInt(1e18)).toString()) / 10000;
    return val.toFixed(4).replace(/\.?0+$/, '');
  } catch { return '?'; }
}

function fmtDeadline(deadlineStr: string): string {
  try {
    const now = Math.floor(Date.now() / 1000);
    const diff = parseInt(deadlineStr) - now;
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    return days > 0 ? `~${days}d ${hours}h` : `~${hours}h`;
  } catch { return 'unknown'; }
}

async function getDuel(rpc: string, contract: string, id: number) {
  try {
    const idHex = id.toString(16).padStart(64, '0');
    const hex = await rpcCall(rpc, 'eth_call', [{ to: contract, data: '0x565e614f' + idHex }, 'latest']);
    if (!hex || hex === '0x' || hex.length < 10) return null;
    const data = hex.slice(2);
    const addr = (offset: number) => '0x' + data.slice(offset * 64 + 24, offset * 64 + 64);
    const uint = (offset: number) => BigInt('0x' + (data.slice(offset * 64, offset * 64 + 64) || '0'));
    return { blue: addr(1), wager: uint(3).toString(), deadline: uint(5).toString(), claimHash: '0x' + data.slice(6 * 64, 7 * 64), ruleHash: '0x' + data.slice(7 * 64, 8 * 64), status: Number(uint(9)), winner: Number(uint(10)) };
  } catch { return null; }
}

function buildAcceptedMessage(i: number, duel: any, claimText: string, ruleText: string, chainName: string, token: string): string {
  const blue = duel.blue !== '0x0000000000000000000000000000000000000000' ? `${duel.blue.slice(0, 6)}...${duel.blue.slice(-4)}` : 'unknown';
  const wager = fmtEther(duel.wager);
  const totalPool = fmtEther((BigInt(duel.wager) * 2n).toString());
  return `⚔️ *Your duel #${i} has been accepted!*

📋 *Claim:* "${claimText || `#${i} — on-chain duel`}"
📏 *Ruling standard:* ${ruleText || 'Based on on-chain data'}

🆚 *Opponent:* \`${blue}\`
💰 *Total pool:* ${totalPool} ${token} (${wager} ${token} each)
⏰ *Expires:* ${fmtDeadline(duel.deadline)}
🌐 *Network:* ${chainName}

*What you can do:*
• Negotiate before expiry → Mutual settlement
• Submit evidence after expiry → Request AI ruling
• Winner claims reward within 48h after verdict

🔗 [View duel](https://verdictprotocol.online/?duel=${i})`;
}

function buildSettledMessage(i: number, claimText: string, won: boolean): string {
  if (won) return `🏆 *You won duel #${i}!*\n\n📋 "${claimText || `#${i}`}"\n\n🎉 Claim your reward within 48 hours.\n\n🔗 [Claim reward](https://verdictprotocol.online/?duel=${i})`;
  return `💀 *Duel #${i} settled*\n\n📋 "${claimText || `#${i}`}"\n\nBetter luck next time!\n\n🔗 [View result](https://verdictprotocol.online/?duel=${i})`;
}

async function processChain(chain: typeof CHAINS[0], notifications: string[]) {
  try {
    const counterHex = await rpcCall(chain.rpc, 'eth_call', [{ to: chain.contract, data: '0x61bc221a' }, 'latest']);
    const count = parseInt(counterHex, 16);
    if (!count) return;

    for (let i = 1; i <= count; i++) {
      const duel = await getDuel(chain.rpc, chain.contract, i);
      if (!duel) continue;

      const prevStatusKey = `duel:status:${chain.chainId}:${i}`;
      const prevStatus = await kvGet(prevStatusKey);
      const prevStatusNum = prevStatus ? parseInt(prevStatus) : -1;

      if (prevStatusNum === duel.status && prevStatusNum !== -1) continue;
      await kvSet(prevStatusKey, String(duel.status));

      if (duel.status === 1 && (prevStatusNum === 0 || prevStatusNum === -1)) {
        const tgUsername = await kvGet(`tg:claim:${duel.claimHash}`);
        if (!tgUsername) continue;
        const chatId = await kvGet(`tg:user:${tgUsername}`);
        if (!chatId) continue;
        const claimText = await kvGet(`claim:${duel.claimHash}`) || '';
        const ruleText = await kvGet(`rule:${duel.ruleHash}`) || '';
        await sendTelegramMessage(chatId, buildAcceptedMessage(i, duel, claimText, ruleText, chain.name, chain.token));
        notifications.push(`[${chain.name}] duel #${i}: notified accepted`);
      } else if (duel.status === 2 && prevStatusNum !== 2) {
        const tgUsername = await kvGet(`tg:claim:${duel.claimHash}`);
        if (!tgUsername) continue;
        const chatId = await kvGet(`tg:user:${tgUsername}`);
        if (!chatId) continue;
        const claimText = await kvGet(`claim:${duel.claimHash}`) || '';
        await sendTelegramMessage(chatId, buildSettledMessage(i, claimText, duel.winner === 1));
        notifications.push(`[${chain.name}] duel #${i}: notified settled`);
      }
    }
  } catch (e) {
    console.error(`[${chain.name}] notify error:`, e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const notifications: string[] = [];
    await Promise.all(CHAINS.map(c => processChain(c, notifications)));
    return NextResponse.json({ notifications, chains: CHAINS.map(c => c.name) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
