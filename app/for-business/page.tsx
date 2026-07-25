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
          <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-700">企業コードを職員へ案内するだけで利用開始。介護施設がまとめて契約し、職員個人の決済はありません。管理画面から契約人数と利用状況を確認できます。</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[{name:"スターター",seats:"10アカウントまで",unit:"1アカウント550円",price:"月額5,500円"},{name:"スタンダード",seats:"30アカウントまで",unit:"1アカウント500円",price:"月額15,000円"},{name:"ビジネス",seats:"50アカウントまで",unit:"1アカウント450円",price:"月額22,500円"}].map((plan) => <div key={plan.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-black text-teal-700">{plan.name}</p><p className="mt-3 text-xl font-black text-slate-950">{plan.seats}</p><p className="mt-2 text-sm font-bold text-slate-500">{plan.unit}</p><p className="mt-4 text-2xl font-black text-slate-950">{plan.price}<span className="text-sm">（税込）</span></p></div>)}
          </div>
          <p className="mt-4 text-center text-sm font-bold text-slate-600">51アカウント以上は、契約人数・利用期間に応じて個別にお見積もりします。</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-6"><h2 className="text-xl font-black">職員側</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700"><li>企業コードで簡単登録</li><li>個人での支払い不要</li><li>家族向け・社内向け文章を生成</li><li>写真読み取りと履歴保存</li></ul></div>
            <div className="rounded-2xl border border-slate-200 p-6"><h2 className="text-xl font-black">企業管理者側</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700"><li>契約枠と登録人数を確認</li><li>職員別の累計添削回数</li><li>最終利用日と未利用者を確認</li><li>CSV出力に対応</li></ul></div>
          </div>
          <div className="mt-8 rounded-2xl bg-slate-950 p-6 text-white md:flex md:items-center md:justify-between"><div><h2 className="text-2xl font-black">導入について相談する</h2><p className="mt-2 text-sm leading-7 text-slate-300">法人契約は銀行振込でのお支払いとなります。ご入金確認後、企業コードを発行します。</p></div><Link href="/contact" className="mt-5 inline-flex rounded-2xl bg-teal-500 px-6 py-4 font-black text-slate-950 md:mt-0">お問い合わせ</Link></div>
        </section>
      </div>
    </main>
  )
}
