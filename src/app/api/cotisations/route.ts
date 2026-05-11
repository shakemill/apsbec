import { NextResponse } from "next/server"
import { z } from "zod"
import { saveCotisation, getAllCotisations, getCotisation } from "@/lib/blob"
import { isAdminAuthenticated } from "@/lib/auth"
import { generateId } from "@/lib/utils"

// Mode lot : même montant pour plusieurs membres, un seul mois
const schemaLot = z.object({
  mode: z.literal("lot"),
  membreIds: z.array(z.string().uuid()).min(1),
  mois: z.string().regex(/^\d{4}-\d{2}$/),
  montant: z.number().int().min(1),
})

// Mode rattrapage : liste libre de {membreId, mois, montant}
const schemaRattrapage = z.object({
  mode: z.literal("rattrapage"),
  lignes: z.array(z.object({
    membreId: z.string().uuid(),
    mois: z.string().regex(/^\d{4}-\d{2}$/),
    montant: z.number().int().min(1),
  })).min(1),
})

const schema = z.discriminatedUnion("mode", [schemaLot, schemaRattrapage])

async function enregistrerPaiement(membreId: string, mois: string, montantNouveau: number) {
  const existante = await getCotisation(membreId, mois)
  if (existante) {
    // Accumulation : on ajoute au montant déjà payé
    await saveCotisation({
      ...existante,
      montant: existante.montant + montantNouveau,
      datePaiement: new Date().toISOString(),
    })
  } else {
    await saveCotisation({
      id: generateId(),
      membreId,
      telephone: "",
      mois,
      montant: montantNouveau,
      datePaiement: new Date().toISOString(),
    })
  }
}

export async function GET() {
  const cotisations = await getAllCotisations()
  return NextResponse.json(cotisations)
}

export async function POST(req: Request) {
  const ok = await isAdminAuthenticated()
  if (!ok) return NextResponse.json({ error: "Non autorisé." }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides." }, { status: 400 })

  if (parsed.data.mode === "lot") {
    const { membreIds, mois, montant } = parsed.data
    await Promise.all(membreIds.map((id) => enregistrerPaiement(id, mois, montant)))
    return NextResponse.json({ count: membreIds.length }, { status: 201 })
  }

  // rattrapage
  const { lignes } = parsed.data
  await Promise.all(lignes.map((l) => enregistrerPaiement(l.membreId, l.mois, l.montant)))
  return NextResponse.json({ count: lignes.length }, { status: 201 })
}
