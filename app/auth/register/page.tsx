import Link from "next/link"
import AuthForm from "@/components/AuthForm"

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 px-5 py-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-bold text-emerald-700 hover:text-emerald-900">← TOPへ戻る</Link>
        <div className="mt-6">
          <AuthForm mode="register" />
        </div>
      </div>
    </main>
  )
}
