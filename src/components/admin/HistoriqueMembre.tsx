"use client"
import { useState } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { formatDate } from "@/lib/utils"
import { Copy, CheckCheck, CreditCard, Star, TrendingUp, CalendarDays, MapPin } from "lucide-react"
import type { Membre, Cotisation, Abonnement } from "@/types"

interface HistoriqueMembreProps {
  membre: Membre
  cotisations: Cotisation[]
  abonnements: Abonnement[]
}

export function HistoriqueMembre({ membre, cotisations, abonnements }: HistoriqueMembreProps) {
  const [copied, setCopied] = useState(false)

  const allPayments = [
    ...cotisations.map((c) => ({
      type: "cotisation" as const,
      date: c.datePaiement,
      mois: c.mois,
      montant: c.montant,
      note: c.note,
    })),
    ...abonnements.map((a) => ({
      type: "abonnement" as const,
      date: a.datePaiement,
      annee: a.annee,
      montant: a.montant,
      note: a.note,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalCotisations = cotisations.reduce((s, c) => s + c.montant, 0)
  const totalAbonnements = abonnements.reduce((s, a) => s + a.montant, 0)
  const totalGeneral     = totalCotisations + totalAbonnements

  function generateText(): string {
    let text = `📋 HISTORIQUE — ${membre.prenom.toUpperCase()} ${membre.nom.toUpperCase()}\n`
    text += `📱 +${membre.telephone}\n`
    text += `📅 Inscrit le ${formatDate(membre.dateInscription)}\n`
    text += `\n━━━━━━━━━━━━━━━━━━━━━━━\n`
    text += `PAIEMENTS\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    if (allPayments.length === 0) {
      text += "Aucun paiement enregistré.\n"
    } else {
      allPayments.forEach((p, i) => {
        if (p.type === "cotisation") text += `${i + 1}. Cotisation ${p.mois}\n`
        else                         text += `${i + 1}. Abonnement ${p.annee}\n`
        text += `   ${p.montant.toLocaleString("fr-FR")} FCFA — ${formatDate(p.date)}\n`
        if (p.note) text += `   Note : ${p.note}\n`
        text += "\n"
      })
    }
    text += `━━━━━━━━━━━━━━━━━━━━━━━\n`
    text += `Cotisations : ${totalCotisations.toLocaleString("fr-FR")} FCFA\n`
    text += `Abonnements : ${totalAbonnements.toLocaleString("fr-FR")} FCFA\n`
    text += `TOTAL       : ${totalGeneral.toLocaleString("fr-FR")} FCFA\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━━\n`
    return text
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(generateText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Erreur lors de la copie:", err)
    }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Profil rapide */}
      <Card>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <CalendarDays size={13} className="text-slate-500" />
            Membre depuis {formatDate(membre.dateInscription)} · {membre.age} ans
          </div>
          {membre.adresse && (
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin size={13} className="text-slate-500" />
              {membre.adresse}
            </div>
          )}
        </div>
      </Card>

      {/* Totaux */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass rounded-2xl p-3 border border-blue-500/15 bg-blue-500/5 text-center">
          <CreditCard size={16} className="text-blue-400 mx-auto mb-1" />
          <div className="text-base font-black text-blue-400">{totalCotisations.toLocaleString("fr-FR")}</div>
          <div className="text-xs text-slate-600 mt-0.5">{cotisations.length} cotis.</div>
        </div>
        <div className="glass rounded-2xl p-3 border border-emerald-500/15 bg-emerald-500/5 text-center">
          <Star size={16} className="text-emerald-400 mx-auto mb-1" />
          <div className="text-base font-black text-emerald-400">{totalAbonnements.toLocaleString("fr-FR")}</div>
          <div className="text-xs text-slate-600 mt-0.5">{abonnements.length} abonn.</div>
        </div>
        <div className="glass rounded-2xl p-3 border border-amber-500/15 bg-amber-500/5 text-center">
          <TrendingUp size={16} className="text-amber-400 mx-auto mb-1" />
          <div className="text-base font-black text-amber-400">{totalGeneral.toLocaleString("fr-FR")}</div>
          <div className="text-xs text-slate-600 mt-0.5">Total</div>
        </div>
      </div>

      {/* Bouton copier */}
      <Button
        onClick={handleCopy}
        variant={copied ? "secondary" : "primary"}
        size="lg"
        icon={copied ? <CheckCheck size={16} /> : <Copy size={16} />}
      >
        {copied ? "Copié pour WhatsApp !" : "Copier pour WhatsApp"}
      </Button>

      {/* Liste des paiements */}
      <Card>
        <CardHeader>
          <CardTitle>Historique ({allPayments.length} paiements)</CardTitle>
        </CardHeader>
        {allPayments.length === 0 ? (
          <p className="text-center text-slate-600 py-6 text-sm">Aucun paiement enregistré.</p>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {allPayments.map((p, idx) => (
              <div
                key={`${p.type}-${p.type === "cotisation" ? p.mois : p.annee}-${idx}`}
                className="py-3 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    p.type === "cotisation" ? "bg-blue-500/10 border border-blue-500/20" : "bg-violet-500/10 border border-violet-500/20"
                  }`}>
                    {p.type === "cotisation"
                      ? <CreditCard size={13} className="text-blue-400" />
                      : <Star       size={13} className="text-violet-400" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">
                      {p.type === "cotisation"
                        ? `Cotisation ${p.mois}`
                        : `Abonnement ${p.annee}`}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{formatDate(p.date)}</div>
                    {p.note && <div className="text-xs text-slate-600 mt-0.5 italic">{p.note}</div>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-slate-100">{p.montant.toLocaleString("fr-FR")}</div>
                  <div className="text-xs text-slate-600">FCFA</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
