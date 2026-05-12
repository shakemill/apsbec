import { NextResponse } from "next/server"
import { z } from "zod"
import { getMembre, saveMembre, deleteMembre, getCotisationsByMembre, deleteCotisation } from "@/lib/blob"
import { isAdminAuthenticated } from "@/lib/auth"

const patchSchema = z.object({
  nom: z.string().min(1).max(100).optional(),
  prenom: z.string().min(1).max(100).optional(),
  age: z.number().int().min(5).max(120).optional(),
  adresse: z.string().max(200).optional(),
  statut: z.enum(["actif", "en_attente", "suspendu"]).optional(),
})

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const membre = await getMembre(id)
  if (!membre) return NextResponse.json({ error: "Membre introuvable." }, { status: 404 })
  return NextResponse.json(membre)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Auth + fetch membre en parallèle pour réduire la latence
  const [ok, membre] = await Promise.all([
    isAdminAuthenticated(),
    getMembre(id),
  ])
  if (!ok) return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  if (!membre) return NextResponse.json({ error: "Membre introuvable." }, { status: 404 })

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides." }, { status: 400 })

  const updated = { ...membre, ...parsed.data }
  try {
    await saveMembre(updated)
  } catch (err) {
    console.error("saveMembre failed:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur lors de la sauvegarde." },
      { status: 500 }
    )
  }
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const ok = await isAdminAuthenticated()
  if (!ok) return NextResponse.json({ error: "Non autorisé." }, { status: 401 })

  const { id } = await params
  const cotisations = await getCotisationsByMembre(id)
  await Promise.all(cotisations.map((c) => deleteCotisation(id, c.mois)))
  await deleteMembre(id)
  return NextResponse.json({ ok: true })
}
