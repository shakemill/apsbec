"use client"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Combobox } from "@/components/ui/Combobox"
import { Alert } from "@/components/ui/Alert"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import { Building2, Coins, Lock, ShieldCheck } from "lucide-react"

const deviseOptions = [
  { value: "FCFA", label: "FCFA — Franc CFA" },
  { value: "EUR",  label: "EUR — Euro (€)"   },
  { value: "USD",  label: "USD — Dollar ($)"  },
]
import type { Config } from "@/types"

interface Props {
  config: Config | null
}

export function ConfigForm({ config }: Props) {
  const [form, setForm] = useState({
    nomClub: config?.nomClub ?? "APSBEC",
    devise: config?.devise ?? "FCFA",
    cotisationMensuelle: String(config?.cotisationMensuelle ?? 0),
    abonnementAnnuel: String(config?.abonnementAnnuel ?? 0),
    codeActuel: "",
    nouveauCode: "",
    confirmerCode: "",
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null)

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResult(null)

    if (form.nouveauCode && form.nouveauCode !== form.confirmerCode) {
      setResult({ type: "error", message: "Les codes ne correspondent pas." })
      return
    }

    setLoading(true)
    try {
      const body: Record<string, unknown> = {
        nomClub: form.nomClub,
        devise: form.devise,
        cotisationMensuelle: parseInt(form.cotisationMensuelle),
        abonnementAnnuel: parseInt(form.abonnementAnnuel),
      }
      if (form.nouveauCode) {
        body.codeActuel = form.codeActuel
        body.nouveauCode = form.nouveauCode
      }

      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setResult({ type: "error", message: data.error ?? "Erreur." }); return }
      setResult({ type: "success", message: "Configuration enregistrée avec succès." })
      setForm((f) => ({ ...f, codeActuel: "", nouveauCode: "", confirmerCode: "" }))
    } catch (err) {
      setResult({ type: "error", message: err instanceof Error ? err.message : "Erreur de connexion." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Club info */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Building2 size={15} className="inline mr-2 text-blue-400" />
            Informations du club
          </CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-4">
          <Input id="nomClub" label="Nom du club" value={form.nomClub} onChange={(e) => update("nomClub", e.target.value)} />
          <Combobox
            label="Devise"
            icon={<Coins size={15} />}
            options={deviseOptions}
            value={form.devise}
            onChange={(val) => update("devise", val)}
          />
          <Input id="cotisationMensuelle" label="Cotisation mensuelle" type="number" min={0} inputMode="numeric" value={form.cotisationMensuelle} onChange={(e) => update("cotisationMensuelle", e.target.value)} />
          <Input id="abonnementAnnuel"    label="Abonnement annuel"    type="number" min={0} inputMode="numeric" value={form.abonnementAnnuel}    onChange={(e) => update("abonnementAnnuel",    e.target.value)} />
        </div>
      </Card>

      {/* Admin code */}
      <Card>
        <CardHeader>
          <CardTitle>
            <ShieldCheck size={15} className="inline mr-2 text-violet-400" />
            Changer le code admin
          </CardTitle>
        </CardHeader>
        <p className="text-xs text-slate-500 mb-4">Laissez vide pour conserver le code actuel.</p>
        <div className="flex flex-col gap-3">
          <Input id="codeActuel"    label="Code actuel"        icon={<Lock size={15} />} type="password" placeholder="••••••••" value={form.codeActuel}    onChange={(e) => update("codeActuel",    e.target.value)} autoComplete="off" />
          <Input id="nouveauCode"   label="Nouveau code"       icon={<Lock size={15} />} type="password" placeholder="••••••••" value={form.nouveauCode}   onChange={(e) => update("nouveauCode",   e.target.value)} autoComplete="off" />
          <Input id="confirmerCode" label="Confirmer le code"  icon={<Lock size={15} />} type="password" placeholder="••••••••" value={form.confirmerCode} onChange={(e) => update("confirmerCode", e.target.value)} autoComplete="off" />
        </div>
      </Card>

      {result && <Alert type={result.type} message={result.message} />}
      <Button type="submit" size="lg" loading={loading}>Enregistrer la configuration</Button>
    </form>
  )
}
