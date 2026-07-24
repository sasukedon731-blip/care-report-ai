"use client"

import Link from "next/link"
import { useState } from "react"
import { PLANS, PlanId } from "@/lib/plans"
import { useAuth } from "./AuthProvider"
import BillingStatus from "./BillingStatus"
import { useAccess } from "./AccessProvider"

const planOrder: PlanId[] = ["month1", "month6", "month12"]

export default function Plans() {
  const { user, loading: authLoading } = useAuth()
  const access = useAccess()
  const [processing, setProcessing] = useState<PlanId | null>(null)
  const [error, setError] = useState("")

  async function checkout(planId: PlanId) {
    setError("")
    if (!user) return
    setProcessing(planId)
    try {
      const idToken = await user.getIdToken()
      const response = await fetch("/api/komoju/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ planId }),
      })
      const data = await response.json()
      if (!response.ok || !data.url) throw new Error(data.error ?? "決済画面を開けませんでした。")
      window.location.assign(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "決済画面を開けませんでした。")
      setProcessing(null)
    }
  }

  return (
    <div>
      <BillingStatus />
      {access.accountType === "company" ? (
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm font-bold leading-7 text-blue-950">
          企業契約ユーザーは勤務先の契約で利用できるため、個人プランの購入は必要ありません。
        </div>
      ) : null}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {planOrder.map((planId) => {
          const plan = PLANS[planId]
          const monthly = Math.round(plan.price / (plan.durationDays / 30))
          return (
            <section key={planId} className={`relative rounded-[2rem] border bg-white p-6 shadow-xl shadow-slate-900/5 ${planId === "month6" ? "border-teal-400 ring-4 ring-teal-100" : "border-slate-200"}`}>
              {planId === "month6" ? <span className="absolute -top-3 left-6 rounded-full bg-teal-600 px-4 py-1 text-xs font-black text-white">おすすめ</span> : null}
              <h2 className="text-2xl font-black text-slate-900">{plan.label}</h2>
              <p className="mt-4 text-4xl font-black text-slate-950">¥{plan.price.toLocaleString("ja-JP")}</p>
              <p className="mt-2 text-sm font-bold text-slate-500">税込・期間中の追加料金なし</p>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                <p>1日5回までAI添削</p>
                <p>写真からの文字読み取り</p>
                <p>履歴保存・文章コピー</p>
                {planId !== "month1" ? <p className="font-black text-teal-700">1か月あたり約¥{monthly.toLocaleString("ja-JP")}</p> : null}
              </div>
              {user && access.accountType !== "company" ? (
                <button
                  type="button"
                  onClick={() => checkout(planId)}
                  disabled={Boolean(processing)}
                  className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 font-black text-white transition hover:bg-teal-700 disabled:bg-slate-400"
                >
                  {processing === planId ? "決済画面を準備中..." : `${plan.label}プランを購入`}
                </button>
              ) : !user ? (
                <Link href="/auth/register" className="mt-6 flex w-full justify-center rounded-2xl bg-slate-950 px-5 py-4 font-black text-white">
                  会員登録して購入
                </Link>
              ) : <div className="mt-6 rounded-2xl bg-slate-100 px-5 py-4 text-center font-black text-slate-500">企業契約で利用中</div>}
            </section>
          )
        })}
      </div>
      {error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
        <p className="font-black text-slate-900">購入前にご確認ください</p>
        <p>各プランは自動更新ではありません。利用期限後も継続する場合は、あらためて購入してください。購入済み期間が残っている場合は、新しい期間がその後に追加されます。</p>
        <p>利用回数は毎日0:00（日本時間）にリセットされ、未使用分の繰り越しはありません。</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href="/legal/tokusho" className="font-black text-teal-700 underline">特定商取引法に基づく表記</Link>
          <Link href="/legal/terms" className="font-black text-teal-700 underline">利用規約</Link>
          <Link href="/legal/refund" className="font-black text-teal-700 underline">返金方針</Link>
        </div>
      </div>
    </div>
  )
}
