import { NextResponse } from "next/server"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { normalizeCompanyCode, requireRole, serializeCompany } from "@/lib/companyServer"
import { COMPANY_PLANS, isFixedCompanyPlan } from "@/lib/companyPlans"

export const runtime = "nodejs"

function resolvePlan(body: Record<string, unknown>) {
  if (isFixedCompanyPlan(body.planId)) return COMPANY_PLANS[body.planId]
  if (body.planId === "enterprise") {
    const seatLimit = Number(body.seatLimit)
    const monthlyPrice = Number(body.monthlyPrice)
    if (!Number.isInteger(seatLimit) || seatLimit < 51 || seatLimit > 10000 || !Number.isInteger(monthlyPrice) || monthlyPrice < 1) {
      throw new Error("INVALID_PLAN")
    }
    return {
      id: "enterprise",
      label: "エンタープライズ",
      seatLimit,
      pricePerSeat: Math.round(monthlyPrice / seatLimit),
      monthlyPrice,
    }
  }
  throw new Error("INVALID_PLAN")
}

function dateValue(value: unknown, endOfDay = false) {
  if (typeof value !== "string" || !value) return null
  const date = new Date(`${value}T${endOfDay ? "23:59:59" : "00:00:00"}+09:00`)
  return Number.isNaN(date.getTime()) ? null : Timestamp.fromDate(date)
}

export async function GET(req: Request) {
  try {
    await requireRole(req, ["admin"])
    const snapshot = await getAdminDb().collection("companies").limit(500).get()
    return NextResponse.json({
      companies: snapshot.docs
        .map((doc) => serializeCompany(doc.id, doc.data()))
        .sort((a, b) => a.companyName.localeCompare(b.companyName, "ja")),
    })
  } catch (error) {
    const code = error instanceof Error ? error.message : ""
    return NextResponse.json({ error: code === "FORBIDDEN" ? "管理者権限が必要です。" : "ログインが必要です。" }, { status: code === "FORBIDDEN" ? 403 : 401 })
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(req, ["admin"])
    const body = await req.json()
    const companyCode = normalizeCompanyCode(body.companyCode)
    const companyName = String(body.companyName ?? "").trim().slice(0, 120)
    let plan
    try { plan = resolvePlan(body) } catch {
      return NextResponse.json({ error: "契約プランを正しく入力してください。" }, { status: 400 })
    }
    if (!companyCode || !companyName) {
      return NextResponse.json({ error: "企業名・企業コードを正しく入力してください。" }, { status: 400 })
    }

    const ref = getAdminDb().doc(`companies/${companyCode}`)
    if ((await ref.get()).exists) {
      return NextResponse.json({ error: "この企業コードはすでに使用されています。" }, { status: 409 })
    }
    await ref.create({
      companyCode,
      companyName,
      status: body.status === "active" ? "active" : "pending",
      seatLimit: plan.seatLimit,
      memberCount: 0,
      contractStart: dateValue(body.contractStart),
      contractEnd: dateValue(body.contractEnd, true),
      planId: plan.id,
      planLabel: plan.label,
      pricePerSeat: plan.pricePerSeat,
      monthlyPrice: plan.monthlyPrice,
      billingMethod: "bank_transfer",
      adminEmail: String(body.adminEmail ?? "").trim().toLowerCase().slice(0, 200),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    return NextResponse.json({ ok: true, companyCode })
  } catch (error) {
    const code = error instanceof Error ? error.message : ""
    if (code === "FORBIDDEN") return NextResponse.json({ error: "管理者権限が必要です。" }, { status: 403 })
    if (code === "UNAUTHORIZED") return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 })
    console.error(error)
    return NextResponse.json({ error: "企業を登録できませんでした。" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    await requireRole(req, ["admin"])
    const body = await req.json()
    const companyCode = normalizeCompanyCode(body.companyCode)
    const companyName = String(body.companyName ?? "").trim().slice(0, 120)
    let plan
    try { plan = resolvePlan(body) } catch {
      return NextResponse.json({ error: "契約プランを正しく入力してください。" }, { status: 400 })
    }
    const status = ["pending", "active", "suspended"].includes(body.status) ? body.status : "pending"
    if (!companyCode || !companyName) {
      return NextResponse.json({ error: "入力内容を確認してください。" }, { status: 400 })
    }
    const ref = getAdminDb().doc(`companies/${companyCode}`)
    const current = await ref.get()
    if (!current.exists) return NextResponse.json({ error: "企業が見つかりません。" }, { status: 404 })
    if (plan.seatLimit < Number(current.data()?.memberCount ?? 0)) {
      return NextResponse.json({ error: "契約人数を登録済み人数より少なくできません。" }, { status: 400 })
    }
    await ref.update({
      companyName,
      status,
      seatLimit: plan.seatLimit,
      planId: plan.id,
      planLabel: plan.label,
      pricePerSeat: plan.pricePerSeat,
      monthlyPrice: plan.monthlyPrice,
      contractStart: dateValue(body.contractStart),
      contractEnd: dateValue(body.contractEnd, true),
      adminEmail: String(body.adminEmail ?? "").trim().toLowerCase().slice(0, 200),
      updatedAt: FieldValue.serverTimestamp(),
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    const code = error instanceof Error ? error.message : ""
    if (code === "FORBIDDEN") return NextResponse.json({ error: "管理者権限が必要です。" }, { status: 403 })
    if (code === "UNAUTHORIZED") return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 })
    console.error(error)
    return NextResponse.json({ error: "企業情報を更新できませんでした。" }, { status: 500 })
  }
}
