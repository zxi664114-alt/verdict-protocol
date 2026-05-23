// src/app/api/claim/route.ts
import { NextRequest, NextResponse } from 'next/server';

async function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

async function kvSet(key: string, value: string) {
  const redis = await getRedis();
  if (!redis) return;
  await fetch(`${redis.url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`, {
    headers: { Authorization: `Bearer ${redis.token}` },
  });
}

async function kvGet(key: string): Promise<string | null> {
  const redis = await getRedis();
  if (!redis) return null;
  const res = await fetch(`${redis.url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${redis.token}` },
  });
  const data = await res.json();
  return data.result || null;
}

export async function POST(req: NextRequest) {
  try {
    const { claimHash, ruleHash, claimText, ruleText } = await req.json();
    if (!claimHash || !claimText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    await kvSet(`claim:${claimHash}`, claimText);
    if (ruleHash && ruleText) {
      await kvSet(`rule:${ruleHash}`, ruleText);
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const claimHash = searchParams.get('claimHash');
    const ruleHash = searchParams.get('ruleHash');
    if (!claimHash) {
      return NextResponse.json({ error: 'Missing claimHash' }, { status: 400 });
    }
    const claimText = await kvGet(`claim:${claimHash}`);
    const ruleText = ruleHash ? await kvGet(`rule:${ruleHash}`) : null;
    return NextResponse.json({ claimText, ruleText });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
