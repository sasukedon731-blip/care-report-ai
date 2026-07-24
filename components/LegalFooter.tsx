import Link from "next/link"

const links = [
  ["法人向け", "/for-business"],
  ["特定商取引法に基づく表記", "/legal/tokusho"],
  ["利用規約", "/legal/terms"],
  ["プライバシーポリシー", "/legal/privacy"],
  ["返金方針", "/legal/refund"],
  ["お問い合わせ", "/contact"],
] as const

export default function LegalFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-slate-600">
          {links.map(([label, href]) => <Link key={href} href={href} className="hover:text-teal-700">{label}</Link>)}
        </div>
        <p className="mt-5 text-xs text-slate-500">© 株式会社アウトインプラス</p>
      </div>
    </footer>
  )
}
