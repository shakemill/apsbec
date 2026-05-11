import { NextResponse } from "next/server"
import { verifyAdminCode, setAdminSession, hashCode } from "@/lib/auth"
import { getConfig, saveConfig } from "@/lib/blob"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const code = body?.code?.trim()
  if (!code) return NextResponse.json({ error: "Code requis." }, { status: 400 })

  const config = await getConfig()

  // Première utilisation : aucun code configuré → on accepte le code init et on le stocke
  if (!config || !config.codeAdminHash) {
    const initCode = (process.env.ADMIN_CODE_INIT ?? "APSBEC2024").trim()
    if (code !== initCode) return NextResponse.json({ error: "Code incorrect." }, { status: 401 })

    const codeAdminHash = await hashCode(code)
    await saveConfig({
      nomClub: "APSBEC",
      devise: "FCFA",
      cotisationMensuelle: 0,
      abonnementAnnuel: 0,
      codeAdminHash,
    })
    await setAdminSession()
    return NextResponse.json({ ok: true })
  }

  const valid = await verifyAdminCode(code)
  if (!valid) return NextResponse.json({ error: "Code incorrect." }, { status: 401 })

  await setAdminSession()
  return NextResponse.json({ ok: true })
}
