import { NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-2.5-flash";

export async function POST(req: Request) {
  try {
    const { imageBase64 } = (await req.json()) as { imageBase64?: string };
    if (!imageBase64) {
      return NextResponse.json({ error: "缺少 imageBase64" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "服务端未配置 GEMINI_API_KEY" }, { status: 500 });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const prompt = [
      "你是一个你画我猜游戏的裁判。",
      "请根据这张手绘图猜测画的是什么。",
      "只输出 JSON：{\"guess\":\"...\",\"confidence\":\"高/中/低\"}",
      "不要输出 markdown 或额外解释。",
    ].join("\n");

    const geminiResp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/png",
                  data: imageBase64,
                },
              },
            ],
          },
        ],
      }),
    });

    const rawData = await geminiResp.json();
    if (!geminiResp.ok) {
      return NextResponse.json({ error: rawData?.error?.message ?? "Gemini 请求失败" }, { status: 500 });
    }

    const text: string = rawData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    let parsed: { guess?: string; confidence?: string } = {};

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { guess: text, confidence: "未知" };
    }

    return NextResponse.json({
      guess: parsed.guess ?? "无法判断",
      confidence: parsed.confidence ?? "未知",
      raw: text,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "服务器内部错误" },
      { status: 500 },
    );
  }
}
