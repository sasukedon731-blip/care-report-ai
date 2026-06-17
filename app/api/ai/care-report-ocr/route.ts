import { NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "nodejs"

const MAX_BASE64_LENGTH = 12_000_000

function isSupportedMimeType(mimeType: string) {
  return ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType)
}

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json()

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json({ error: "画像データがありません。" }, { status: 400 })
    }

    if (!mimeType || typeof mimeType !== "string" || !isSupportedMimeType(mimeType)) {
      return NextResponse.json(
        { error: "対応している画像形式は JPEG / PNG / WebP / GIF です。" },
        { status: 400 },
      )
    }

    if (imageBase64.length > MAX_BASE64_LENGTH) {
      return NextResponse.json(
        { error: "画像サイズが大きすぎます。少し小さく撮影し直してください。" },
        { status: 413 },
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY が設定されていません。" },
        { status: 500 },
      )
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "あなたは介護施設の報告書画像を読み取るOCR補助AIです。画像内の日本語テキストを可能な限り正確に抽出し、必ずJSONだけで返してください。",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `画像内にある介護報告・申し送り・日誌の文章を読み取ってください。\n\nルール:\n- 読み取れた文章を text に入れる\n- 社内用のため、氏名らしきものも画像に書かれている通りそのまま残す\n- 氏名をA様・B様に置き換えない\n- 判読が難しい箇所は「（判読不明）」と書く\n- 表や箇条書きは、意味が分かるように改行して残す\n- 注意点があれば warnings に配列で入れる\n- 文章を添削せず、ここでは読み取りだけ行う\n\n出力JSON形式:\n{ "text": "読み取った文章", "warnings": ["注意点"] }`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    })

    const raw = completion.choices[0]?.message?.content ?? ""

    try {
      const parsed = JSON.parse(raw) as { text?: string; warnings?: string[] }
      return NextResponse.json({
        text: parsed.text ?? "",
        warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      })
    } catch {
      return NextResponse.json({ text: raw, warnings: ["JSON形式で解析できなかったため、出力をそのまま表示しています。"] })
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "写真読み取り中にエラーが発生しました。" },
      { status: 500 },
    )
  }
}
