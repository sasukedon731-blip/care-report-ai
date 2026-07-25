import LegalPage from "@/components/LegalPage"

export default function TokushoPage() {
  return (
    <LegalPage title="特定商取引法に基づく表記">
      <dl className="grid gap-5 md:grid-cols-[180px_1fr]">
        <dt className="font-black text-slate-950">販売事業者</dt><dd>株式会社アウトインプラス</dd>
        <dt className="font-black text-slate-950">運営責任者</dt><dd>高野 倫之</dd>
        <dt className="font-black text-slate-950">所在地</dt><dd>東京都渋谷区道玄坂1丁目10-8 渋谷道玄坂東急ビル2F-C</dd>
        <dt className="font-black text-slate-950">電話番号</dt><dd>03-6820-3675<br />受付時間：平日10:00〜17:00（土日祝日・年末年始を除く）</dd>
        <dt className="font-black text-slate-950">お問い合わせ</dt><dd>support@outin-plus.com</dd>
        <dt className="font-black text-slate-950">販売価格</dt><dd>スターター（10アカウントまで）月額5,500円、スタンダード（30アカウントまで）月額15,000円、ビジネス（50アカウントまで）月額22,500円（すべて税込）。51アカウント以上は個別見積もりです。</dd>
        <dt className="font-black text-slate-950">商品代金以外の費用</dt><dd>インターネット接続料金および通信料金は利用者の負担となります。</dd>
        <dt className="font-black text-slate-950">支払方法・時期</dt><dd>銀行振込。請求書記載の期限までに、当社指定口座へお振り込みください。振込手数料は契約企業の負担となります。</dd>
        <dt className="font-black text-slate-950">提供時期</dt><dd>契約成立および入金確認後、企業コードを発行し利用可能にします。</dd>
        <dt className="font-black text-slate-950">利用期間</dt><dd>申込書、契約書または請求書等に記載した契約期間。継続条件は契約内容に従います。</dd>
        <dt className="font-black text-slate-950">利用回数</dt><dd>AI添削は1日5回まで。毎日0:00（日本時間）にリセットされ、未使用分は繰り越されません。</dd>
        <dt className="font-black text-slate-950">返品・キャンセル</dt><dd>デジタルサービスの性質上、提供開始後の返品・キャンセルはお受けしていません。重複決済や当社の責めに帰すべき不具合は個別に確認します。</dd>
        <dt className="font-black text-slate-950">動作環境</dt><dd>最新版のChrome、Safari、Edge等。当社はAI出力の完全性・正確性を保証するものではありません。</dd>
      </dl>
    </LegalPage>
  )
}
