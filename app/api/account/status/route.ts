import { NextResponse } from "next/server"
import { getAccessState, verifyBearer } from "@/lib/serverAccess"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const token = await verifyBearer(req)
    return NextResponse.json(await getAccessState(token.uid))
  } catch {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 })
  }
}
