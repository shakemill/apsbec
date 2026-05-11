import { NextResponse } from "next/server"
import { getMembreByTelephone } from "@/lib/blob"

export async function GET(_: Request, { params }: { params: Promise<{ tel: string }> }) {
  const { tel } = await params
  const membre = await getMembreByTelephone(tel)
  if (!membre) return NextResponse.json({ error: "Membre introuvable." }, { status: 404 })
  return NextResponse.json(membre)
}
