type GeminiResult = {
  recommendedAvg: number | null;
};

export async function adjustPriceWithGemini(title: string, avg: number | null): Promise<number | null> {
  try {
    if (avg == null || Number.isNaN(avg)) return avg;
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY as string | undefined;
    if (!apiKey) return avg;
    const prompt = `You are a coin pricing sanity checker. Given a coin title and an average price from shopping results, reply ONLY with a JSON object {"recommendedAvg": number|null}.
Coin: ${title}
ObservedAvgUSD: ${avg}
Guidelines: If the coin is modern, common circulation (e.g., Poland 20 groszy 2022), recommendedAvg should be near typical sale prices (often $0.05-$2). If the query looks rare/proof/gold/silver, you can keep the average. Avoid recommending unrealistic high values for common coins.`;

    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    const json = await resp.json();
    const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return avg;
    const match = text.match(/\{[\s\S]*\}/);
    const parsed: GeminiResult | null = match ? JSON.parse(match[0]) : null;
    const rec = parsed && typeof parsed.recommendedAvg === 'number' && !Number.isNaN(parsed.recommendedAvg)
      ? parsed.recommendedAvg
      : null;
    return rec ?? avg;
  } catch {
    return avg;
  }
}

export async function verifyQueryWithGemini(input: string): Promise<{
  singleCoin: boolean;
  type: 'coin' | 'set' | 'jewelry' | 'unknown';
  reason?: string;
}> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY as string | undefined;
    if (!apiKey) return { singleCoin: true, type: 'unknown' };
    const prompt = `You classify coin-related text queries. Reply ONLY JSON {"singleCoin": boolean, "type": "coin"|"set"|"jewelry"|"unknown", "reason"?: string}.
Query: ${input}
Rules: If it's a single coin (one denomination/year/mint), singleCoin=true and type=coin. If it's a lot/bundle/roll or multiple denominations/years, type=set and singleCoin=false.
If it's jewelry (pendant, necklace, ring, bracelet, bezel), type=jewelry and singleCoin=false.`;
    const body = { contents: [{ parts: [{ text: prompt }] }] };
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    const json = await resp.json();
    const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    const match = text?.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : null;
    const singleCoin = !!parsed?.singleCoin;
    const type = parsed?.type === 'coin' || parsed?.type === 'set' || parsed?.type === 'jewelry' ? parsed.type : 'unknown';
    const reason = typeof parsed?.reason === 'string' ? parsed.reason : undefined;
    return { singleCoin, type, reason };
  } catch {
    return { singleCoin: true, type: 'unknown' };
  }
}


