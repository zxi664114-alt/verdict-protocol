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

const AUDIT_PROMPT_EN = `You are a professional contract law advisor specializing in wager protocols and on-chain agreements. Review the following wager agreement and output a JSON risk analysis.

Contract:
{text}

Output ONLY this JSON format:
{
  "contractType": "contract type",
  "overallScore": 50,
  "summary": "Overall risk assessment (max 60 words)",
  "risks": [
    {
      "level": "high|mid|low",
      "title": "Risk name (max 8 words)",
      "description": "Risk description (max 50 words)",
      "suggestion": "Specific revision suggestion (max 80 words)"
    }
  ]
}

Rules: sort risks high→mid→low. Focus on: ambiguous ruling criteria, unclear evidence requirements, time definition issues, unequal rights, missing fallback for insufficient evidence.`;

const AUDIT_PROMPT_ZH = `你是一位专业的合同法律顾问，专注于对赌协议和链上协议的风险审查。请对以下对赌协议内容进行全面审查，输出JSON格式的分析结果。

合同内容：
{text}

请严格按以下JSON格式输出，不要输出任何其他内容：
{
  "contractType": "合同类型",
  "overallScore": 50,
  "summary": "整体风险评估概述（60字以内）",
  "risks": [
    {
      "level": "high|mid|low",
      "title": "风险名称（10字以内）",
      "description": "风险描述（50字以内）",
      "suggestion": "修改建议（80字以内）"
    }
  ]
}

要求：risks按high→mid→low排序，重点关注裁定标准模糊、证据要求不明确、时间定义不清、证据不足时无兜底条款等常见风险。`;

export async function POST(req: NextRequest) {
  try {
    const { claimText, ruleText, lang = 'en', claimHash } = await req.json();

    if (!claimText) {
      return NextResponse.json({ error: 'Missing claimText' }, { status: 400 });
    }

    // Check cache first
    if (claimHash) {
      const cached = await kvGet(`audit:${claimHash}`);
      if (cached) {
        return NextResponse.json(JSON.parse(cached));
      }
    }

    const contractText = `Claim: ${claimText}\n\nRuling Standard: ${ruleText || '(not specified)'}`;
    const prompt = (lang === 'zh' ? AUDIT_PROMPT_ZH : AUDIT_PROMPT_EN)
      .replace('{text}', contractText.slice(0, 2500));

    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 2000,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`);
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Failed to parse AI response');

    const result = JSON.parse(match[0]);
    if (!result.risks) result.risks = [];

    // Cache result by claimHash
    if (claimHash) {
      await kvSet(`audit:${claimHash}`, JSON.stringify(result));
    }

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const claimHash = searchParams.get('claimHash');
    if (!claimHash) return NextResponse.json({ error: 'Missing claimHash' }, { status: 400 });
    const cached = await kvGet(`audit:${claimHash}`);
    if (!cached) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(JSON.parse(cached));
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
