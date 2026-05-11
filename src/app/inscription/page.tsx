"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Combobox } from "@/components/ui/Combobox"
import { Alert } from "@/components/ui/Alert"
import { PageHeader } from "@/components/ui/PageHeader"
import { User, Phone, Globe, MapPin, CalendarDays, CheckCircle2 } from "lucide-react"

const INDICATIFS = [
  { code: "237", pays: "🇨🇲 Cameroun" },
  { code: "33",  pays: "🇫🇷 France" },
  { code: "32",  pays: "🇧🇪 Belgique" },
  { code: "41",  pays: "🇨🇭 Suisse" },
  { code: "1",   pays: "🇺🇸 États-Unis / Canada" },
  { code: "44",  pays: "🇬🇧 Royaume-Uni" },
  { code: "49",  pays: "🇩🇪 Allemagne" },
  { code: "34",  pays: "🇪🇸 Espagne" },
  { code: "39",  pays: "🇮🇹 Italie" },
  { code: "31",  pays: "🇳🇱 Pays-Bas" },
  { code: "351", pays: "🇵🇹 Portugal" },
  { code: "212", pays: "🇲🇦 Maroc" },
  { code: "213", pays: "🇩🇿 Algérie" },
  { code: "216", pays: "🇹🇳 Tunisie" },
  { code: "225", pays: "🇨🇮 Côte d'Ivoire" },
  { code: "221", pays: "🇸🇳 Sénégal" },
  { code: "241", pays: "🇬🇦 Gabon" },
  { code: "242", pays: "🇨🇬 Congo" },
  { code: "243", pays: "🇨🇩 RD Congo" },
]

const indicatifOptions = INDICATIFS.map((i) => ({
  value: i.code,
  label: i.pays,
  hint: `+${i.code}`,
}))

export default function InscriptionPage() {
  const router = useRouter()
  const [indicatif, setIndicatif] = useState("237")
  const [form, setForm]   = useState({ nom: "", prenom: "", numero: "", age: "", adresse: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [success, setSuccess] = useState(false)

  const update = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError("")
    if (!form.nom || !form.prenom || !form.numero || !form.age) {
      setError("Veuillez remplir tous les champs obligatoires."); return
    }
    const age = parseInt(form.age)
    if (isNaN(age) || age < 5 || age > 120) { setError("Âge invalide."); return }
    const telephone = `${indicatif}${form.numero.replace(/\s/g, "")}`
    setLoading(true)
    try {
      const res = await fetch("/api/membres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: form.nom.trim().toUpperCase(), prenom: form.prenom.trim(), telephone, age, adresse: form.adresse.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Erreur lors de l'inscription."); return }
      setSuccess(true)
      setTimeout(() => router.push("/"), 3500)
    } catch { setError("Erreur de connexion. Réessayez.") }
    finally { setLoading(false) }
  }

  if (success) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-sm text-center animate-fade-up">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl" />
            <div className="relative w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Inscription envoyée !</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Votre demande a été reçue.<br />L&apos;administrateur validera votre compte prochainement.
          </p>
          <p className="text-slate-600 text-xs mt-5">Redirection dans quelques secondes…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="max-w-sm mx-auto animate-fade-up">
        <PageHeader title="S'inscrire" subtitle="Rejoindre le club APSBEC" backHref="/" />

        <div className="glass rounded-3xl p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input id="prenom" label="Prénom *" icon={<User size={15} />} placeholder="Jean"   value={form.prenom} onChange={(e) => update("prenom", e.target.value)} />
            <Input id="nom"    label="Nom *"    icon={<User size={15} />} placeholder="DUPONT" value={form.nom}    onChange={(e) => update("nom",    e.target.value)} />
          </div>

          <Combobox
            label="Pays *"
            icon={<Globe size={15} />}
            options={indicatifOptions}
            value={indicatif}
            onChange={setIndicatif}
            searchable
            placeholder="Choisir un pays…"
          />

          <Input id="numero" label="Numéro de téléphone *" icon={<Phone size={15} />} type="tel" inputMode="numeric" placeholder="695 101 010" value={form.numero} onChange={(e) => update("numero", e.target.value)} />

          {form.numero && (
            <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-xs text-slate-500">Numéro complet</span>
              <span className="ml-auto text-sm font-mono font-semibold text-blue-400">+{indicatif}{form.numero.replace(/\s/g, "")}</span>
            </div>
          )}

          <Input id="age"     label="Âge *"               icon={<CalendarDays size={15} />} type="number" inputMode="numeric" placeholder="30" min={5} max={120} value={form.age}     onChange={(e) => update("age",     e.target.value)} />
          <Input id="adresse" label="Adresse (facultatif)" icon={<MapPin size={15} />}       placeholder="Ville, Pays"  value={form.adresse} onChange={(e) => update("adresse", e.target.value)} />

          {error && <Alert type="error" message={error} />}

          <Button type="submit" size="lg" loading={loading} onClick={handleSubmit}>
            Envoyer ma demande
          </Button>
        </div>
      </div>
    </main>
  )
}
