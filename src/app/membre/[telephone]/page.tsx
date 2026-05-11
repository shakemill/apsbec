import { notFound } from "next/navigation"
import { getMembreByTelephone, getCotisationsByMembre, getAbonnementsByMembre, getConfig } from "@/lib/blob"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import {
  formatMois, formatDate, formatMontant,
  getMoisDepuisInscription, getAnneesDepuisInscription,
} from "@/lib/utils"
import type { StatutMembre } from "@/types"
import {
  CheckCircle2, AlertCircle, Clock, TrendingUp,
  CalendarDays, CreditCard, Star, MapPin, User,
} from "lucide-react"

const statutCfg: Record<StatutMembre, { variant: "success"|"warning"|"danger"; label: string; dot: boolean }> = {
  actif:      { variant: "success", label: "Actif",                   dot: true  },
  en_attente: { variant: "warning", label: "En attente de validation", dot: true  },
  suspendu:   { variant: "danger",  label: "Suspendu",                dot: true  },
}

export default async function DashboardMembre({ params }: { params: Promise<{ telephone: string }> }) {
  const { telephone } = await params
  const [membre, config] = await Promise.all([getMembreByTelephone(telephone), getConfig()])
  if (!membre) notFound()

  const [cotisations, abonnements] = await Promise.all([
    getCotisationsByMembre(membre.id),
    getAbonnementsByMembre(membre.id),
  ])

  const devise         = config?.devise ?? "FCFA"
  const montantMensuel = config?.cotisationMensuelle ?? 0
  const montantAnnuel  = config?.abonnementAnnuel ?? 0

  // ── Cotisations mensuelles ──────────────────────────────────────────────────
  const tousMois = getMoisDepuisInscription(membre.dateInscription)
  const cotParMois: Record<string, number> = {}
  cotisations.forEach((c) => { cotParMois[c.mois] = c.montant })

  const estComplet = (m: string) =>
    montantMensuel <= 0 ? (m in cotParMois) : (cotParMois[m] ?? 0) >= montantMensuel
  const estPartiel = (m: string) => (m in cotParMois) && !estComplet(m)

  const moisComplets = tousMois.filter(estComplet)
  const moisPartiels = tousMois.filter(estPartiel)
  const moisNonPayes = tousMois.filter((m) => !(m in cotParMois))

  // Total payé = somme de toutes les cotisations enregistrées
  const totalMensuelPaye = cotisations.reduce((s, c) => s + c.montant, 0)
  // Total dû = mois sans paiement + solde restant des mois partiels
  const totalMensuelDu = montantMensuel <= 0 ? 0
    : moisNonPayes.length * montantMensuel
      + moisPartiels.reduce((s, m) => s + Math.max(0, montantMensuel - (cotParMois[m] ?? 0)), 0)

  // ── Abonnements annuels ──────────────────────────────────────────────────────
  const toutesAnnees = getAnneesDepuisInscription(membre.dateInscription)
  const abParAnnee: Record<number, number> = {}
  abonnements.forEach((a) => { abParAnnee[a.annee] = a.montant })

  // Fix : utiliser `in` pour détecter les clés (évite que !0 soit traité comme non payé)
  const statutAnnee = (a: number): "complet" | "partiel" | "non_paye" => {
    if (!(a in abParAnnee)) return "non_paye"
    const m = abParAnnee[a]
    if (montantAnnuel <= 0 || m >= montantAnnuel) return "complet"
    return "partiel"
  }

  const anneesNonPayees = toutesAnnees.filter((a) => statutAnnee(a) === "non_paye")
  const anneesPartiels  = toutesAnnees.filter((a) => statutAnnee(a) === "partiel")
  const anneesComplets  = toutesAnnees.filter((a) => statutAnnee(a) === "complet")

  // Total payé = somme de tous les abonnements enregistrés
  const totalAnnuelPaye = abonnements.reduce((s, a) => s + a.montant, 0)
  // Total dû = années sans paiement + solde restant des années partielles
  const totalAnnuelDu = montantAnnuel <= 0 ? 0
    : anneesNonPayees.length * montantAnnuel
      + anneesPartiels.reduce((s, a) => s + Math.max(0, montantAnnuel - (abParAnnee[a] ?? 0)), 0)

  const { variant, label, dot } = statutCfg[membre.statut]

  return (
    <main className="min-h-screen px-4 py-8 pb-16">
      <div className="max-w-lg mx-auto space-y-4 animate-fade-up">
        <PageHeader title={`${membre.prenom} ${membre.nom}`} subtitle={`+${membre.telephone}`} backHref="/membre" />

        {/* Profil */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <User size={22} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-100">{membre.prenom} {membre.nom}</div>
              <div className="text-xs text-slate-500 mt-0.5">Membre depuis {formatDate(membre.dateInscription)}</div>
            </div>
            <Badge variant={variant} dot={dot}>{label}</Badge>
          </div>
          {membre.statut === "en_attente" && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/8 border border-amber-500/15 rounded-xl px-3 py-2">
              <Clock size={13} className="shrink-0" />
              Votre inscription est en cours de validation par l&apos;administrateur.
            </div>
          )}
          <div className="flex gap-4 mt-3 pt-3 border-t border-white/[0.06] text-xs text-slate-500">
            <span className="flex items-center gap-1"><CalendarDays size={12} /> {membre.age} ans</span>
            {membre.adresse && <span className="flex items-center gap-1 truncate"><MapPin size={12} /> {membre.adresse}</span>}
          </div>
        </Card>

        {/* ── Cotisations mensuelles ────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-2.5 px-1">
            <CreditCard size={14} className="text-slate-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cotisations mensuelles</span>
            {montantMensuel > 0 && <span className="ml-auto text-xs text-slate-600">{formatMontant(montantMensuel, devise)}/mois</span>}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Complets",  value: moisComplets.length,  icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/15" },
              { label: "Partiels",  value: moisPartiels.length,  icon: AlertCircle,  color: "text-amber-400",   bg: "bg-amber-500/10  border-amber-500/15"  },
              { label: "Non payés", value: moisNonPayes.length,  icon: Clock,        color: "text-rose-400",    bg: "bg-rose-500/10   border-rose-500/15"    },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`glass rounded-2xl p-3 border ${bg} text-center`}>
                <Icon size={18} className={`${color} mx-auto mb-1`} />
                <div className={`text-xl font-black ${color}`}>{value}</div>
                <div className="text-xs text-slate-600 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          <Card>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total versé</span>
              <span className="font-semibold text-emerald-400">{formatMontant(totalMensuelPaye, devise)}</span>
            </div>
            {totalMensuelDu > 0 && (
              <div className="flex justify-between text-sm mt-2 pt-2 border-t border-white/[0.06]">
                <span className="text-slate-400">Reste dû</span>
                <span className="font-semibold text-rose-400">{formatMontant(totalMensuelDu, devise)}</span>
              </div>
            )}
          </Card>
        </div>

        {/* Arrérés mensuels */}
        {(moisPartiels.length > 0 || moisNonPayes.length > 0) && (
          <Card>
            <CardHeader><CardTitle>Arrérés mensuels</CardTitle></CardHeader>
            <div className="divide-y divide-white/[0.05]">
              {moisPartiels.map((m) => {
                const paye  = cotParMois[m] ?? 0
                const reste = Math.max(0, montantMensuel - paye)
                return (
                  <div key={m} className="py-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm text-slate-200 capitalize">{formatMois(m)}</div>
                      <div className="text-xs text-slate-600 mt-0.5">Versé {formatMontant(paye, devise)} · reste {formatMontant(reste, devise)}</div>
                    </div>
                    <Badge variant="warning" dot>Partiel</Badge>
                  </div>
                )
              })}
              {moisNonPayes.map((m) => (
                <div key={m} className="py-3 flex items-center justify-between">
                  <span className="text-sm text-slate-300 capitalize">{formatMois(m)}</span>
                  <div className="flex items-center gap-2">
                    {montantMensuel > 0 && <span className="text-xs text-rose-500">{formatMontant(montantMensuel, devise)}</span>}
                    <Badge variant="danger" dot>Non payé</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Historique mensuel */}
        <Card>
          <CardHeader><CardTitle>Historique mensuel complet</CardTitle></CardHeader>
          {cotisations.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-4">Aucun paiement enregistré</p>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {[...tousMois].reverse().map((m) => {
                const paye    = cotParMois[m]
                const complet = estComplet(m)
                const partiel = estPartiel(m)
                return (
                  <div key={m} className="py-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-slate-200 capitalize">{formatMois(m)}</div>
                      {paye !== undefined && (
                        <div className="text-xs text-slate-600 mt-0.5">
                          {formatMontant(paye, devise)}{montantMensuel > 0 ? ` / ${formatMontant(montantMensuel, devise)}` : ""}
                        </div>
                      )}
                    </div>
                    {complet              && <Badge variant="success" dot>Complet</Badge>}
                    {partiel              && <Badge variant="warning" dot>Partiel</Badge>}
                    {!(m in cotParMois)   && <Badge variant="danger"  dot>Non payé</Badge>}
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* ── Abonnement annuel ────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-2.5 px-1">
            <Star size={14} className="text-slate-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Abonnement annuel</span>
            {montantAnnuel > 0 && <span className="ml-auto text-xs text-slate-600">{formatMontant(montantAnnuel, devise)}/an</span>}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Payées",    value: anneesComplets.length,  color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/15", icon: CheckCircle2 },
              { label: "Partiels",  value: anneesPartiels.length,  color: "text-amber-400",   bg: "bg-amber-500/10  border-amber-500/15",  icon: AlertCircle  },
              { label: "Non payées",value: anneesNonPayees.length, color: "text-rose-400",    bg: "bg-rose-500/10   border-rose-500/15",    icon: Clock        },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <div key={label} className={`glass rounded-2xl p-3 border ${bg} text-center`}>
                <Icon size={18} className={`${color} mx-auto mb-1`} />
                <div className={`text-xl font-black ${color}`}>{value}</div>
                <div className="text-xs text-slate-600 mt-0.5 leading-tight">{label}</div>
              </div>
            ))}
          </div>

          <Card>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total versé</span>
              <span className="font-semibold text-emerald-400">{formatMontant(totalAnnuelPaye, devise)}</span>
            </div>
            {totalAnnuelDu > 0 && (
              <div className="flex justify-between text-sm mt-2 pt-2 border-t border-white/[0.06]">
                <span className="text-slate-400">Reste dû</span>
                <span className="font-semibold text-rose-400">{formatMontant(totalAnnuelDu, devise)}</span>
              </div>
            )}
            <div className="divide-y divide-white/[0.05] mt-3">
              {[...toutesAnnees].reverse().map((annee) => {
                const statut = statutAnnee(annee)
                const paye   = abParAnnee[annee] ?? 0
                const reste  = Math.max(0, montantAnnuel - paye)
                const ab     = abonnements.find((a) => a.annee === annee)
                return (
                  <div key={annee} className="py-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-slate-200">Année {annee}</div>
                      {statut === "partiel" && <div className="text-xs text-slate-600 mt-0.5">Versé {formatMontant(paye, devise)} · reste {formatMontant(reste, devise)}</div>}
                      {statut === "complet" && ab && <div className="text-xs text-slate-600 mt-0.5">Payé le {formatDate(ab.datePaiement)}</div>}
                    </div>
                    {statut === "complet"  && <Badge variant="success" dot>✓ Payé</Badge>}
                    {statut === "partiel"  && <Badge variant="warning" dot>Partiel</Badge>}
                    {statut === "non_paye" && <Badge variant="danger"  dot>Non payé</Badge>}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Résumé global */}
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <TrendingUp size={18} className="text-blue-400" />
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bilan global</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total versé (cotisations)</span>
              <span className="font-semibold text-emerald-400">{formatMontant(totalMensuelPaye, devise)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total versé (abonnements)</span>
              <span className="font-semibold text-emerald-400">{formatMontant(totalAnnuelPaye, devise)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-white/[0.06]">
              <span className="font-semibold text-slate-300">Total versé</span>
              <span className="font-black text-slate-100">{formatMontant(totalMensuelPaye + totalAnnuelPaye, devise)}</span>
            </div>
            {(totalMensuelDu + totalAnnuelDu) > 0 && (
              <div className="flex justify-between text-sm pt-1">
                <span className="font-semibold text-slate-300">Total restant dû</span>
                <span className="font-black text-rose-400">{formatMontant(totalMensuelDu + totalAnnuelDu, devise)}</span>
              </div>
            )}
          </div>
        </Card>

      </div>
    </main>
  )
}
