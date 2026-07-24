import LegalPage from "@/components/LegalPage"

export default function PrivacyPage() {
  return (
    <LegalPage title="プライバシーポリシー">
      <section><h2 className="text-xl font-black text-slate-950">取得する情報</h2><p>当社は、氏名、メールアドレス、認証情報、決済状況、利用回数、入力された報告文・画像、AI出力、利用履歴、端末・通信に関する情報を、サービス提供に必要な範囲で取得します。カード番号等の決済情報は決済事業者が管理し、当社は保持しません。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">利用目的</h2><p>本人確認、サービス提供、AIによる文章処理、履歴保存、決済・利用期限管理、不正利用防止、お問い合わせ対応、品質・安全性の改善、法令遵守のために利用します。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">AI処理と外部送信</h2><p>入力された文章や画像は、AI添削・文字読み取りを行うため、当社が利用するAIサービス提供者へ送信される場合があります。法令または契約に基づく場合を除き、AIモデルの学習目的での利用を前提として提供するものではありません。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">要配慮情報・個人情報</h2><p>介護記録には健康状態等の機微な情報が含まれる場合があります。施設の規程と本人同意等を確認し、サービス利用に不要な住所・電話番号・保険証番号等は入力しないでください。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">安全管理・第三者提供</h2><p>当社はアクセス制御その他の合理的な安全管理措置を講じます。法令に基づく場合およびサービス提供に必要な委託先への提供を除き、本人の同意なく第三者へ提供しません。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">開示等・お問い合わせ</h2><p>保有個人データの開示、訂正、利用停止、削除等については support@outin-plus.com へご連絡ください。本人確認後、法令に従い対応します。</p></section>
      <p>制定日：2026年7月24日</p>
    </LegalPage>
  )
}
