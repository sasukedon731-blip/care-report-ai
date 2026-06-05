import Link from "next/link"
import CareReportHistory from "@/components/CareReportHistory"

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 px-5 py-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-emerald-100 bg-white/90 p-5 shadow-lg shadow-emerald-900/5 md:flex-row md:items-center md:justify-between md:p-7">
          <div>
            <Link href="/mypage" className="text-sm font-bold text-emerald-700 hover:text-emerald-900">
              ← マイページへ
            </Link>
            <h1 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">端末内の添削履歴</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              ログインせずに使った場合の、この端末に保存された添削結果を確認できます。会員履歴はマイページで確認してください。
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-800">
            会員登録後の履歴はマイページに保存されます。
          </div>
        </header>

        <CareReportHistory />
      </div>
    </main>
  )
}
