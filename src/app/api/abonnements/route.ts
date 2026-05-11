import { NextResponse } from "next/server"
import { z } from "zod"
import { getAbonnement, saveAbonnement } from "@/lib/blob"
import { isAdminAuthenticated } from "@/lib/auth"
import { generateId } from "@/lib/utils"

const schema = z.object({
  membreId: z.string().uuid(),
  annee: z.number().int().min(2000).max(2100),
  montant: z.number().int().min(1),
  note: z.string().max(200).optional(),
})

export async function POST(req: Request) {
  const ok = await isAdminAuthenticated()
  if (!ok) return NextResponse.json({ error: "Non autorisé." }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides." }, { status: 400 })

  const { membreId, annee, montant, note } = parsed.data

  // Accumulation si paiement partiel existant
  const existant = await getAbonnement(membreId, annee)
  const abonnement = existant
    ? { ...existant, montant: existant.montant + montant, datePaiement: new Date().toISOString(), note }
    : { id: generateId(), membreId, annee, montant, datePaiement: new Date().toISOString(), note }

  await saveAbonnement(abonnement)
  return NextResponse.json(abonnement, { status: 201 })
}
