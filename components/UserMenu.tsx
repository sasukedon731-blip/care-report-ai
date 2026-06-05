"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "./AuthProvider"

export default function UserMenu() {
  const router = useRouter()
  const { user, loading } = useAuth()

  async function handleLogout() {
    await signOut(auth)
    router.push("/")
  }

  if (loading) return null

  if (!user) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href="/auth/login" className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-center text-sm font-black text-emerald-700 hover:bg-emerald-50">
          ログイン
        </Link>
        <Link href="/auth/register" className="rounded-2xl bg-emerald-600 px-4 py-3 text-center text-sm font-black text-white hover:bg-emerald-700">
          無料登録
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Link href="/mypage" className="rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-800 hover:bg-emerald-100">
        マイページ
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
      >
        ログアウト
      </button>
    </div>
  )
}
