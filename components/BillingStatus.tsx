"use client"

import Link from "next/link"
import { DAILY_USAGE_LIMIT, PLANS, PlanId } from "@/lib/plans"
import { useAuth } from "./AuthProvider"
import { useAccess } from "./AccessProvider"

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value))
}

export default function BillingStatus() {
  const { user, loading: authLoading } = useAuth()
  const access = useAccess()

  if (authLoading || access.loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-500">利用状況を確認中...</div>
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-950">
        利用するには会員登録とプラン購入が必要です。
        <Link href="/auth/register" className="ml-1 font-black underline">会員登録へ</Link>
      </div>
    )
  }

  if (!access.active) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
        現在、有効な利用プランがありません。
        <Link href="/plans" className="ml-1 font-black underline">料金プランを見る</Link>
      </div>
    )
  }

  if (access.accountType === "company") {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-black">企業契約で利用中</p>
          <p className="font-black">本日あと {access.remainingToday} / {DAILY_USAGE_LIMIT} 回</p>
        </div>
        <p className="mt-1 text-xs font-bold text-blue-800">{access.companyName} ／ 企業コード：{access.companyCode} ／ 利用期限：{formatDate(access.periodEnd)}</p>
      </div>
    )
  }

  const plan = access.planId && access.planId in PLANS ? PLANS[access.planId as PlanId] : null
  return (
    <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-black">{plan?.label ?? "有料"}プラン利用中</p>
        <p className="font-black">本日あと {access.remainingToday} / {DAILY_USAGE_LIMIT} 回</p>
      </div>
      <p className="mt-1 text-xs font-bold text-teal-800">利用期限：{formatDate(access.periodEnd)} ／ 回数は毎日0:00（日本時間）にリセット</p>
    </div>
  )
}
