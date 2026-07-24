import Link from "next/link"
import Plans from "@/components/Plans"
import UserMenu from "@/components/UserMenu"

export default function PlansPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50 px-5 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="text-sm font-black text-teal-700">← TOPへ戻る</Link>
            <h1 className="mt-3 text-3xl font-black text-slate-950 md:text-5xl">料金プラン</h1>
            <p className="mt-3 text-slate-600">必要な期間だけ選べる、分かりやすい買い切り型プランです。</p>
          </div>
          <UserMenu />
        </header>
        <Plans />
      </div>
    </main>
  )
}
