"use client"

import { ChangeEvent, useMemo, useState } from "react"
import Link from "next/link"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import CareReportResult from "./CareReportResult"
import { CareReportResult as Result } from "@/lib/reportTypes"
import { useAuth } from "./AuthProvider"
import { db } from "@/lib/firebase"

type OcrResult = {
  text: string
  warnings?: string[]
}

type HistoryItem = {
  id: string
  createdAt: string
  inputText: string
  result: Result
}

const sampleText =
  "田中花子様、昼食8割。午後レク参加。KOTあり。BT36.5。食介一部介助。特変なし。"

const MAX_IMAGE_SIZE_MB = 8
const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024
const HISTORY_KEY = "care-report-ai-history"
const MAX_HISTORY_COUNT = 30

function stripBase64Prefix(dataUrl: string) {
  return dataUrl.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "")
}

function saveLocalHistory(inputText: string, result: Result) {
  if (typeof window === "undefined") return

  const raw = window.localStorage.getItem(HISTORY_KEY)
  const current = raw ? (JSON.parse(raw) as HistoryItem[]) : []
  const next: HistoryItem[] = [
    {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      inputText,
      result,
    },
    ...current,
  ].slice(0, MAX_HISTORY_COUNT)

  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
}

export default function CareReportForm() {
  const { user } = useAuth()
  const [inputText, setInputText] = useState("")
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [error, setError] = useState("")
  const [ocrError, setOcrError] = useState("")
  const [imageDataUrl, setImageDataUrl] = useState("")
  const [imageMimeType, setImageMimeType] = useState("")
  const [ocrWarnings, setOcrWarnings] = useState<string[]>([])
  const [savedMessage, setSavedMessage] = useState("")

  const hasImage = useMemo(() => Boolean(imageDataUrl && imageMimeType), [imageDataUrl, imageMimeType])

  function resetOcrState() {
    setOcrError("")
    setOcrWarnings([])
  }

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    resetOcrState()
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      setOcrError("画像ファイルを選択してください。")
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setOcrError(`画像サイズは${MAX_IMAGE_SIZE_MB}MB以下にしてください。`)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "")
      setImageDataUrl(dataUrl)
      setImageMimeType(file.type)
    }
    reader.onerror = () => setOcrError("画像の読み込みに失敗しました。")
    reader.readAsDataURL(file)
  }

  async function handleOcr() {
    resetOcrState()
    setSavedMessage("")

    if (!hasImage) {
      setOcrError("先に報告書の写真を選択してください。")
      return
    }

    setOcrLoading(true)

    try {
      const res = await fetch("/api/ai/care-report-ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: stripBase64Prefix(imageDataUrl),
          mimeType: imageMimeType,
        }),
      })

      const data = (await res.json()) as OcrResult & { error?: string }

      if (!res.ok) {
        throw new Error(data?.error ?? "写真の読み取りに失敗しました。")
      }

      setInputText(data.text ?? "")
      setOcrWarnings(data.warnings ?? [])
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : "写真の読み取りに失敗しました。")
    } finally {
      setOcrLoading(false)
    }
  }

  async function handleSubmit() {
    setError("")
    setSavedMessage("")
    setResult(null)

    const cleanText = inputText.trim()

    if (cleanText.length < 5) {
      setError("報告文を5文字以上入力してください。")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/ai/care-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputText: cleanText }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error ?? "添削に失敗しました。")
      }

      setResult(data)

      if (user) {
        await addDoc(collection(db, "users", user.uid, "reports"), {
          inputText: cleanText,
          result: data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        setSavedMessage("この添削結果をマイページの履歴に保存しました。")
      } else {
        saveLocalHistory(cleanText, data)
        setSavedMessage("ログインしていないため、この端末の履歴に保存しました。会員登録するとマイページに保存できます。")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "添削に失敗しました。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 md:p-7">
        <div className="mb-5">
          <p className="mb-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
            写真読み取り＋会員履歴保存版
          </p>
          <h2 className="text-xl font-black text-slate-900">報告文を入力</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            紙の報告書を撮影して読み取るか、手入力で報告文を入れてください。社内向けでは氏名をそのまま残し、KOT・BT・BPなどの介護略語も現場向けに整理します。家族向けでは略語を分かりやすい表現に変換します。
          </p>
        </div>

        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
          社内利用を想定して、利用者名はそのまま残せます。外部共有する場合は、住所・電話番号など不要な個人情報を入力しないでください。
        </div>

        {!user ? (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-900">
            マイページに履歴を残すにはログインが必要です。
            <Link href="/auth/register" className="ml-1 font-black underline">無料会員登録</Link>
            <span> / </span>
            <Link href="/auth/login" className="font-black underline">ログイン</Link>
          </div>
        ) : null}

        <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="block text-sm font-black text-slate-800">報告書の写真を撮る / 選ぶ</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="mt-3 block w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:font-bold file:text-white"
          />

          {imageDataUrl ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageDataUrl} alt="読み取り対象の報告書" className="max-h-72 w-full object-contain" />
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleOcr}
              disabled={ocrLoading || !hasImage}
              className="rounded-2xl bg-slate-900 px-5 py-3 font-black text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {ocrLoading ? "写真を読み取り中..." : "写真から文字を読み取る"}
            </button>
            <button
              type="button"
              onClick={() => {
                setImageDataUrl("")
                setImageMimeType("")
                resetOcrState()
              }}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
            >
              写真をクリア
            </button>
          </div>

          {ocrWarnings.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-7 text-yellow-900">
              <p className="font-black">読み取り時の注意</p>
              <ul className="mt-2 list-disc pl-5">
                {ocrWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {ocrError ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {ocrError}
            </div>
          ) : null}
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="例：田中花子様、昼食8割。午後レク参加。KOTあり。BT36.5。食介一部介助。特変なし。"
          className="min-h-[260px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base leading-8 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || ocrLoading}
            className="rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "AI添削中..." : "AIで添削する"}
          </button>
          <button
            type="button"
            onClick={() => setInputText(sampleText)}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
          >
            サンプルを入れる
          </button>
        </div>

        {savedMessage ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
            {savedMessage}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        ) : null}
      </section>

      <CareReportResult result={result} loading={loading} />
    </div>
  )
}
