import { NextResponse } from "next/server"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin"
import { isPlanId, PLANS } from "@/lib/plans"
import { verifyBearer } from "@/lib/serverAccess"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const token = await verifyBearer(req)
    const { planId } = (await req.json()) as { planId?: string }
    if (!isPlanId(planId)) {
      return NextResponse.json({ error: "料金プランが正しくありません。" }, { status: 400 })
    }
    if (!process.env.KOMOJU_SECRET_KEY || !process.env.NEXT_PUBLIC_APP_URL) {
      return NextResponse.json({ error: "決済設定が完了していません。" }, { status: 500 })
    }

    const plan = PLANS[planId]
    const user = await adminAuthUser(token.uid)
    const response = await fetch("https://komoju.com/api/v1/sessions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.KOMOJU_SECRET_KEY}:`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: plan.price,
        currency: "JPY",
        default_locale: "ja",
        email: user.email ?? undefined,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/complete`,
        metadata: {
          uid: token.uid,
          planId,
          durationDays: String(plan.durationDays),
          product: "care-report-ai",
        },
      }),
    })

    const session = (await response.json()) as { id?: string; session_url?: string; url?: string; error?: { message?: string } }
    if (!response.ok || !(session.session_url ?? session.url)) {
      console.error("KOMOJU session error", response.status, session.error?.message)
      return NextResponse.json({ error: "決済画面を準備できませんでした。" }, { status: 502 })
    }

    await getAdminDb().doc(`users/${token.uid}`).set(
      {
        billing: {
          pendingPlan: planId,
          komojuSessionId: session.id ?? null,
          updatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true },
    )

    return NextResponse.json({ url: session.session_url ?? session.url })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 })
    }
    console.error(error)
    return NextResponse.json({ error: "決済処理でエラーが発生しました。" }, { status: 500 })
  }
}

async function adminAuthUser(uid: string) {
  return getAdminAuth().getUser(uid)
}
