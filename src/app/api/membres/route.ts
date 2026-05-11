import { NextResponse } from "next/server"
import { z } from "zod"
import { getAllMembres, getMembreByTelephone, saveMembre } from "@/lib/blob"
import { generateId } from "@/lib/utils"

const schema = z.object({
  nom: z.string().min(1).max(100),
  prenom: z.string().min(1).max(100),
  telephone: z.string().min(7).max(20).regex(/^\d+$/),
  age: z.number().int().min(5).max(120),
  adresse: z.string().max(200).optional(),
  statut: z.enum(["actif", "en_attente", "suspendu"]).optional(),
})

export async function GET() {
  const membres = await getAllMembres()
  return NextResponse.json(membres)
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 })
  }

  const { nom, prenom, telephone, age, adresse, statut } = parsed.data

  const existant = await getMembreByTelephone(telephone)
  if (existant) {
    return NextResponse.json({ error: "Ce numéro de téléphone est déjà utilisé." }, { status: 409 })
  }

  const membre = {
    id: generateId(),
    nom,
    prenom,
    telephone,
    age,
    adresse,
    statut: statut ?? ("en_attente" as const),
    dateInscription: new Date().toISOString(),
  }

  await saveMembre(membre)
  return NextResponse.json(membre, { status: 201 })
}
