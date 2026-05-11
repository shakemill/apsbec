import { NextResponse } from "next/server"
import { z } from "zod"
import { getConfig, saveConfig } from "@/lib/blob"
import { isAdminAuthenticated, hashCode, verifyAdminCode } from "@/lib/auth"

const schema = z.object({
  nomClub: z.string().min(1).max(100),
  devise: z.string().min(1).max(10),
  cotisationMensuelle: z.number().int().min(0),
  abonnementAnnuel: z.number().int().min(0),
  codeActuel: z.string().optional(),
  nouveauCode: z.string().min(4).max(50).optional(),
})

export async function GET() {
  const ok = await isAdminAuthenticated()
  if (!ok) return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  const config = await getConfig()
  if (!config) return NextResponse.json(null)
  const { codeAdminHash: _, ...safe } = config
  return NextResponse.json(safe)
}

export async function POST(req: Request) {
  const ok = await isAdminAuthenticated()
  if (!ok) return NextResponse.json({ error: "Non autorisé." }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides." }, { status: 400 })

  const { nomClub, devise, cotisationMensuelle, abonnementAnnuel, codeActuel, nouveauCode } = parsed.data
  const config = await getConfig()

  let codeAdminHash = config?.codeAdminHash ?? ""

  if (nouveauCode) {
    if (!config?.codeAdminHash) {
      codeAdminHash = await hashCode(nouveauCode)
    } else {
      if (!codeActuel) return NextResponse.json({ error: "Code actuel requis." }, { status: 400 })
      const valid = await verifyAdminCode(codeActuel)
      if (!valid) return NextResponse.json({ error: "Code actuel incorrect." }, { status: 403 })
      codeAdminHash = await hashCode(nouveauCode)
    }
  }

  await saveConfig({ nomClub, devise, cotisationMensuelle, abonnementAnnuel, codeAdminHash })
  return NextResponse.json({ ok: true })
}
