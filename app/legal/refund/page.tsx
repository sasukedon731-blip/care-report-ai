import LegalPage from "@/components/LegalPage"

export default function RefundPage() {
  return (
    <LegalPage title="返金・キャンセル方針">
      <section><h2 className="text-xl font-black text-slate-950">基本方針</h2><p>本サービスは法人契約に基づいて提供するデジタルサービスです。契約成立・提供開始後の契約企業都合による返金、契約期間の短縮、日割り返金には対応していません。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">個別に確認する場合</h2><p>重複入金、入金後も当社の責めに帰すべき事情によりサービスを提供できない場合、または法令・契約上返金が必要な場合は個別に確認します。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">未入金の場合</h2><p>請求書記載の支払期限までに入金が確認できない場合、企業コードの発行・有効化を行わない、またはサービスを停止する場合があります。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">お問い合わせ先</h2><p>株式会社アウトインプラス<br />support@outin-plus.com</p></section>
    </LegalPage>
  )
}
