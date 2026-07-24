import Link from "next/link"

export default function PaymentCompletePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-teal-50 to-white px-5">
      <section className="w-full max-w-xl rounded-[2rem] border border-teal-200 bg-white p-8 text-center shadow-xl">
        <div className="text-5xl">✓</div>
        <h1 className="mt-4 text-3xl font-black text-slate-950">お申し込みを受け付けました</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          カード決済は通常すぐに反映されます。コンビニ決済は入金確認後に利用可能になります。反映まで少し時間がかかる場合は、数分後にマイページを開き直してください。
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/report" className="rounded-2xl bg-teal-700 px-6 py-4 font-black text-white">添削画面へ</Link>
          <Link href="/mypage" className="rounded-2xl border border-slate-200 px-6 py-4 font-black text-slate-700">マイページへ</Link>
        </div>
      </section>
    </main>
  )
}
