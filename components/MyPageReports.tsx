"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { CareReportHistoryItem } from "@/lib/reportTypes"
import { useAuth } from "./AuthProvider"

type FirestoreReport = Omit<CareReportHistoryItem, "createdAt"> & {
  createdAt?: { toDate?: () => Date } | string
}

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

function normalizeDate(value: FirestoreReport["createdAt"]) {
  if (!value) return new Date().toISOString()
  if (typeof value === "string") return value
  if (typeof value.toDate === "function") return value.toDate().toISOString()
  return new Date().toISOString()
}

function copyText(text: string) {
  if (typeof navigator === "undefined") return
  navigator.clipboard?.writeText(text)
}

export default function MyPageReports() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [items, setItems] = useState<CareReportHistoryItem[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push("/auth/login")
      return
    }

    async function loadReports() {
      if (!user) return
      setFetching(true)
      setError("")
      try {
        const reportQuery = query(
          collection(db, "users", user.uid, "reports"),
          orderBy("createdAt", "desc"),
          limit(50),
        )
        const snapshot = await getDocs(reportQuery)
        const next = snapshot.docs.map((reportDoc) => {
          const data = reportDoc.data() as FirestoreReport
          return {
            id: reportDoc.id,
            inputText: data.inputText,
            result: data.result,
            createdAt: normalizeDate(data.createdAt),
            userId: user.uid,
          }
        })
        setItems(next)
        setSelectedId(next[0]?.id ?? "")
      } catch (err) {
        setError(err instanceof Error ? err.message : "履歴の取得に失敗しました。")
      } finally {
        setFetching(false)
      }
    }

    loadReports()
  }, [loading, router, user])

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0],
    [items, selectedId],
  )

  async function deleteSelected() {
    if (!user || !selected) return
    const ok = window.confirm("この履歴を削除しますか？")
    if (!ok) return
    await deleteDoc(doc(db, "users", user.uid, "reports", selected.id))
    const next = items.filter((item) => item.id !== selected.id)
    setItems(next)
    setSelectedId(next[0]?.id ?? "")
  }

  if (loading || fetching) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-lg shadow-slate-900/5">
        <p className="text-sm font-black text-emerald-700">履歴を読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-sm font-bold leading-7 text-red-700">
        {error}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-lg shadow-slate-900/5">
        <p className="text-4xl">📁</p>
        <h2 className="mt-4 text-xl font-black text-slate-900">マイページ履歴はまだありません</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          ログインした状態で報告書をAI添削すると、ここに自動保存されます。
        </p>
        <Link href="/report" className="mt-6 inline-flex rounded-2xl bg-emerald-600 px-6 py-4 font-black text-white">
          報告書を添削する
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <aside className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5">
        <div className="mb-4">
          <p className="text-sm font-bold text-slate-500">保存件数</p>
          <p className="text-3xl font-black text-slate-900">{items.length}<span className="ml-1 text-base">件</span></p>
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black text-emerald-700">{formatDate(selected.createdAt)}</p>
                <h2 className="mt-2 text-xl font-black text-slate-900">元の報告文</h2>
              </div>
              <button type="button" onClick={deleteSelected} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700">
                この履歴を削除
              </button>
            </div>
            <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
              {selected.inputText}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[2rem] border border-emerald-200 bg-white p-5 shadow-lg shadow-slate-900/5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-black text-slate-900">家族向け報告</h2>
                <button type="button" onClick={() => copyText(selected.result.familyReport)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white">コピー</button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-slate-800">{selected.result.familyReport}</p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-black text-slate-900">社内向け報告</h2>
                <button type="button" onClick={() => copyText(selected.result.internalReport)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white">コピー</button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-slate-800">{selected.result.internalReport}</p>
            </div>
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
