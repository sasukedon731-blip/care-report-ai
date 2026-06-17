"use client"

import { useEffect, useMemo, useState } from "react"
import { CareReportResult as Result } from "@/lib/reportTypes"

type HistoryItem = {
  id: string
  createdAt: string
  inputText: string
  result: Result
}

const HISTORY_KEY = "care-report-ai-history"

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value))
  } catch {
    return value
  }
}

function copyText(text: string) {
  if (typeof navigator === "undefined") return
  navigator.clipboard?.writeText(text)
}

export default function CareReportHistory() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [selectedId, setSelectedId] = useState<string>("")

  useEffect(() => {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    const parsed = raw ? (JSON.parse(raw) as HistoryItem[]) : []
    setItems(parsed)
    setSelectedId(parsed[0]?.id ?? "")
  }, [])

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0],
    [items, selectedId],
  )

  function clearHistory() {
    const ok = window.confirm("この端末に保存された履歴をすべて削除しますか？")
    if (!ok) return
    window.localStorage.removeItem(HISTORY_KEY)
    setItems([])
    setSelectedId("")
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-lg shadow-slate-900/5">
        <p className="text-4xl">📁</p>
        <h2 className="mt-4 text-xl font-black text-slate-900">履歴はまだありません</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          報告書をAI添削すると、この端末の履歴に自動保存されます。
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <aside className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-900">保存履歴</h2>
          <button
            type="button"
            onClick={clearHistory}
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
          >
            全削除
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                selected?.id === item.id
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <p className="text-xs font-black text-emerald-700">{formatDate(item.createdAt)}</p>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-700">{item.inputText}</p>
            </button>
          ))}
        </div>
      </aside>

      {selected ? (
        <section className="space-y-4">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
            <p className="text-xs font-black text-emerald-700">{formatDate(selected.createdAt)}</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">元の報告文</h2>
            <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
              {selected.inputText}
            </p>
          </div>

          {selected.result.detectedTerms?.length ? (
            <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 shadow-lg shadow-slate-900/5">
              <h2 className="text-xl font-black text-slate-900">介護用語の判定</h2>
              <div className="mt-3 space-y-3">
                {selected.result.detectedTerms.map((item, index) => (
                  <div key={`${item.term}-${index}`} className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm leading-7 text-emerald-950">
                    <p className="font-black">{item.term} → {item.meaning}</p>
                    <p><span className="font-bold">家族向け：</span>{item.familyExpression}</p>
                    <p><span className="font-bold">社内向け：</span>{item.internalExpression}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-black text-slate-900">家族向け報告</h2>
              <button
                type="button"
                onClick={() => copyText(selected.result.familyReport)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white"
              >
                コピー
              </button>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-slate-800">{selected.result.familyReport}</p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-black text-slate-900">社内向け報告</h2>
              <button
                type="button"
                onClick={() => copyText(selected.result.internalReport)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white"
              >
                コピー
              </button>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-slate-800">{selected.result.internalReport}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
              <h2 className="text-lg font-black text-slate-900">添削ポイント</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                {selected.result.points.map((point, index) => <li key={index}>{point}</li>)}
              </ul>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
              <h2 className="text-lg font-black text-slate-900">不足情報</h2>
              {selected.result.missing.length ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                  {selected.result.missing.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-600">大きな不足情報はありません。</p>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
