import crypto from "crypto"
import { NextResponse } from "next/server"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { isPlanId, PLANS } from "@/lib/plans"

export const runtime = "nodejs"

type KomojuEvent = {
  id?: string
  type?: string
  data?: {
    id?: string
    status?: string
    session?: string
    metadata?: Record<string, string>
    payment?: {
      id?: string
      status?: string
      session?: string
      metadata?: Record<string, string>
    }
  }
}

async function sessionMetadata(sessionId: string | undefined) {
  if (!sessionId || !process.env.KOMOJU_SECRET_KEY) return {}
  const response = await fetch(`https://komoju.com/api/v1/sessions/${sessionId}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.KOMOJU_SECRET_KEY}:`).toString("base64")}`,
    },
    cache: "no-store",
  })
  if (!response.ok) return {}
  const session = (await response.json()) as { metadata?: Record<string, string> }
  return session.metadata ?? {}
}

function validSignature(raw: string, signature: string | null) {
  const secret = process.env.KOMOJU_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex")
  const supplied = signature.replace(/^sha256=/, "")
  return expected.length === supplied.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))
}

export async function POST(req: Request) {
  const raw = await req.text()
  if (!validSignature(raw, req.headers.get("x-komoju-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  try {
    const event = JSON.parse(raw) as KomojuEvent
    const payment = event.data?.payment ?? event.data
    const metadata = Object.keys(payment?.metadata ?? {}).length
      ? payment?.metadata ?? {}
      : await sessionMetadata(payment?.session)
    const uid = metadata.uid
    const planId = metadata.planId
    const captured =
      event.type === "payment.captured" ||
      event.type === "payment.completed" ||
      payment?.status === "captured"

    if (!captured || !uid || !isPlanId(planId)) {
      return NextResponse.json({ received: true })
    }

    const adminDb = getAdminDb()
    const eventRef = adminDb.doc(`paymentEvents/${event.id ?? payment?.id ?? crypto.randomUUID()}`)
    await adminDb.runTransaction(async (transaction) => {
      if ((await transaction.get(eventRef)).exists) return
      const userRef = adminDb.doc(`users/${uid}`)
      const userSnap = await transaction.get(userRef)
      const currentEndValue = userSnap.data()?.billing?.currentPeriodEnd
      const currentEnd =
        currentEndValue instanceof Timestamp ? currentEndValue.toDate() :
          currentEndValue?.toDate?.() ?? null
      const startsAt =
        currentEnd instanceof Date && currentEnd.getTime() > Date.now() ? currentEnd : new Date()
      const endsAt = new Date(startsAt)
      endsAt.setUTCDate(endsAt.getUTCDate() + PLANS[planId].durationDays)

      transaction.set(userRef, {
        billing: {
          status: "paid",
          currentPlan: planId,
          currentPeriodStart: Timestamp.fromDate(startsAt),
          currentPeriodEnd: Timestamp.fromDate(endsAt),
          komojuPaymentId: payment?.id ?? null,
          pendingPlan: null,
          updatedAt: FieldValue.serverTimestamp(),
        },
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
      transaction.create(eventRef, {
        uid,
        planId,
        type: event.type ?? null,
        createdAt: FieldValue.serverTimestamp(),
      })
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
