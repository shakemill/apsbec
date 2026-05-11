import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/auth"
import { getAllMembres, getAllCotisations, getAllAbonnements, getConfig } from "@/lib/blob"
import { PageHeader } from "@/components/ui/PageHeader"
import { SaisieCotisations } from "@/components/admin/SaisieCotisations"
import { moisCourant, formatMois, formatMontant } from "@/lib/utils"
import { CheckCircle2, Clock, Wallet, TrendingUp, Star } from "lucide-react"

export default async function CotisationsPage() {
  const ok = await isAdminAuthenticated()
  if (!ok) redirect("/admin")

  const [membres, cotisations, abonnements, config] = await Promise.all([
    getAllMembres(),
    getAllCotisations(),
    getAllAbonnements(),
    getConfig(),
  ])

  const mois                = moisCourant()
  const annee               = new Date().getFullYear()
  const membresActifs       = membres.filter((m) => m.statut === "actif")
  const devise              = config?.devise ?? "FCFA"
  const montantDefaut       = config?.cotisationMensuelle ?? 0
  const montantAnnuelDefaut = config?.abonnementAnnuel ?? 0

  // Stats mois courant
  const cotisationsDuMois = cotisations.filter((c) => c.mois === mois)
  const idsPayesCeMois    = new Set(cotisationsDuMois.map((c) => c.membreId))
  const nbComplets        = cotisationsDuMois.filter((c) => montantDefaut <= 0 || c.montant >= montantDefaut).length
  const nbAucunPaiement   = membresActifs.length - cotisationsDuMois.length
  const totalMois         = cotisationsDuMois.reduce((s, c) => s + c.montant, 0)

  // Totaux globaux
  const totalCotisationsAll  = cotisations.reduce((s, c) => s + c.montant, 0)
  const totalAbonnementsAnnee = abonnements
    .filter((a) => a.annee === annee)
    .reduce((s, a) => s + a.montant, 0)

  return (
    <main className="min-h-screen px-4 py-8 pb-16">
      <div className="max-w-lg mx-auto animate-fade-up">
        <PageHeader
          title="Cotisations"
          subtitle={`${formatMois(mois)} — ${nbComplets}/${membresActifs.length} à jour`}
          backHref="/admin/dashboard"
        />

        {/* Stats mois courant */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="glass rounded-2xl p-3 border border-emerald-500/15 bg-emerald-500/5 text-center">
            <CheckCircle2 size={18} className="text-emerald-400 mx-auto mb-1" />
            <div className="text-xl font-black text-emerald-400">{nbComplets}</div>
            <div className="text-xs text-slate-500 mt-0.5">Complets</div>
          </div>
          <div className="glass rounded-2xl p-3 border border-rose-500/15 bg-rose-500/5 text-center">
            <Clock size={18} className="text-rose-400 mx-auto mb-1" />
            <div className="text-xl font-black text-rose-400">{nbAucunPaiement}</div>
            <div className="text-xs text-slate-500 mt-0.5">Aucun paiement</div>
          </div>
          <div className="glass rounded-2xl p-3 border border-blue-500/15 bg-blue-500/5 text-center">
            <Wallet size={18} className="text-blue-400 mx-auto mb-1" />
            <div className="text-sm font-black text-blue-400 leading-tight">{formatMontant(totalMois, devise)}</div>
            <div className="text-xs text-slate-500 mt-0.5">Encaissé ce mois</div>
          </div>
        </div>

        {/* Totaux globaux */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="glass rounded-2xl p-4 border border-violet-500/15 bg-violet-500/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
              <TrendingUp size={17} className="text-violet-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">Total cotisations</div>
              <div className="text-base font-black text-violet-400 leading-tight truncate">{formatMontant(totalCotisationsAll, devise)}</div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 border border-amber-500/15 bg-amber-500/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Star size={17} className="text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">Abonnements {annee}</div>
              <div className="text-base font-black text-amber-400 leading-tight truncate">{formatMontant(totalAbonnementsAnnee, devise)}</div>
            </div>
          </div>
        </div>

        <SaisieCotisations
          membres={membresActifs}
          cotisations={cotisations}
          abonnements={abonnements}
          idsPayesCeMois={[...idsPayesCeMois]}
          moisCourant={mois}
          montantDefaut={montantDefaut}
          montantAnnuelDefaut={montantAnnuelDefaut}
          devise={devise}
        />
      </div>
    </main>
  )
}
