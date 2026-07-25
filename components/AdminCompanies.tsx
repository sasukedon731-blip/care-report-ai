"use client"

import { useEffect, useState } from "react"
import { useAuth } from "./AuthProvider"

type Company = {
  companyCode: string
  companyName: string
  status: "pending" | "active" | "suspended"
  seatLimit: number
  memberCount: number
  contractStart: string | null
  contractEnd: string | null
  adminEmail: string
  planId: "starter10" | "standard30" | "business50" | "enterprise"
  planLabel: string
  pricePerSeat: number
  monthlyPrice: number
}

type CompanyForm = {
  companyCode: string
  companyName: string
  status: Company["status"]
  planId: Company["planId"]
  seatLimit: number
  monthlyPrice: number
  contractStart: string
  contractEnd: string
  adminEmail: string
}

const empty: CompanyForm = {
  companyCode: "",
  companyName: "",
  status: "pending" as const,
  planId: "starter10",
  seatLimit: 10,
  monthlyPrice: 5500,
  contractStart: "",
  contractEnd: "",
  adminEmail: "",
}

function inputDate(value: string | null) {
  return value ? value.slice(0, 10) : ""
}

export default function AdminCompanies() {
  const { user, loading: authLoading } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function request(method: "GET" | "POST" | "PATCH", body?: unknown) {
    if (!user) throw new Error("ログインが必要です。")
    const idToken = await user.getIdToken()
    const response = await fetch("/api/admin/companies", {
      method,
      headers: {
        Authorization: `Bearer ${idToken}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error ?? "処理に失敗しました。")
    return data
  }

  async function load() {
    setLoading(true)
    setError("")
    try {
      const data = await request("GET")
      setCompanies(data.companies ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "企業情報を取得できませんでした。")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) void load()
    if (!authLoading && !user) {
      setError("ログインが必要です。")
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user])

  async function save() {
    setSaving(true)
    setError("")
    try {
      await request(editing ? "PATCH" : "POST", form)
      setForm(empty)
      setEditing(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存できませんでした。")
    } finally {
      setSaving(false)
    }
  }

  function edit(company: Company) {
    const inferredPlan =
      company.planId ||
      (company.seatLimit === 10 ? "starter10" : company.seatLimit === 30 ? "standard30" : company.seatLimit === 50 ? "business50" : "enterprise")
    const inferredPrice =
      company.monthlyPrice ||
      (inferredPlan === "starter10" ? 5500 : inferredPlan === "standard30" ? 15000 : inferredPlan === "business50" ? 22500 : 0)
    setEditing(true)
    setForm({
      companyCode: company.companyCode,
      companyName: company.companyName,
      status: company.status,
      seatLimit: company.seatLimit,
      planId: inferredPlan,
      monthlyPrice: inferredPrice,
      contractStart: inputDate(company.contractStart),
      contractEnd: inputDate(company.contractEnd),
      adminEmail: company.adminEmail,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-2xl font-black text-slate-950">{editing ? "企業情報を編集" : "企業を新規登録"}</h2><p className="mt-1 text-sm text-slate-600">銀行振込を確認後、ステータスを「利用中」にします。</p></div>
          {editing ? <button onClick={() => { setEditing(false); setForm(empty) }} className="rounded-xl border px-4 py-2 text-sm font-black">新規登録に戻る</button> : null}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-black">企業名<input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="mt-2 w-full rounded-xl border p-3 font-normal" /></label>
          <label className="text-sm font-black">企業コード<input disabled={editing} value={form.companyCode} onChange={(e) => setForm({ ...form, companyCode: e.target.value.toUpperCase() })} placeholder="OUTIN001" className="mt-2 w-full rounded-xl border p-3 font-mono uppercase disabled:bg-slate-100" /></label>
          <label className="text-sm font-black">契約プラン<select value={form.planId} onChange={(e) => {
            const planId = e.target.value as Company["planId"]
            const presets = { starter10: [10, 5500], standard30: [30, 15000], business50: [50, 22500] } as const
            const preset = planId === "enterprise" ? null : presets[planId]
            setForm({ ...form, planId, ...(preset ? { seatLimit: preset[0], monthlyPrice: preset[1] } : {}) })
          }} className="mt-2 w-full rounded-xl border p-3 font-normal"><option value="starter10">スターター（10枠／5,500円）</option><option value="standard30">スタンダード（30枠／15,000円）</option><option value="business50">ビジネス（50枠／22,500円）</option><option value="enterprise">エンタープライズ（51枠以上）</option></select></label>
          {form.planId === "enterprise" ? <><label className="text-sm font-black">契約人数<input type="number" min={51} value={form.seatLimit} onChange={(e) => setForm({ ...form, seatLimit: Number(e.target.value) })} className="mt-2 w-full rounded-xl border p-3 font-normal" /></label><label className="text-sm font-black">月額（税込）<input type="number" min={1} value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: Number(e.target.value) })} className="mt-2 w-full rounded-xl border p-3 font-normal" /></label></> : <div className="rounded-xl bg-teal-50 p-4 text-sm"><p className="font-black text-teal-900">契約内容</p><p className="mt-1 text-teal-800">{form.seatLimit}アカウントまで／月額{form.monthlyPrice.toLocaleString("ja-JP")}円（税込）</p></div>}
          <label className="text-sm font-black">契約開始日<input type="date" value={form.contractStart} onChange={(e) => setForm({ ...form, contractStart: e.target.value })} className="mt-2 w-full rounded-xl border p-3 font-normal" /></label>
          <label className="text-sm font-black">契約終了日<input type="date" value={form.contractEnd} onChange={(e) => setForm({ ...form, contractEnd: e.target.value })} className="mt-2 w-full rounded-xl border p-3 font-normal" /></label>
          <label className="text-sm font-black">ステータス<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Company["status"] })} className="mt-2 w-full rounded-xl border p-3 font-normal"><option value="pending">入金待ち</option><option value="active">利用中</option><option value="suspended">停止中</option></select></label>
          <label className="text-sm font-black md:col-span-2">企業管理者のメールアドレス<input type="email" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} placeholder="admin@example.com" className="mt-2 w-full rounded-xl border p-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">このメールアドレスで企業コード登録した職員を企業管理者にします。</span></label>
        </div>
        <button onClick={save} disabled={saving} className="mt-5 rounded-2xl bg-teal-700 px-6 py-3 font-black text-white disabled:bg-slate-400">{saving ? "保存中..." : editing ? "変更を保存" : "企業を登録"}</button>
        {error ? <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="text-2xl font-black text-slate-950">登録企業</h2>
        {loading ? <p className="mt-5 text-sm font-bold text-slate-500">読み込み中...</p> : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead><tr className="border-b text-slate-500"><th className="p-3">企業</th><th className="p-3">企業コード</th><th className="p-3">プラン</th><th className="p-3">月額</th><th className="p-3">利用人数</th><th className="p-3">契約期限</th><th className="p-3">状態</th><th className="p-3"></th></tr></thead>
              <tbody>{companies.map((company) => (
                <tr key={company.companyCode} className="border-b border-slate-100">
                  <td className="p-3 font-black">{company.companyName}</td><td className="p-3 font-mono font-black">{company.companyCode}</td><td className="p-3">{company.planLabel || "旧契約"}</td><td className="p-3 font-black">{company.monthlyPrice ? `${company.monthlyPrice.toLocaleString("ja-JP")}円` : "未設定"}</td><td className="p-3">{company.memberCount} / {company.seatLimit}</td><td className="p-3">{inputDate(company.contractEnd) || "未設定"}</td><td className="p-3">{company.status === "active" ? "利用中" : company.status === "suspended" ? "停止中" : "入金待ち"}</td><td className="p-3"><button onClick={() => edit(company)} className="rounded-xl bg-slate-100 px-4 py-2 font-black">編集</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
