import { NextResponse } from "next/server"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { companyIsActive, normalizeCompanyCode } from "@/lib/companyServer"
import { verifyBearer } from "@/lib/serverAccess"

export const runtime = "nodejs"

function isSystemAdmin(email: string | undefined) {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
  return Boolean(email && admins.includes(email.toLowerCase()))
}

export async function POST(req: Request) {
  try {
    const token = await verifyBearer(req)
    const body = (await req.json()) as { name?: string; companyCode?: string }
    const name = String(body.name ?? "").trim().slice(0, 100)
    const companyCode = normalizeCompanyCode(body.companyCode)
    if (!name) return NextResponse.json({ error: "お名前を入力してください。" }, { status: 400 })

    const db = getAdminDb()
    await db.runTransaction(async (transaction) => {
      const userRef = db.doc(`users/${token.uid}`)
      const existing = await transaction.get(userRef)
      if (existing.exists) return

      if (!companyCode) {
        if (!isSystemAdmin(token.email)) throw new Error("COMPANY_REQUIRED")
        transaction.create(userRef, {
          uid: token.uid,
          name,
          email: token.email ?? "",
          role: "admin",
          accountType: "admin",
          companyCode: null,
          companyName: null,
          billing: { status: "admin" },
          usage: { totalCount: 0, lastUsedAt: null },
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        })
        return
      }

      const companyRef = db.doc(`companies/${companyCode}`)
      const companySnap = await transaction.get(companyRef)
      if (!companySnap.exists) throw new Error("INVALID_COMPANY")
      const company = companySnap.data() ?? {}
      if (!companyIsActive(company)) throw new Error("INACTIVE_COMPANY")
      const memberCount = Number(company.memberCount ?? 0)
      const seatLimit = Number(company.seatLimit ?? 0)
      if (seatLimit <= 0 || memberCount >= seatLimit) throw new Error("SEAT_LIMIT")

      transaction.create(userRef, {
        uid: token.uid,
        name,
        email: token.email ?? "",
        role: String(company.adminEmail ?? "").toLowerCase() === String(token.email ?? "").toLowerCase()
          ? "company_admin"
          : "staff",
        accountType: "company",
        companyCode,
        companyName: String(company.companyName ?? ""),
        billing: {
          status: "company",
          currentPlan: null,
          currentPeriodEnd: company.contractEnd ?? null,
        },
        usage: { totalCount: 0, lastUsedAt: null },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      transaction.update(companyRef, {
        memberCount: memberCount + 1,
        updatedAt: FieldValue.serverTimestamp(),
      })
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const code = error instanceof Error ? error.message : ""
    if (code === "INVALID_COMPANY") return NextResponse.json({ error: "企業コードが見つかりません。" }, { status: 400 })
    if (code === "COMPANY_REQUIRED") return NextResponse.json({ error: "会員登録には有効な企業コードが必要です。" }, { status: 400 })
    if (code === "INACTIVE_COMPANY") return NextResponse.json({ error: "この企業コードは現在利用できません。" }, { status: 403 })
    if (code === "SEAT_LIMIT") return NextResponse.json({ error: "この企業は契約人数の上限に達しています。企業管理者へご連絡ください。" }, { status: 409 })
    if (code === "UNAUTHORIZED") return NextResponse.json({ error: "認証に失敗しました。" }, { status: 401 })
    console.error(error)
    return NextResponse.json({ error: "会員情報を登録できませんでした。" }, { status: 500 })
  }
}
