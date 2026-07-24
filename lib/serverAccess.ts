import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin"
import { DAILY_USAGE_LIMIT } from "@/lib/plans"

export type AccessState = {
  uid: string
  active: boolean
  planId: string | null
  periodEnd: string | null
  usedToday: number
  remainingToday: number
}

export function tokyoDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

export async function verifyBearer(req: Request) {
  const header = req.headers.get("authorization") ?? ""
  if (!header.startsWith("Bearer ")) throw new Error("UNAUTHORIZED")
  return getAdminAuth().verifyIdToken(header.slice(7))
}

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate()
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate()
  }
  if (typeof value === "string") {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  return null
}

export async function getAccessState(uid: string): Promise<AccessState> {
  const adminDb = getAdminDb()
  const userSnap = await adminDb.doc(`users/${uid}`).get()
  const data = userSnap.data() ?? {}
  const periodEndDate = toDate(data.billing?.currentPeriodEnd)
  const active =
    data.billing?.status === "paid" &&
    Boolean(periodEndDate && periodEndDate.getTime() > Date.now())
  const dateKey = tokyoDateKey()
  const usageSnap = await adminDb.doc(`users/${uid}/dailyUsage/${dateKey}`).get()
  const usedToday = Number(usageSnap.data()?.count ?? 0)

  return {
    uid,
    active,
    planId: typeof data.billing?.currentPlan === "string" ? data.billing.currentPlan : null,
    periodEnd: periodEndDate?.toISOString() ?? null,
    usedToday,
    remainingToday: Math.max(0, DAILY_USAGE_LIMIT - usedToday),
  }
}

export async function consumeUsage(uid: string) {
  const adminDb = getAdminDb()
  const dateKey = tokyoDateKey()
  const userRef = adminDb.doc(`users/${uid}`)
  const usageRef = adminDb.doc(`users/${uid}/dailyUsage/${dateKey}`)

  return adminDb.runTransaction(async (transaction) => {
    const [userSnap, usageSnap] = await Promise.all([
      transaction.get(userRef),
      transaction.get(usageRef),
    ])
    const user = userSnap.data() ?? {}
    const periodEnd = toDate(user.billing?.currentPeriodEnd)
    const active =
      user.billing?.status === "paid" &&
      Boolean(periodEnd && periodEnd.getTime() > Date.now())

    if (!active) throw new Error("PAYMENT_REQUIRED")

    const count = Number(usageSnap.data()?.count ?? 0)
    if (count >= DAILY_USAGE_LIMIT) throw new Error("DAILY_LIMIT")

    transaction.set(
      usageRef,
      {
        count: count + 1,
        dateKey,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )

    return { usedToday: count + 1, remainingToday: DAILY_USAGE_LIMIT - count - 1 }
  })
}

export async function refundUsage(uid: string) {
  const adminDb = getAdminDb()
  const dateKey = tokyoDateKey()
  const usageRef = adminDb.doc(`users/${uid}/dailyUsage/${dateKey}`)
  await adminDb.runTransaction(async (transaction) => {
    const snap = await transaction.get(usageRef)
    const count = Number(snap.data()?.count ?? 0)
    if (count > 0) {
      transaction.set(usageRef, {
        count: count - 1,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
    }
  })
}
