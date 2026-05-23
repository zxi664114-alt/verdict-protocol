// src/app/api/claim/route.ts
import { NextRequest, NextResponse } from 'next/server';

// 用Vercel KV存储声明数据
// fallback到内存存储（本地开发用）
const memoryStore: Record<string, { claimText: string; ruleText: string; createdAt: number }> = {};

export async function POST(req: NextRequest) {
  try {
    const { claimHash, ruleHash, claimText, ruleText } = await req.json();
    if (!claimHash || !claimText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const data = { claimText, ruleText: ruleText || '', createdAt: Date.now() };

    try {
      // 尝试使用Vercel KV
      const { kv } = await import('@vercel/kv');
      await kv.set(`claim:${claimHash}`, data);
      if (ruleHash && ruleText) {
        await kv.set(`rule:${ruleHash}`, ruleText);
      }
    } catch {
      // fallback到内存存储（本地开发）
      memoryStore[`claim:${claimHash}`] = data;
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
    if (!claimHash) {
      return NextResponse.json({ error: 'Missing claimHash' }, { status: 400 });
    }

    let data = null;
    try {
      const { kv } = await import('@vercel/kv');
      data = await kv.get(`claim:${claimHash}`);
    } catch {
      data = memoryStore[`claim:${claimHash}`] || null;
    }

    if (!data) {
      return NextResponse.json({ claimText: null, ruleText: null });
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
