import { Timestamp } from "firebase-admin/firestore"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { verifyBearer } from "@/lib/serverAccess"

export type CompanyData = {
  companyCode: string
  companyName: string
  status: "pending" | "active" | "suspended"
  seatLimit: number
  memberCount: number
  contractStart: string | null
  contractEnd: string | null
  pricePerSeat: number
  planId: string
  planLabel: string
  monthlyPrice: number
  billingMethod: "bank_transfer"
  adminEmail: string
}

export function normalizeCompanyCode(value: unknown) {
  return typeof value === "string"
    ? value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20)
    : ""
}

export function toIso(value: unknown) {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString()
  }
  if (typeof value === "string") return value
  return null
}

export function companyIsActive(data: Record<string, unknown>) {
  const end = toIso(data.contractEnd)
  return data.status === "active" && Boolean(end && new Date(end).getTime() > Date.now())
}

export async function requireRole(req: Request, roles: string[]) {
  const token = await verifyBearer(req)
  const userSnap = await getAdminDb().doc(`users/${token.uid}`).get()
  const data = userSnap.data() ?? {}
  if (!roles.includes(String(data.role ?? ""))) throw new Error("FORBIDDEN")
  return { token, user: data }
}

export function serializeCompany(id: string, data: Record<string, unknown>): CompanyData {
  return {
    companyCode: id,
    companyName: String(data.companyName ?? ""),
    status: data.status === "active" || data.status === "suspended" ? data.status : "pending",
    seatLimit: Number(data.seatLimit ?? 0),
    memberCount: Number(data.memberCount ?? 0),
    contractStart: toIso(data.contractStart),
    contractEnd: toIso(data.contractEnd),
    pricePerSeat: Number(data.pricePerSeat ?? 500),
    planId: String(data.planId ?? ""),
    planLabel: String(data.planLabel ?? ""),
    monthlyPrice: Number(data.monthlyPrice ?? 0),
    billingMethod: "bank_transfer",
    adminEmail: String(data.adminEmail ?? ""),
  }
}
