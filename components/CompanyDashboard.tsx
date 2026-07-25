"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "./AuthProvider"

type Company = { companyCode: string; companyName: string; seatLimit: number; memberCount: number; contractEnd: string | null; status: string; planLabel: string; monthlyPrice: number }
type Member = { uid: string; name: string; email: string; role: string; totalCount: number; lastUsedAt: string | null; createdAt: string | null }

function date(value: string | null) {
  return value ? new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "未利用"
}

function safeCsv(value: unknown) {
  const text = String(value ?? "")
  const protectedText = /^[=+\-@]/.test(text) ? `'${text}` : text
  return `"${protectedText.replace(/"/g, '""')}"`
}

export default function CompanyDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { setError("ログインが必要です。"); setLoading(false); return }
    void (async () => {
      try {
        const token = await user.getIdToken()
        const response = await fetch("/api/company/members", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error ?? "取得できませんでした。")
        setCompany(data.company)
        setMembers(data.members ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "取得できませんでした。")
      } finally { setLoading(false) }
    })()
  }, [authLoading, user])

  const activeMembers = useMemo(() => members.filter((member) => member.totalCount > 0).length, [members])

  function downloadCsv() {
    if (!company) return
    const rows = [
      ["氏名", "メールアドレス", "権限", "累計添削回数", "最終利用日"],
      ...members.map((m) => [m.name, m.email, m.role, m.totalCount, m.lastUsedAt ? date(m.lastUsedAt) : "未利用"]),
    ]
    const csv = "\uFEFF" + rows.map((row) => row.map(safeCsv).join(",")).join("\r\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${company.companyCode}-利用状況.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="rounded-2xl bg-white p-8 text-center font-black text-slate-500">読み込み中...</div>
  if (error) return <div className="rounded-2xl bg-red-50 p-6 font-bold text-red-700">{error}</div>
  if (!company) return null

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {[["契約人数", `${company.seatLimit}人`], ["登録済み", `${company.memberCount}人`], ["残り枠", `${Math.max(0, company.seatLimit - company.memberCount)}人`], ["利用経験あり", `${activeMembers}人`]].map(([label, value]) => <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-slate-950">{value}</p></div>)}
      </section>
      <section className="rounded-[2rem] border bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-black text-slate-950">{company.companyName}</h2><p className="mt-1 text-sm text-slate-600">企業コード：<span className="font-mono font-black">{company.companyCode}</span> ／ {company.planLabel || "法人契約"} ／ 契約期限：{company.contractEnd?.slice(0, 10) ?? "未設定"}</p></div><button onClick={downloadCsv} className="rounded-2xl bg-teal-700 px-5 py-3 font-black text-white">CSV出力</button></div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="p-3">職員</th><th className="p-3">メール</th><th className="p-3">累計添削</th><th className="p-3">最終利用</th><th className="p-3">状態</th></tr></thead><tbody>
            {members.map((member) => <tr key={member.uid} className="border-b border-slate-100"><td className="p-3 font-black">{member.name}{member.role === "company_admin" ? <span className="ml-2 rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">管理者</span> : null}</td><td className="p-3">{member.email}</td><td className="p-3 font-black">{member.totalCount}回</td><td className="p-3">{date(member.lastUsedAt)}</td><td className="p-3">{member.totalCount === 0 ? "未利用" : "利用中"}</td></tr>)}
          </tbody></table>
          {members.length === 0 ? <p className="py-10 text-center text-sm font-bold text-slate-500">登録職員はまだいません。</p> : null}
        </div>
      </section>
    </div>
  )
}
