import Link from "next/link"
import UserMenu from "@/components/UserMenu"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 px-5 py-8">
      <section className="mx-auto flex min-h-[80vh] max-w-4xl flex-col justify-center">
        <div className="mb-4 flex justify-end"><UserMenu /></div>
        <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-xl shadow-emerald-900/5 md:p-10">
          <p className="mb-3 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
            介護報告書AI添削アプリ 会員版MVP
          </p>
          <h1 className="text-3xl font-black leading-tight text-slate-900 md:text-5xl">
            ケアレポAI
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-700 md:text-lg">
            現場で書いた報告文をAIが確認し、添削ポイント・不足情報・家族向け報告・社内向け報告に整理します。
          </p>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
            <strong>入力前の注意：</strong>
            利用者の氏名、住所、電話番号、具体的な病名などの個人情報は入力せず、「A様」「B様」のように置き換えてください。
          </div>

          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <Link
              href="/report"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-6 py-4 text-base font-black text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-700 md:w-auto"
            >
              報告書を添削する
            </Link>
            <Link
              href="/mypage"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-emerald-200 bg-white px-6 py-4 text-base font-black text-emerald-700 transition hover:bg-emerald-50 md:w-auto"
            >
              マイページで履歴を見る
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
