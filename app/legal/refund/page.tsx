import LegalPage from "@/components/LegalPage"

export default function RefundPage() {
  return (
    <LegalPage title="返金・キャンセル方針">
      <section><h2 className="text-xl font-black text-slate-950">基本方針</h2><p>本サービスは決済完了後に利用権が付与されるデジタルサービスです。提供開始後の利用者都合による返金、期間変更、日割り返金には対応していません。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">個別に確認する場合</h2><p>重複決済、決済後も当社のシステム不具合により利用権が付与されない場合、または法令上返金が必要な場合は、決済日・登録メールアドレス・決済内容を添えてお問い合わせください。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">コンビニ決済</h2><p>支払期限を過ぎた未入金の申し込みは自動的に失効し、利用権は付与されません。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">お問い合わせ先</h2><p>株式会社アウトインプラス<br />support@outin-plus.com</p></section>
    </LegalPage>
  )
}
