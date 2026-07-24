import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { requireRole, serializeCompany, toIso } from "@/lib/companyServer"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const { user } = await requireRole(req, ["company_admin"])
    const companyCode = String(user.companyCode ?? "")
    if (!companyCode) return NextResponse.json({ error: "企業情報がありません。" }, { status: 400 })
    const db = getAdminDb()
    const [companySnap, usersSnap] = await Promise.all([
      db.doc(`companies/${companyCode}`).get(),
      db.collection("users").where("companyCode", "==", companyCode).limit(1000).get(),
    ])
    if (!companySnap.exists) return NextResponse.json({ error: "企業情報がありません。" }, { status: 404 })
    const members = usersSnap.docs.map((doc) => {
      const data = doc.data()
      return {
        uid: doc.id,
        name: String(data.name ?? ""),
        email: String(data.email ?? ""),
        role: String(data.role ?? "staff"),
        totalCount: Number(data.usage?.totalCount ?? 0),
        lastUsedAt: toIso(data.usage?.lastUsedAt),
        createdAt: toIso(data.createdAt),
      }
    }).sort((a, b) => (b.lastUsedAt ?? "").localeCompare(a.lastUsedAt ?? ""))
    return NextResponse.json({
      company: serializeCompany(companySnap.id, companySnap.data() ?? {}),
      members,
    })
  } catch (error) {
    const code = error instanceof Error ? error.message : ""
    return NextResponse.json({ error: code === "FORBIDDEN" ? "企業管理者権限が必要です。" : "ログインが必要です。" }, { status: code === "FORBIDDEN" ? 403 : 401 })
  }
}
