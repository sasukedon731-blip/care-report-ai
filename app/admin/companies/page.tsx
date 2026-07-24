import Link from "next/link"
import AdminCompanies from "@/components/AdminCompanies"
import UserMenu from "@/components/UserMenu"

export default function AdminCompaniesPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div><Link href="/" className="text-sm font-black text-teal-700">← TOPへ戻る</Link><h1 className="mt-3 text-4xl font-black text-slate-950">企業契約管理</h1><p className="mt-2 text-slate-600">企業コード・契約人数・利用期限・入金状態を管理します。</p></div>
          <UserMenu />
        </header>
        <AdminCompanies />
      </div>
    </main>
  )
}
