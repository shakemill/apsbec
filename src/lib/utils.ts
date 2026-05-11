import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function formatMois(mois: string): string {
  const [year, month] = mois.split("-")
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
}

export function moisCourant(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export function formatDate(iso: string): string {
  const s = new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
  // Capitalise le mois : "12 mai 2026" → "12 Mai 2026"
  return s.replace(/\b([a-zéûàâôùî])/u, (c) => c.toUpperCase())
}

export function formatMontant(montant: number, devise = "FCFA"): string {
  return `${montant.toLocaleString("fr-FR")} ${devise}`
}

export function getAnneesDepuisInscription(dateInscription: string): number[] {
  const debut = new Date(dateInscription).getFullYear()
  const fin = new Date().getFullYear()
  const annees: number[] = []
  for (let y = debut; y <= fin; y++) annees.push(y)
  return annees
}

export function getMoisDepuisInscription(dateInscription: string): string[] {
  const debut = new Date(dateInscription)
  debut.setDate(1)
  const fin = new Date()
  fin.setDate(1)
  const mois: string[] = []
  const courant = new Date(debut)
  while (courant <= fin) {
    mois.push(
      `${courant.getFullYear()}-${String(courant.getMonth() + 1).padStart(2, "0")}`
    )
    courant.setMonth(courant.getMonth() + 1)
  }
  return mois
}
