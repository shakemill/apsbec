"use client"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Copy, CheckCheck, Calendar, CreditCard, Star } from "lucide-react"
import { genererRapportWhatsApp, genererRapportAbonnements } from "@/lib/rapport"
import type { Membre, Cotisation, Abonnement, Config } from "@/types"

interface Props {
  membres: Membre[]
  cotisations: Cotisation[]
  abonnements: Abonnement[]
  config: Config
  moisDefaut: string
  anneeDefaut: number
}

// ── Sous-composant : rapport mensuel ─────────────────────────────────────────

function RapportMensuel({ membres, cotisations, config, moisDefaut }: {
  membres: Membre[]
  cotisations: Cotisation[]
  config: Config
  moisDefaut: string
}) {
  const [mois, setMois]   = useState(moisDefaut)
  const [copie, setCopie] = useState(false)

  const rapport = genererRapportWhatsApp(mois, membres, cotisations, config)

  async function copier() {
    await navigator.clipboard.writeText(rapport)
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar size={12} /> Mois du rapport
        </label>
        <input
          type="month"
          value={mois}
          onChange={(e) => setMois(e.target.value)}
          className="glass w-full rounded-xl px-4 py-2.5 text-sm text-slate-100 border border-white/[0.06]
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all"
        />
      </div>

      <Card>
        <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
          {rapport}
        </pre>
      </Card>

      <Button
        size="lg"
        onClick={copier}
        variant={copie ? "secondary" : "primary"}
        icon={copie ? <CheckCheck size={16} /> : <Copy size={16} />}
      >
        {copie ? "Copié !" : "Copier pour WhatsApp"}
      </Button>
      <p className="text-xs text-slate-600 text-center">Collez directement dans votre groupe WhatsApp</p>
    </div>
  )
}

// ── Sous-composant : rapport annuel ──────────────────────────────────────────

function RapportAnnuel({ membres, abonnements, config, anneeDefaut }: {
  membres: Membre[]
  abonnements: Abonnement[]
  config: Config
  anneeDefaut: number
}) {
  const [annee, setAnnee] = useState(anneeDefaut)
  const [copie, setCopie] = useState(false)

  const rapport = genererRapportAbonnements(annee, membres, abonnements, config)

  // Années disponibles : de la 1ère inscription à aujourd'hui
  const anneeMin = membres.length > 0
    ? Math.min(...membres.map((m) => new Date(m.dateInscription).getFullYear()))
    : anneeDefaut
  const anneeMax = new Date().getFullYear()
  const annees   = Array.from({ length: anneeMax - anneeMin + 1 }, (_, i) => anneeMax - i)

  async function copier() {
    await navigator.clipboard.writeText(rapport)
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar size={12} /> Année du rapport
        </label>
        <div className="flex gap-2">
          {annees.map((a) => (
            <button
              key={a}
              onClick={() => setAnnee(a)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                a === annee
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-900/40"
                  : "glass border border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/[0.12]"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Stats rapides */}
      {(() => {
        const membresActifs = membres.filter((m) => m.statut === "actif")
        const abMap: Record<string, number> = {}
        abonnements.filter((a) => a.annee === annee).forEach((a) => { abMap[a.membreId] = a.montant })
        const ma = config.abonnementAnnuel
        const nbPayes    = membresActifs.filter((m) => abMap[m.id] !== undefined && (ma <= 0 || abMap[m.id] >= ma)).length
        const nbPartiels = membresActifs.filter((m) => abMap[m.id] !== undefined && ma > 0 && abMap[m.id] < ma).length
        const nbNonPayes = membresActifs.length - nbPayes - nbPartiels
        const totalEnc   = abonnements.filter((a) => a.annee === annee).reduce((s, a) => s + a.montant, 0)
        return (
          <div className="grid grid-cols-3 gap-2">
            <div className="glass rounded-2xl p-3 border border-emerald-500/15 bg-emerald-500/5 text-center">
              <div className="text-xl font-black text-emerald-400">{nbPayes}</div>
              <div className="text-xs text-slate-600 mt-0.5">Payé</div>
            </div>
            <div className="glass rounded-2xl p-3 border border-amber-500/15 bg-amber-500/5 text-center">
              <div className="text-xl font-black text-amber-400">{nbPartiels}</div>
              <div className="text-xs text-slate-600 mt-0.5">Partiel</div>
            </div>
            <div className="glass rounded-2xl p-3 border border-rose-500/15 bg-rose-500/5 text-center">
              <div className="text-xl font-black text-rose-400">{nbNonPayes}</div>
              <div className="text-xs text-slate-600 mt-0.5">Non payé</div>
            </div>
          </div>
        )
      })()}

      <Card>
        <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
          {rapport}
        </pre>
      </Card>

      <Button
        size="lg"
        onClick={copier}
        variant={copie ? "secondary" : "primary"}
        icon={copie ? <CheckCheck size={16} /> : <Copy size={16} />}
      >
        {copie ? "Copié !" : "Copier pour WhatsApp"}
      </Button>
      <p className="text-xs text-slate-600 text-center">Collez directement dans votre groupe WhatsApp</p>
    </div>
  )
}

// ── Composant principal avec onglets ─────────────────────────────────────────

export function RapportWhatsApp({ membres, cotisations, abonnements, config, moisDefaut, anneeDefaut }: Props) {
  const [onglet, setOnglet] = useState<"mensuel" | "annuel">("mensuel")

  return (
    <div className="flex flex-col gap-4">
      {/* Onglets */}
      <div className="glass rounded-2xl p-1 border border-white/[0.06] flex gap-1">
        <button
          onClick={() => setOnglet("mensuel")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
            onglet === "mensuel"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <CreditCard size={14} />
          Cotisations mensuelles
        </button>
        <button
          onClick={() => setOnglet("annuel")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
            onglet === "annuel"
              ? "bg-violet-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Star size={14} />
          Abonnements annuels
        </button>
      </div>

      {onglet === "mensuel" && (
        <RapportMensuel
          membres={membres}
          cotisations={cotisations}
          config={config}
          moisDefaut={moisDefaut}
        />
      )}

      {onglet === "annuel" && (
        <RapportAnnuel
          membres={membres}
          abonnements={abonnements}
          config={config}
          anneeDefaut={anneeDefaut}
        />
      )}
    </div>
  )
}
