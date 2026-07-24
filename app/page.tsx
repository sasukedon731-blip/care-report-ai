import Link from "next/link"
import UserMenu from "@/components/UserMenu"
import Image from "next/image"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50 px-5 py-8">
      <section className="mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center">
        <div className="mb-4 flex justify-end"><UserMenu /></div>
        <div className="grid items-center gap-8 rounded-[2.5rem] border border-teal-100 bg-white/95 p-6 shadow-2xl shadow-slate-900/5 md:grid-cols-[1fr_360px] md:p-12">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-teal-100 px-4 py-2 text-sm font-black text-teal-900">
              介護報告書AI添削アプリ
            </p>
            <h1 className="text-4xl font-black leading-tight text-slate-950 md:text-6xl">ケアレポAI</h1>
            <p className="mt-3 text-xl font-black text-teal-700">伝わる介護記録を、もっと速く。</p>
            <p className="mt-5 text-base leading-8 text-slate-700 md:text-lg">
              現場の報告文をAIが確認し、添削ポイント・不足情報・家族向け報告・社内向け報告に整理。写真からの文字読み取りにも対応しています。
            </p>
            <div className="mt-6 grid gap-3 text-sm font-bold text-slate-700 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">家族向けに<br />やさしく変換</div>
              <div className="rounded-2xl bg-slate-50 p-4">社内向けは<br />氏名・略語を維持</div>
              <div className="rounded-2xl bg-slate-50 p-4">履歴保存で<br />あとから確認</div>
            </div>
            <div className="mt-8 flex flex-col gap-3 md:flex-row">
              <Link href="/report" className="inline-flex w-full items-center justify-center rounded-2xl bg-teal-700 px-6 py-4 text-base font-black text-white shadow-lg transition hover:bg-teal-800 md:w-auto">
                報告書を添削する
              </Link>
              <Link href="/plans" className="inline-flex w-full items-center justify-center rounded-2xl border border-teal-200 bg-white px-6 py-4 text-base font-black text-teal-800 transition hover:bg-teal-50 md:w-auto">
                料金プランを見る
              </Link>
              <Link href="/mypage" className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-black text-slate-700 transition hover:bg-slate-50 md:w-auto">
                マイページ
              </Link>
              <Link href="/for-business" className="inline-flex w-full items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-6 py-4 text-base font-black text-blue-800 transition hover:bg-blue-100 md:w-auto">
                法人向け
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[360px]">
            <Image src="/icon-512.png" alt="ケアレポAI" width={512} height={512} priority className="h-auto w-full rounded-[28%] shadow-2xl shadow-teal-950/20" />
          </div>
        </div>
        <p className="mt-5 text-center text-xs leading-6 text-slate-500">AIの出力は必ず内容を確認してから介護記録やご家族への連絡に使用してください。</p>
      </section>
    </main>
  )
}
