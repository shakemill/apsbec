"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Alert } from "@/components/ui/Alert"
import { Combobox } from "@/components/ui/Combobox"
import { Search, CheckCircle2, AlertCircle, Clock, CreditCard, Star, Users, User } from "lucide-react"
import type { Membre, Cotisation, Abonnement } from "@/types"
import { formatMois, getMoisDepuisInscription, getAnneesDepuisInscription, moisCourant } from "@/lib/utils"

interface Props {
  membres: Membre[]
  cotisations: Cotisation[]
  abonnements: Abonnement[]
  idsPayesCeMois: string[]
  moisCourant: string
  montantDefaut: number
  montantAnnuelDefaut: number
  devise: string
}

// ── Shared styled input ────────────────────────────────────────────────────────

function GlassInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`glass w-full rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 border border-white/[0.06] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all ${className}`}
    />
  )
}

function GlassSelect({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`glass w-full rounded-xl px-4 py-2.5 text-sm text-slate-100 border border-white/[0.06] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all ${className}`}
    >
      {children}
    </select>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{children}</label>
}

// ─── Onglet Lot ───────────────────────────────────────────────────────────────

function ModeLot({ membres, cotisations, montantDefaut, devise }: {
  membres: Membre[]
  cotisations: Cotisation[]
  montantDefaut: number
  devise: string
}) {
  const router = useRouter()
  const [selection, setSelection] = useState<Set<string>>(new Set())
  const [montant, setMontant] = useState(String(montantDefaut))
  const [mois, setMois] = useState(moisCourant())
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [search, setSearch] = useState("")

  const payesDuMois = new Set(cotisations.filter((c) => c.mois === mois).map((c) => c.membreId))

  const membresFiltres = membres.filter((m) => {
    if (!search) return true
    const q = search.toLowerCase()
    return m.nom.toLowerCase().includes(q) || m.prenom.toLowerCase().includes(q) || m.telephone.includes(q)
  })

  function toggleMembre(id: string) {
    setSelection((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectTousEnRetard() {
    setSelection(new Set(membres.filter((m) => !payesDuMois.has(m.id)).map((m) => m.id)))
  }

  async function handleSaisie() {
    if (selection.size === 0) { setResult({ type: "error", message: "Sélectionnez au moins un membre." }); return }
    const mont = parseInt(montant)
    if (isNaN(mont) || mont <= 0) { setResult({ type: "error", message: "Montant invalide." }); return }
    setLoading(true); setResult(null)
    try {
      // Pour les membres avec paiement partiel, on plafonne au solde restant
      // afin d'éviter les surpaiements
      const lignes = [...selection].map((membreId) => {
        const cotExist = cotisations.find((c) => c.mois === mois && c.membreId === membreId)
        let montantFinal = mont
        if (cotExist && montantDefaut > 0) {
          const reste = Math.max(0, montantDefaut - cotExist.montant)
          montantFinal = Math.min(mont, reste)
        }
        return { membreId, mois, montant: montantFinal }
      }).filter((l) => l.montant > 0)

      if (lignes.length === 0) {
        setResult({ type: "error", message: "Tous les membres sélectionnés sont déjà complets." }); return
      }

      const res = await fetch("/api/cotisations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "rattrapage", lignes }),
      })
      if (!res.ok) { setResult({ type: "error", message: "Erreur lors de la saisie." }); return }
      const data = await res.json()
      setResult({ type: "success", message: `${data.count} cotisation(s) enregistrée(s) pour ${formatMois(mois)}.` })
      setSelection(new Set())
      router.refresh()
    } catch {
      setResult({ type: "error", message: "Erreur de connexion." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="glass rounded-2xl p-4 border border-white/[0.06] flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Mois</FieldLabel>
            <GlassInput type="month" value={mois} onChange={(e) => { setMois(e.target.value); setSelection(new Set()) }} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Montant ({devise})</FieldLabel>
            <GlassInput type="number" value={montant} onChange={(e) => setMontant(e.target.value)} min={1} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-slate-400">
          <span className="font-semibold text-slate-200">{selection.size}</span> sélectionné(s)
        </span>
        <button onClick={selectTousEnRetard} className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
          <Users size={12} /> Tous en retard
        </button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <GlassInput
          type="text"
          placeholder="Rechercher un membre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-0.5">
        {membresFiltres.map((m) => {
          const cotMois = cotisations.find((c) => c.mois === mois && c.membreId === m.id)
          const estPaye = cotMois && montantDefaut > 0 && cotMois.montant >= montantDefaut
          const estPartiel = cotMois && !estPaye
          const estSelectionne = selection.has(m.id)
          const montantSaisi = parseInt(montant) || 0
          const soldeRestant = cotMois && montantDefaut > 0
            ? Math.max(0, montantDefaut - cotMois.montant) : 0
          const montantReel = estPartiel && montantDefaut > 0
            ? Math.min(montantSaisi, soldeRestant) : montantSaisi
          return (
            <button key={m.id} onClick={() => !estPaye && toggleMembre(m.id)} disabled={!!estPaye}
              className={`flex items-center gap-3 w-full text-left p-3 rounded-2xl border transition-all ${
                estPaye        ? "bg-emerald-500/5 border-emerald-500/15 opacity-60 cursor-default"
                : estSelectionne ? "bg-blue-500/15 border-blue-500/40"
                : "glass border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
              }`}>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                estPaye        ? "border-emerald-500 bg-emerald-500/20"
                : estSelectionne ? "border-blue-500 bg-blue-500"
                : "border-slate-600"
              }`}>
                {(estPaye || estSelectionne) && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200 truncate">{m.prenom} {m.nom}</div>
                {estPartiel && estSelectionne && montantReel > 0 ? (
                  <div className="text-xs text-amber-400 mt-0.5">
                    Avance {cotMois!.montant.toLocaleString()} · +{montantReel.toLocaleString()} {devise}
                    {montantReel + cotMois!.montant >= montantDefaut && " ✓ soldé"}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 font-mono">+{m.telephone}</div>
                )}
              </div>
              {estPaye    && <Badge variant="success" dot>Complet</Badge>}
              {estPartiel && !estSelectionne && <Badge variant="warning" dot>Avance {cotMois!.montant.toLocaleString()} {devise}</Badge>}
            </button>
          )
        })}
      </div>

      {result && <Alert type={result.type} message={result.message} />}
      <Button size="lg" loading={loading} onClick={handleSaisie} disabled={selection.size === 0}>
        Enregistrer {selection.size > 0 ? `(${selection.size})` : ""} cotisation{selection.size > 1 ? "s" : ""}
      </Button>
    </div>
  )
}

// ─── Onglet Rattrapage ────────────────────────────────────────────────────────

function ModeRattrapage({ membres, cotisations, montantDefaut, devise }: {
  membres: Membre[]
  cotisations: Cotisation[]
  montantDefaut: number
  devise: string
}) {
  const router = useRouter()
  const [membreId, setMembreId] = useState("")
  const [saisies, setSaisies] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const membre = membres.find((m) => m.id === membreId)
  const tousMois = membre ? getMoisDepuisInscription(membre.dateInscription) : []
  const cotsMembre = cotisations.filter((c) => c.membreId === membreId)
  const cotParMois: Record<string, Cotisation> = {}
  cotsMembre.forEach((c) => { cotParMois[c.mois] = c })

  const membreOptionsR = [...membres]
    .sort((a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`))
    .map((m) => ({ value: m.id, label: `${m.nom} ${m.prenom}`, hint: `+${m.telephone}` }))

  function statutMois(mois: string): "complet" | "partiel" | "non_paye" {
    const cot = cotParMois[mois]
    if (!cot) return "non_paye"
    if (montantDefaut > 0 && cot.montant >= montantDefaut) return "complet"
    return "partiel"
  }

  function resteARegler(mois: string): number {
    if (montantDefaut <= 0) return 0
    return Math.max(0, montantDefaut - (cotParMois[mois]?.montant ?? 0))
  }

  function setSaisie(mois: string, val: string) {
    setSaisies((prev) => ({ ...prev, [mois]: val }))
  }

  function preFillTousEnRetard() {
    const fills: Record<string, string> = {}
    tousMois.forEach((m) => {
      if (statutMois(m) !== "complet") fills[m] = String(resteARegler(m) || montantDefaut)
    })
    setSaisies(fills)
  }

  async function handleSubmit() {
    const lignes = Object.entries(saisies)
      .filter(([, v]) => v && parseInt(v) > 0)
      .map(([mois, v]) => ({ membreId, mois, montant: parseInt(v) }))
    if (lignes.length === 0) { setResult({ type: "error", message: "Aucun montant saisi." }); return }
    setLoading(true); setResult(null)
    try {
      const res = await fetch("/api/cotisations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "rattrapage", lignes }),
      })
      if (!res.ok) { setResult({ type: "error", message: "Erreur lors de la saisie." }); return }
      const data = await res.json()
      setResult({ type: "success", message: `${data.count} paiement(s) enregistré(s).` })
      setSaisies({})
      router.refresh()
    } catch {
      setResult({ type: "error", message: "Erreur de connexion." })
    } finally {
      setLoading(false)
    }
  }

  const nbSaisies = Object.values(saisies).filter((v) => v && parseInt(v) > 0).length

  return (
    <div className="flex flex-col gap-4">
      <Combobox
        label="Membre"
        icon={<User size={15} />}
        options={membreOptionsR}
        value={membreId}
        onChange={(val) => { setMembreId(val); setSaisies({}); setResult(null) }}
        searchable
        placeholder="— Choisir un membre —"
      />

      {membre && (
        <>
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-semibold text-slate-300">{membre.prenom} {membre.nom}</span>
            <button onClick={preFillTousEnRetard} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              Pré-remplir soldes
            </button>
          </div>
          <div className="text-xs text-slate-500 px-1 -mt-2">
            Saisir n&apos;importe quel montant — il s&apos;ajoute aux paiements existants.
          </div>

          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-0.5">
            {[...tousMois].reverse().map((mois) => {
              const statut = statutMois(mois)
              const cot = cotParMois[mois]
              const reste = resteARegler(mois)
              const valSaisie = saisies[mois] ?? ""

              return (
                <div key={mois} className={`rounded-2xl border p-3 flex flex-col gap-2.5 ${
                  statut === "complet"  ? "bg-emerald-500/5  border-emerald-500/15"
                  : statut === "partiel"  ? "bg-amber-500/5    border-amber-500/20"
                  : "glass border-white/[0.06]"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {statut === "complet"  && <CheckCircle2 size={14} className="text-emerald-400" />}
                      {statut === "partiel"  && <AlertCircle  size={14} className="text-amber-400"   />}
                      {statut === "non_paye" && <Clock        size={14} className="text-rose-400"    />}
                      <span className="text-sm font-medium text-slate-200 capitalize">{formatMois(mois)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {statut === "complet"  && <Badge variant="success" dot>Complet</Badge>}
                      {statut === "partiel"  && <Badge variant="warning" dot>Partiel — {cot!.montant.toLocaleString()} {devise}</Badge>}
                      {statut === "non_paye" && <Badge variant="danger"  dot>Non payé</Badge>}
                    </div>
                  </div>

                  {statut !== "complet" && (
                    <div className="flex gap-2 items-center">
                      <GlassInput
                        type="number"
                        min={1}
                        placeholder={statut === "partiel" ? `Reste : ${reste.toLocaleString()} ${devise}` : `Montant (${devise})`}
                        value={valSaisie}
                        onChange={(e) => setSaisie(mois, e.target.value)}
                      />
                      {montantDefaut > 0 && (
                        <button
                          onClick={() => setSaisie(mois, String(reste || montantDefaut))}
                          className="shrink-0 px-3 py-2 text-xs glass border border-white/[0.08] hover:border-white/[0.15] text-slate-300 hover:text-slate-100 rounded-xl transition-all"
                        >
                          {statut === "partiel" ? "Solde" : "Plein"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {result && <Alert type={result.type} message={result.message} />}
          <Button size="lg" loading={loading} onClick={handleSubmit} disabled={nbSaisies === 0}>
            Enregistrer {nbSaisies > 0 ? `${nbSaisies} paiement${nbSaisies > 1 ? "s" : ""}` : ""}
          </Button>
        </>
      )}
    </div>
  )
}

// ─── Onglet Abonnement annuel ─────────────────────────────────────────────────

function ModeAbonnement({ membres, abonnements, montantAnnuelDefaut, devise }: {
  membres: Membre[]
  abonnements: Abonnement[]
  montantAnnuelDefaut: number
  devise: string
}) {
  const router = useRouter()
  const [membreId, setMembreId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [saisies, setSaisies] = useState<Record<number, string>>({})

  const membre = membres.find((m) => m.id === membreId)
  const annees = membre ? getAnneesDepuisInscription(membre.dateInscription) : []
  const abParAnnee: Record<number, Abonnement> = {}
  abonnements.filter((a) => a.membreId === membreId).forEach((a) => { abParAnnee[a.annee] = a })

  const membreOptionsA = [...membres]
    .sort((a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`))
    .map((m) => ({ value: m.id, label: `${m.nom} ${m.prenom}`, hint: `+${m.telephone}` }))

  function statutAnnee(annee: number): "complet" | "partiel" | "non_paye" {
    const ab = abParAnnee[annee]
    if (!ab) return "non_paye"
    if (montantAnnuelDefaut <= 0 || ab.montant >= montantAnnuelDefaut) return "complet"
    return "partiel"
  }

  function resteAnnee(annee: number): number {
    if (montantAnnuelDefaut <= 0) return 0
    return Math.max(0, montantAnnuelDefaut - (abParAnnee[annee]?.montant ?? 0))
  }

  function setSaisie(annee: number, val: string) {
    setSaisies((prev) => ({ ...prev, [annee]: val }))
  }

  async function handleSubmit() {
    const lignes = Object.entries(saisies)
      .filter(([, v]) => v && parseInt(v) > 0)
      .map(([annee, v]) => ({ membreId, annee: parseInt(annee), montant: parseInt(v) }))
    if (lignes.length === 0) { setResult({ type: "error", message: "Aucun montant saisi." }); return }
    setLoading(true); setResult(null)
    try {
      await Promise.all(
        lignes.map((l) => fetch("/api/abonnements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(l),
        }))
      )
      setResult({ type: "success", message: `${lignes.length} abonnement(s) enregistré(s).` })
      setSaisies({})
      router.refresh()
    } catch {
      setResult({ type: "error", message: "Erreur de connexion." })
    } finally {
      setLoading(false)
    }
  }

  const nbSaisies = Object.values(saisies).filter((v) => v && parseInt(v) > 0).length

  return (
    <div className="flex flex-col gap-4">
      <Combobox
        label="Membre"
        icon={<User size={15} />}
        options={membreOptionsA}
        value={membreId}
        onChange={(val) => { setMembreId(val); setSaisies({}); setResult(null) }}
        searchable
        placeholder="— Choisir un membre —"
      />

      {membre && (
        <>
          <div className="text-sm font-semibold text-slate-300 px-1">
            {membre.prenom} {membre.nom}
          </div>

          <div className="flex flex-col gap-2">
            {[...annees].reverse().map((annee) => {
              const statut = statutAnnee(annee)
              const ab = abParAnnee[annee]
              const reste = resteAnnee(annee)
              const valSaisie = saisies[annee] ?? ""

              return (
                <div key={annee} className={`rounded-2xl border p-3 flex flex-col gap-2.5 ${
                  statut === "complet"  ? "bg-emerald-500/5  border-emerald-500/15"
                  : statut === "partiel"  ? "bg-amber-500/5    border-amber-500/20"
                  : "glass border-white/[0.06]"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {statut === "complet"  && <CheckCircle2 size={14} className="text-emerald-400" />}
                      {statut === "partiel"  && <AlertCircle  size={14} className="text-amber-400"   />}
                      {statut === "non_paye" && <Clock        size={14} className="text-rose-400"    />}
                      <span className="text-sm font-semibold text-slate-200">Année {annee}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {statut === "complet"  && <Badge variant="success" dot>Payé — {ab!.montant.toLocaleString()} {devise}</Badge>}
                      {statut === "partiel"  && <Badge variant="warning" dot>Partiel — {ab!.montant.toLocaleString()} {devise}</Badge>}
                      {statut === "non_paye" && <Badge variant="danger"  dot>Non payé</Badge>}
                    </div>
                  </div>

                  {statut !== "complet" && (
                    <div className="flex gap-2 items-center">
                      <GlassInput
                        type="number"
                        min={1}
                        placeholder={statut === "partiel" ? `Reste : ${reste.toLocaleString()} ${devise}` : `Montant (${devise})`}
                        value={valSaisie}
                        onChange={(e) => setSaisie(annee, e.target.value)}
                      />
                      {montantAnnuelDefaut > 0 && (
                        <button
                          onClick={() => setSaisie(annee, String(reste || montantAnnuelDefaut))}
                          className="shrink-0 px-3 py-2 text-xs glass border border-white/[0.08] hover:border-white/[0.15] text-slate-300 hover:text-slate-100 rounded-xl transition-all"
                        >
                          {statut === "partiel" ? "Solde" : "Plein"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {result && <Alert type={result.type} message={result.message} />}
          <Button size="lg" loading={loading} onClick={handleSubmit} disabled={nbSaisies === 0}>
            Enregistrer {nbSaisies > 0 ? `${nbSaisies} abonnement${nbSaisies > 1 ? "s" : ""}` : ""}
          </Button>
        </>
      )}
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function SaisieCotisations({ membres, cotisations, abonnements, idsPayesCeMois, moisCourant: moisCour, montantDefaut, montantAnnuelDefaut, devise }: Props) {
  const [onglet, setOnglet] = useState<"lot" | "rattrapage" | "abonnement">("lot")

  const tabs = [
    { key: "lot",         label: "En lot",       icon: <CreditCard size={13} /> },
    { key: "rattrapage",  label: "Avance/Solde",  icon: <Clock      size={13} /> },
    { key: "abonnement",  label: "Abonnement",   icon: <Star       size={13} /> },
  ] as const

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="glass rounded-2xl p-1 border border-white/[0.06] flex gap-1">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setOnglet(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
              onglet === tab.key
                ? tab.key === "abonnement"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {onglet === "lot"        && <ModeLot        membres={membres} cotisations={cotisations} montantDefaut={montantDefaut} devise={devise} />}
      {onglet === "rattrapage" && <ModeRattrapage membres={membres} cotisations={cotisations} montantDefaut={montantDefaut} devise={devise} />}
      {onglet === "abonnement" && <ModeAbonnement membres={membres} abonnements={abonnements} montantAnnuelDefaut={montantAnnuelDefaut} devise={devise} />}
    </div>
  )
}
