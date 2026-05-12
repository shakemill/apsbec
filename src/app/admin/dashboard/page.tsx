export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/auth"
import { getAllMembres, getAllCotisations, getConfig } from "@/lib/blob"
import { moisCourant, formatMontant } from "@/lib/utils"
import Link from "next/link"
import { StatCard } from "@/components/ui/Card"
import { ThemeToggle } from "@/components/ThemeToggle"
import {
  Users, Wallet, AlertCircle, Clock,
  UserCheck, TrendingUp, FileText, Settings, LogOut
} from "lucide-react"

export default async function AdminDashboard() {
  const ok = await isAdminAuthenticated()
  if (!ok) redirect("/admin")

  const [membres, cotisations, config] = await Promise.all([
    getAllMembres(),
    getAllCotisations(),
    getConfig(),
  ])

  const devise = config?.devise ?? "FCFA"
  const montantMensuel = config?.cotisationMensuelle ?? 0
  const mois = moisCourant()

  const membresActifs   = membres.filter((m) => m.statut === "actif")
  const membresSuspendus = membres.filter((m) => m.statut === "suspendu")
  const membresAttente  = membres.filter((m) => m.statut === "en_attente")
  const cotisationsMois = cotisations.filter((c) => c.mois === mois)
  const idsPayes        = new Set(cotisationsMois.filter((c) => montantMensuel <= 0 || c.montant >= montantMensuel).map((c) => c.membreId))
  const enRetard        = membresActifs.filter((m) => !idsPayes.has(m.id))
  const totalMois       = cotisationsMois.reduce((s, c) => s + c.montant, 0)
  const tauxRecouvrement = membresActifs.length > 0 ? Math.round((idsPayes.size / membresActifs.length) * 100) : 0

  const navItems = [
    { href: "/admin/membres",     icon: Users,     label: "Membres",         desc: "Gérer les inscriptions",      iconColor: "text-blue-400",   bg: "bg-blue-500/10",    border: "hover:border-blue-500/25" },
    { href: "/admin/cotisations", icon: Wallet,     label: "Cotisations",     desc: "Saisir les paiements",        iconColor: "text-emerald-400",bg: "bg-emerald-500/10", border: "hover:border-emerald-500/25" },
    { href: "/admin/rapport",     icon: FileText,   label: "Rapport mensuel", desc: "État à partager sur WhatsApp",iconColor: "text-amber-400",  bg: "bg-amber-500/10",   border: "hover:border-amber-500/25" },
    { href: "/admin/config",      icon: Settings,   label: "Configuration",   desc: "Paramètres du club",          iconColor: "text-slate-400",  bg: "bg-slate-500/10",   border: "hover:border-slate-500/25" },
  ]

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <span className="text-[10px] font-black text-white">AP</span>
              </div>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Admin</span>
            </div>
            <h1 className="text-xl font-bold text-slate-100">Tableau de bord</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-400 glass px-3 py-2 rounded-xl transition-colors">
                <LogOut size={14} />
                Déconnexion
              </button>
            </form>
          </div>
        </div>

        {/* Alerte membres en attente */}
        {membresAttente.length > 0 && (
          <Link href="/admin/membres?filtre=en_attente"
            className="animate-fade-up flex items-center gap-3 glass rounded-2xl p-3.5 mb-5 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Clock size={16} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-amber-300">
                {membresAttente.length} inscription{membresAttente.length > 1 ? "s" : ""} en attente
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Cliquez pour valider</div>
            </div>
            <svg className="w-4 h-4 text-amber-500/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-up delay-1">
          <StatCard
            label="Total membres"
            value={membres.length}
            icon={<UserCheck size={20} />}
            color="blue"
            sub={`${membresActifs.length} actif${membresActifs.length > 1 ? "s" : ""}${membresAttente.length ? ` · ${membresAttente.length} en attente` : ""}${membresSuspendus.length ? ` · ${membresSuspendus.length} suspendu${membresSuspendus.length > 1 ? "s" : ""}` : ""}`}
          />
          <StatCard label="En retard ce mois" value={enRetard.length}      icon={<AlertCircle size={20} />} color="red" />
          <StatCard label="Encaissé ce mois" value={formatMontant(totalMois, devise)} icon={<Wallet size={20} />} color="green" />
          <StatCard label="Taux recouvrement" value={`${tauxRecouvrement}%`} icon={<TrendingUp size={20} />} color="purple" />
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-2.5 animate-fade-up delay-2">
          {navItems.map(({ href, icon: Icon, label, desc, iconColor, bg, border }) => (
            <Link key={href} href={href}
              className={`group flex items-center gap-4 glass rounded-2xl p-4 border border-white/[0.08] ${border} hover:bg-white/[0.05] active:scale-[0.98]`}>
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={19} className={iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-100">{label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </div>
              <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
