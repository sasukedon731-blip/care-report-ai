import Link from "next/link"
import UserMenu from "@/components/UserMenu"

export default function ForBusinessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-teal-50 px-5 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-end"><UserMenu /></div>
        <section className="mt-8 rounded-[2.5rem] border border-blue-100 bg-white p-7 shadow-xl md:p-12">
          <p className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-black text-blue-800">介護施設・法人向け</p>
          <h1 className="mt-5 text-4xl font-black leading-tight text-slate-950 md:text-6xl">職員の介護記録を、<br />組織全体で分かりやすく。</h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-700">企業コードを職員へ案内するだけで利用開始。施設がまとめて支払い、職員個人の決済は不要です。管理画面から契約人数と利用状況を確認できます。</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {["1人あたり月額500円", "1人1日5回まで", "50アカウント以上は個別割引"].map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-5 text-center text-lg font-black text-slate-950">{item}</div>)}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-6"><h2 className="text-xl font-black">職員側</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700"><li>企業コードで簡単登録</li><li>個人での支払い不要</li><li>家族向け・社内向け文章を生成</li><li>写真読み取りと履歴保存</li></ul></div>
            <div className="rounded-2xl border border-slate-200 p-6"><h2 className="text-xl font-black">企業管理者側</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700"><li>契約枠と登録人数を確認</li><li>職員別の累計添削回数</li><li>最終利用日と未利用者を確認</li><li>CSV出力に対応</li></ul></div>
          </div>
          <div className="mt-8 rounded-2xl bg-slate-950 p-6 text-white md:flex md:items-center md:justify-between"><div><h2 className="text-2xl font-black">導入について相談する</h2><p className="mt-2 text-sm leading-7 text-slate-300">銀行振込での契約となります。50アカウント以上は契約人数に応じた割引をご案内します。</p></div><Link href="/contact" className="mt-5 inline-flex rounded-2xl bg-teal-500 px-6 py-4 font-black text-slate-950 md:mt-0">お問い合わせ</Link></div>
        </section>
      </div>
    </main>
  )
}
