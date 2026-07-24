import Link from "next/link"
import CompanyDashboard from "@/components/CompanyDashboard"
import UserMenu from "@/components/UserMenu"

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><Link href="/" className="text-sm font-black text-teal-700">← TOPへ戻る</Link><h1 className="mt-3 text-4xl font-black text-slate-950">企業管理画面</h1><p className="mt-2 text-slate-600">契約人数と職員の利用状況を確認できます。</p></div><UserMenu /></header>
        <CompanyDashboard />
      </div>
    </main>
  )
}
