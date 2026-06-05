import Link from "next/link"
import MyPageReports from "@/components/MyPageReports"
import UserMenu from "@/components/UserMenu"

export default function MyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 px-5 py-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-emerald-100 bg-white/90 p-5 shadow-lg shadow-emerald-900/5 md:flex-row md:items-center md:justify-between md:p-7">
          <div>
            <Link href="/report" className="text-sm font-bold text-emerald-700 hover:text-emerald-900">
              ← 添削画面へ
            </Link>
            <h1 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">マイページ</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              ログイン中にAI添削した報告書の履歴を確認できます。家族向け・社内向け文章のコピーもできます。
            </p>
          </div>
          <UserMenu />
        </header>

        <MyPageReports />
      </div>
    </main>
  )
}
