import Link from "next/link"

export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
      <main className="min-h-screen bg-slate-50 px-5 py-10">
        <article className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg md:p-10">
          <Link href="/" className="text-sm font-black text-teal-700">← TOPへ戻る</Link>
          <h1 className="mt-4 text-3xl font-black text-slate-950">{title}</h1>
          <div className="legal-content mt-8 space-y-7 text-sm leading-8 text-slate-700">{children}</div>
        </article>
      </main>
  )
}
