import type { Membre, Cotisation, Abonnement, Config } from "@/types"
import { formatMois, formatMontant, getMoisDepuisInscription } from "./utils"

// ── Rapport mensuel des cotisations ──────────────────────────────────────────

export function genererRapportWhatsApp(
  mois: string,
  membres: Membre[],
  cotisations: Cotisation[],
  config: Config
): string {
  const membresActifs     = membres.filter((m) => m.statut === "actif")
  const cotisationsDuMois = cotisations.filter((c) => c.mois === mois)
  const montantAttendu    = config.cotisationMensuelle

  const idsComplets = new Set(
    cotisationsDuMois
      .filter((c) => montantAttendu <= 0 || c.montant >= montantAttendu)
      .map((c) => c.membreId)
  )
  const idsPartiels = new Set(
    cotisationsDuMois
      .filter((c) => montantAttendu > 0 && c.montant < montantAttendu)
      .map((c) => c.membreId)
  )

  const aJour   = membresActifs.filter((m) =>  idsComplets.has(m.id))
  const partiels = membresActifs.filter((m) =>  idsPartiels.has(m.id))
  const enRetard = membresActifs.filter((m) => !idsComplets.has(m.id) && !idsPartiels.has(m.id))

  const totalEncaisse = cotisationsDuMois.reduce((s, c) => s + c.montant, 0)
  const cotMap: Record<string, number> = {}
  cotisationsDuMois.forEach((c) => { cotMap[c.membreId] = c.montant })

  const l: string[] = []

  l.push(`📋 *${config.nomClub}*`)
  l.push(`📅 Cotisations — ${formatMois(mois)}`)
  l.push(`━━━━━━━━━━━━━━━━━━━━`)

  l.push(``)
  l.push(`✅ *À jour (${aJour.length})*`)
  if (aJour.length === 0) l.push(`   — Aucun`)
  else aJour.forEach((m, i) => l.push(`   ${i + 1}. ${m.prenom} ${m.nom}`))

  if (partiels.length > 0) {
    l.push(``)
    l.push(`⚠️ *Paiement partiel (${partiels.length})*`)
    partiels.forEach((m, i) => {
      const paye  = cotMap[m.id] ?? 0
      const reste = Math.max(0, montantAttendu - paye)
      l.push(`   ${i + 1}. ${m.prenom} ${m.nom} — versé ${formatMontant(paye, config.devise)}, reste ${formatMontant(reste, config.devise)}`)
    })
  }

  l.push(``)
  l.push(`❌ *En retard (${enRetard.length})*`)
  if (enRetard.length === 0) l.push(`   — Aucun`)
  else enRetard.forEach((m, i) => l.push(`   ${i + 1}. ${m.prenom} ${m.nom}`))

  l.push(``)
  l.push(`━━━━━━━━━━━━━━━━━━━━`)
  l.push(`💰 Total encaissé : ${formatMontant(totalEncaisse, config.devise)}`)
  l.push(`👥 Membres actifs : ${membresActifs.length}`)
  const taux = membresActifs.length > 0
    ? Math.round(((aJour.length + partiels.length) / membresActifs.length) * 100)
    : 0
  l.push(`📊 Taux de couverture : ${taux}%`)

  return l.join("\n")
}

// ── Rapport annuel des abonnements ────────────────────────────────────────────

export function genererRapportAbonnements(
  annee: number,
  membres: Membre[],
  abonnements: Abonnement[],
  config: Config
): string {
  const membresActifs   = membres.filter((m) => m.statut === "actif")
  const abDuAnnee       = abonnements.filter((a) => a.annee === annee)
  const montantAttendu  = config.abonnementAnnuel

  const abMap: Record<string, number> = {}
  abDuAnnee.forEach((a) => { abMap[a.membreId] = a.montant })

  const statutMembre = (id: string): "complet" | "partiel" | "non_paye" => {
    const m = abMap[id]
    if (!m) return "non_paye"
    if (montantAttendu <= 0 || m >= montantAttendu) return "complet"
    return "partiel"
  }

  const aJour    = membresActifs.filter((m) => statutMembre(m.id) === "complet")
  const partiels = membresActifs.filter((m) => statutMembre(m.id) === "partiel")
  const nonPayes = membresActifs.filter((m) => statutMembre(m.id) === "non_paye")

  const totalEncaisse = abDuAnnee.reduce((s, a) => s + a.montant, 0)

  const l: string[] = []

  l.push(`📋 *${config.nomClub}*`)
  l.push(`🎫 Abonnements annuels — ${annee}`)
  l.push(`━━━━━━━━━━━━━━━━━━━━`)

  l.push(``)
  l.push(`✅ *Payé (${aJour.length})*`)
  if (aJour.length === 0) l.push(`   — Aucun`)
  else aJour.forEach((m, i) => {
    const paye = abMap[m.id] ?? 0
    const detail = montantAttendu > 0 ? ` — ${formatMontant(paye, config.devise)}` : ""
    l.push(`   ${i + 1}. ${m.prenom} ${m.nom}${detail}`)
  })

  if (partiels.length > 0) {
    l.push(``)
    l.push(`⚠️ *Paiement partiel (${partiels.length})*`)
    partiels.forEach((m, i) => {
      const paye  = abMap[m.id] ?? 0
      const reste = Math.max(0, montantAttendu - paye)
      l.push(`   ${i + 1}. ${m.prenom} ${m.nom} — versé ${formatMontant(paye, config.devise)}, reste ${formatMontant(reste, config.devise)}`)
    })
  }

  l.push(``)
  l.push(`❌ *Non payé (${nonPayes.length})*`)
  if (nonPayes.length === 0) l.push(`   — Aucun`)
  else nonPayes.forEach((m, i) => l.push(`   ${i + 1}. ${m.prenom} ${m.nom}`))

  l.push(``)
  l.push(`━━━━━━━━━━━━━━━━━━━━`)
  l.push(`💰 Total encaissé : ${formatMontant(totalEncaisse, config.devise)}`)
  if (montantAttendu > 0)
    l.push(`🎯 Objectif : ${formatMontant(membresActifs.length * montantAttendu, config.devise)}`)
  l.push(`👥 Membres actifs : ${membresActifs.length}`)
  const taux = membresActifs.length > 0
    ? Math.round(((aJour.length + partiels.length) / membresActifs.length) * 100)
    : 0
  l.push(`📊 Taux de couverture : ${taux}%`)

  return l.join("\n")
}

// ── Utilitaire ────────────────────────────────────────────────────────────────

export function getMoisDus(membre: Membre, cotisations: Cotisation[], montantAttendu = 0): string[] {
  const tousMois = getMoisDepuisInscription(membre.dateInscription)
  const cotParMois: Record<string, number> = {}
  cotisations.filter((c) => c.membreId === membre.id).forEach((c) => { cotParMois[c.mois] = c.montant })
  return tousMois.filter((m) => {
    if (!(m in cotParMois)) return true
    if (montantAttendu > 0 && cotParMois[m] < montantAttendu) return true
    return false
  })
}
