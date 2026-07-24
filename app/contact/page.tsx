import LegalPage from "@/components/LegalPage"

export default function ContactPage() {
  return (
    <LegalPage title="お問い合わせ">
      <section>
        <p>サービス、決済、アカウントに関するお問い合わせは、下記メールアドレスへご連絡ください。</p>
        <div className="mt-5 rounded-2xl bg-teal-50 p-5">
          <p className="font-black text-slate-950">株式会社アウトインプラス</p>
          <p>support@outin-plus.com</p>
          <p>03-6820-3675</p>
          <p>受付時間：平日10:00〜17:00（土日祝日・年末年始を除く）</p>
        </div>
        <p className="mt-5">決済に関するお問い合わせでは、登録メールアドレス、決済日、購入プランを記載してください。パスワードやカード番号は送信しないでください。</p>
      </section>
    </LegalPage>
  )
}
