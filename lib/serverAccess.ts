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
  accountType: "personal" | "company"
  companyCode: string | null
  companyName: string | null
  role: string
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

function toIso(value: unknown) {
  return toDate(value)?.toISOString() ?? null
}

function companyIsActive(data: Record<string, unknown>) {
  const end = toDate(data.contractEnd)
  return data.status === "active" && Boolean(end && end.getTime() > Date.now())
}

export async function getAccessState(uid: string): Promise<AccessState> {
  const adminDb = getAdminDb()
  const userSnap = await adminDb.doc(`users/${uid}`).get()
  const data = userSnap.data() ?? {}
  const configuredAdmins = (process.env.ADMIN_EMAILS ?? "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean)
  if (typeof data.email === "string" && configuredAdmins.includes(data.email.toLowerCase()) && data.role !== "admin") {
    data.role = "admin"
    await userSnap.ref.set({ role: "admin", updatedAt: FieldValue.serverTimestamp() }, { merge: true })
  }
  const periodEndDate = toDate(data.billing?.currentPeriodEnd)
  const personalActive =
    data.billing?.status === "paid" &&
    Boolean(periodEndDate && periodEndDate.getTime() > Date.now())
  const companyCode = typeof data.companyCode === "string" ? data.companyCode : null
  const companySnap = companyCode ? await adminDb.doc(`companies/${companyCode}`).get() : null
  const company = companySnap?.data() ?? {}
  const companyActive = data.accountType === "company" && companySnap?.exists && companyIsActive(company)
  const active = Boolean(personalActive || companyActive)
  const dateKey = tokyoDateKey()
  const usageSnap = await adminDb.doc(`users/${uid}/dailyUsage/${dateKey}`).get()
  const usedToday = Number(usageSnap.data()?.count ?? 0)

  return {
    uid,
    active,
    planId: typeof data.billing?.currentPlan === "string" ? data.billing.currentPlan : null,
    periodEnd: companyActive ? toIso(company.contractEnd) : periodEndDate?.toISOString() ?? null,
    usedToday,
    remainingToday: Math.max(0, DAILY_USAGE_LIMIT - usedToday),
    accountType: data.accountType === "company" ? "company" : "personal",
    companyCode,
    companyName: typeof data.companyName === "string" ? data.companyName : null,
    role: typeof data.role === "string" ? data.role : "staff",
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
    const personalActive =
      user.billing?.status === "paid" &&
      Boolean(periodEnd && periodEnd.getTime() > Date.now())
    const companyCode = typeof user.companyCode === "string" ? user.companyCode : null
    const companySnap = companyCode ? await transaction.get(adminDb.doc(`companies/${companyCode}`)) : null
    const companyActive =
      user.accountType === "company" &&
      Boolean(companySnap?.exists && companyIsActive(companySnap.data() ?? {}))
    const active = personalActive || companyActive

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
    transaction.set(userRef, {
      usage: {
        totalCount: Number(user.usage?.totalCount ?? 0) + 1,
        lastUsedAt: FieldValue.serverTimestamp(),
      },
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })

    return { usedToday: count + 1, remainingToday: DAILY_USAGE_LIMIT - count - 1 }
  })
}

export async function refundUsage(uid: string) {
  const adminDb = getAdminDb()
  const dateKey = tokyoDateKey()
  const usageRef = adminDb.doc(`users/${uid}/dailyUsage/${dateKey}`)
  const userRef = adminDb.doc(`users/${uid}`)
  await adminDb.runTransaction(async (transaction) => {
    const [snap, userSnap] = await Promise.all([
      transaction.get(usageRef),
      transaction.get(userRef),
    ])
    const count = Number(snap.data()?.count ?? 0)
    if (count > 0) {
      transaction.set(usageRef, {
        count: count - 1,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
      transaction.set(userRef, {
        usage: {
          totalCount: Math.max(0, Number(userSnap.data()?.usage?.totalCount ?? 0) - 1),
          lastUsedAt: userSnap.data()?.usage?.lastUsedAt ?? null,
        },
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
    }
  })
}
