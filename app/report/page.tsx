import Link from "next/link"
import CareReportForm from "@/components/CareReportForm"
import UserMenu from "@/components/UserMenu"

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 px-5 py-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-emerald-100 bg-white/90 p-5 shadow-lg shadow-emerald-900/5 md:flex-row md:items-center md:justify-between md:p-7">
          <div>
            <Link href="/" className="text-sm font-bold text-emerald-700 hover:text-emerald-900">
              ← TOPへ戻る
            </Link>
            <h1 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">報告書AI添削</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              写真読み取りまたは手入力した報告文をもとに、添削ポイント・不足情報・家族向け報告・社内向け報告を作成します。
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
              MVP：会員登録＋写真読み取り＋履歴保存版
            </div>
            <UserMenu />
          </div>
        </header>

        <CareReportForm />
      </div>
    </main>
  )
}
