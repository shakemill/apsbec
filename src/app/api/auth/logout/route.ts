import { NextResponse } from "next/server"
import { clearAdminSession } from "@/lib/auth"

export async function POST(request: Request) {
  await clearAdminSession()
  // 303 See Other : force le navigateur à faire un GET (évite 405 si POST)
  return NextResponse.redirect(new URL("/admin", request.url), { status: 303 })
}
