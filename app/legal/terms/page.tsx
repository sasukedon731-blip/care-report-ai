import LegalPage from "@/components/LegalPage"

export default function TermsPage() {
  return (
    <LegalPage title="利用規約">
      <section><h2 className="text-xl font-black text-slate-950">1. 適用</h2><p>本規約は、株式会社アウトインプラスが提供する「ケアレポAI」の利用条件を定めます。利用者は本規約に同意したうえで本サービスを利用します。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">2. アカウント</h2><p>利用者は正確な情報を登録し、認証情報を自己の責任で管理します。アカウントの貸与、譲渡、共用および第三者による不正利用を禁止します。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">3. 料金・期間・利用上限</h2><p>料金と利用期間は購入画面および特定商取引法に基づく表記のとおりです。自動更新はありません。AI添削は1日5回までで、毎日0:00（日本時間）にリセットされます。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">4. 介護記録の取扱い</h2><p>利用者は、個人情報・要配慮個人情報を入力する正当な権限を有し、所属施設の規程、本人同意および関係法令を遵守するものとします。不要な個人情報は入力しないでください。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">5. AI出力</h2><p>AI出力には誤りや不適切な表現が含まれる可能性があります。本サービスは医療判断、介護判断または正式記録の最終確認を代替しません。利用者は必ず内容を確認し、自らの責任で修正・利用してください。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">6. 禁止事項</h2><p>法令違反、権利侵害、不正アクセス、利用上限の回避、サービスの解析・妨害、第三者へのアカウント提供、虚偽情報の登録、その他当社が不適切と判断する行為を禁止します。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">7. 停止・変更</h2><p>保守、障害、外部サービスの停止、災害その他やむを得ない場合、当社はサービスの全部または一部を停止・変更できます。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">8. 免責・責任制限</h2><p>当社はAI出力の正確性、完全性、特定目的適合性を保証しません。当社の故意または重過失を除き、本サービスに関連して負う責任は、利用者が直近に支払った利用料金を上限とします。ただし法令上制限できない責任を除きます。</p></section>
      <section><h2 className="text-xl font-black text-slate-950">9. 準拠法・管轄</h2><p>本規約は日本法に準拠し、本サービスに関する紛争は東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p></section>
      <p>制定日：2026年7月24日</p>
    </LegalPage>
  )
}
