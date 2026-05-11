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
    try {
      await saveConfig({
        nomClub: "APSBEC",
        devise: "FCFA",
        cotisationMensuelle: 0,
        abonnementAnnuel: 0,
        codeAdminHash,
      })
    } catch (err) {
      console.error("saveConfig failed:", err)
      return NextResponse.json({ error: `Erreur stockage : ${err instanceof Error ? err.message : String(err)}` }, { status: 500 })
    }
    await setAdminSession()
    return NextResponse.json({ ok: true })
  }

  const valid = await verifyAdminCode(code)
  if (!valid) return NextResponse.json({ error: "Code incorrect." }, { status: 401 })

  await setAdminSession()
  return NextResponse.json({ ok: true })
}
