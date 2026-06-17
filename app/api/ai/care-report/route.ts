import { NextResponse } from "next/server"
import OpenAI from "openai"
import { buildCareReportPrompt } from "@/lib/careReportPrompt"
import { detectCareTerms } from "@/lib/careTerms"

export const runtime = "nodejs"

type CareReportResult = {
  points: string[]
  missing: string[]
  familyReport: string
  internalReport: string
  detectedTerms?: {
    term: string
    meaning: string
    familyExpression: string
    internalExpression: string
  }[]
}

function fallbackParse(text: string): CareReportResult {
  return {
    points: ["AIの出力形式を完全には解析できませんでした。下記の内容を確認してください。"],
    missing: [],
    familyReport: text,
    internalReport: text,
    detectedTerms: [],
  }
}

export async function POST(req: Request) {
  try {
    const { inputText } = await req.json()

    if (!inputText || typeof inputText !== "string" || inputText.trim().length < 5) {
      return NextResponse.json(
        { error: "報告文を5文字以上入力してください。" },
        { status: 400 },
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY が設定されていません。" },
        { status: 500 },
      )
    }

    const detectedTerms = detectCareTerms(inputText.trim())

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "あなたは介護施設向けの報告書添削AIです。必ず日本語で、指定されたJSON形式だけで返してください。",
        },
        {
          role: "user",
          content: buildCareReportPrompt(inputText.trim(), detectedTerms),
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    })

    const raw = completion.choices[0]?.message?.content ?? ""

    try {
      const parsed = JSON.parse(raw) as CareReportResult
      return NextResponse.json({
        ...parsed,
        detectedTerms: parsed.detectedTerms?.length
          ? parsed.detectedTerms
          : detectedTerms.map((item) => ({
              term: item.term,
              meaning: item.meaning,
              familyExpression: item.familyExpression,
              internalExpression: item.internalExpression,
            })),
      })
    } catch {
      return NextResponse.json(fallbackParse(raw))
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "AI添削中にエラーが発生しました。" },
      { status: 500 },
    )
  }
}
