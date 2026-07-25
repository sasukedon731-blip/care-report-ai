"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth } from "@/lib/firebase"

type Props = {
  mode: "login" | "register"
}

export default function AuthForm({ mode }: Props) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyCode, setCompanyCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isRegister = mode === "register"

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (!email.trim() || !password.trim()) {
      setError("メールアドレスとパスワードを入力してください。")
      return
    }

    if (isRegister && !name.trim()) {
      setError("お名前を入力してください。")
      return
    }
    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください。")
      return
    }

    setLoading(true)

    try {
      if (isRegister) {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
        try {
          await updateProfile(credential.user, { displayName: name.trim() })
          const idToken = await credential.user.getIdToken(true)
          const response = await fetch("/api/account/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              name: name.trim(),
              companyCode: companyCode.trim(),
            }),
          })
          const data = await response.json()
          if (!response.ok) throw new Error(data.error ?? "会員情報を登録できませんでした。")
        } catch (registerError) {
          await deleteUser(credential.user).catch(() => undefined)
          throw registerError
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      }

      router.push("/mypage")
    } catch (err) {
      const message = err instanceof Error ? err.message : "認証に失敗しました。"
      if (message.includes("auth/email-already-in-use")) {
        setError("このメールアドレスはすでに登録されています。ログインしてください。")
      } else if (message.includes("auth/invalid-credential") || message.includes("auth/user-not-found") || message.includes("auth/wrong-password")) {
        setError("メールアドレスまたはパスワードが違います。")
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl rounded-[2rem] border border-emerald-100 bg-white/95 p-6 shadow-xl shadow-emerald-900/5 md:p-8">
      <p className="mb-3 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">
        {isRegister ? "会員登録" : "ログイン"}
      </p>
      <h1 className="text-3xl font-black text-slate-900">
        {isRegister ? "ケアレポAIをはじめる" : "ケアレポAIにログイン"}
      </h1>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {isRegister
          ? "本サービスは介護施設・法人向けです。勤務先から案内された企業コードを入力してください。"
          : "企業契約で登録したメールアドレスとパスワードを入力してください。"}
      </p>

      {isRegister ? (
        <>
        <label className="mt-6 block">
          <span className="text-sm font-black text-slate-800">お名前</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            placeholder="例：山田 太郎"
          />
        </label>
        <label className="mt-5 block rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <span className="text-sm font-black text-slate-900">企業コード</span>
          <span className="mt-1 block text-xs leading-6 text-slate-600">勤務先から案内されたコードを入力してください。企業コードをお持ちでない方は会員登録できません。</span>
          <input
            value={companyCode}
            onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
            className="mt-3 w-full rounded-2xl border border-blue-200 bg-white p-4 font-mono font-black uppercase tracking-wider text-slate-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            placeholder="例：OUTIN001"
            autoCapitalize="characters"
          />
        </label>
        <p className="mt-3 text-xs leading-6 text-slate-500">導入をご希望の施設は<Link href="/contact" className="ml-1 font-black text-teal-700 underline">お問い合わせ</Link>ください。</p>
        </>
      ) : null}

      <label className="mt-5 block">
        <span className="text-sm font-black text-slate-800">メールアドレス</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          placeholder="care@example.com"
        />
      </label>

      <label className="mt-5 block">
        <span className="text-sm font-black text-slate-800">パスワード</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          placeholder="6文字以上"
        />
      </label>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-2xl bg-emerald-600 px-6 py-4 text-base font-black text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? "処理中..." : isRegister ? "会員登録する" : "ログインする"}
      </button>

      <div className="mt-5 text-center text-sm text-slate-600">
        {isRegister ? (
          <>
            すでにアカウントがある場合は{" "}
            <Link href="/auth/login" className="font-black text-emerald-700 hover:text-emerald-900">ログイン</Link>
          </>
        ) : (
          <>
            アカウントがない場合は{" "}
            <Link href="/auth/register" className="font-black text-emerald-700 hover:text-emerald-900">会員登録</Link>
          </>
        )}
      </div>
    </form>
  )
}
