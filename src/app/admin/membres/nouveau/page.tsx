"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Combobox } from "@/components/ui/Combobox"
import { Alert } from "@/components/ui/Alert"
import { PageHeader } from "@/components/ui/PageHeader"
import { User, Phone, Globe, MapPin, CalendarDays } from "lucide-react"

const INDICATIFS = [
  { code: "237", pays: "🇨🇲 Cameroun" },
  { code: "33",  pays: "🇫🇷 France" },
  { code: "32",  pays: "🇧🇪 Belgique" },
  { code: "41",  pays: "🇨🇭 Suisse" },
  { code: "1",   pays: "🇺🇸 États-Unis / Canada" },
  { code: "44",  pays: "🇬🇧 Royaume-Uni" },
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

export default function NouveauMembrePage() {
  const router = useRouter()
  const [indicatif, setIndicatif] = useState("237")
  const [form, setForm] = useState({ nom: "", prenom: "", numero: "", age: "", adresse: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const update = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError("")
    if (!form.nom || !form.prenom || !form.numero || !form.age) { setError("Tous les champs obligatoires sont requis."); return }
    const telephone = `${indicatif}${form.numero.replace(/\s/g, "")}`
    setLoading(true)
    try {
      const res = await fetch("/api/membres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: form.nom.trim().toUpperCase(), prenom: form.prenom.trim(), telephone, age: parseInt(form.age), adresse: form.adresse.trim() || undefined, statut: "actif" }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Erreur."); return }
      // Attendre que Vercel Blob indexe le nouveau blob (~800-1000ms)
      await new Promise((r) => setTimeout(r, 1500))
      router.push("/admin/membres")
    } catch { setError("Erreur de connexion.") }
    finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-sm mx-auto animate-fade-up">
        <PageHeader title="Nouveau membre" backHref="/admin/membres" />
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

          <Input id="numero" label="Téléphone *" icon={<Phone size={15} />} type="tel" inputMode="numeric" placeholder="695 101 010" value={form.numero} onChange={(e) => update("numero", e.target.value)} />

          {form.numero && (
            <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-xs text-slate-500">Numéro complet</span>
              <span className="ml-auto text-sm font-mono font-semibold text-blue-400">+{indicatif}{form.numero.replace(/\s/g, "")}</span>
            </div>
          )}

          <Input id="age"     label="Âge *"               icon={<CalendarDays size={15} />} type="number" inputMode="numeric" placeholder="30" min={5} max={120} value={form.age}     onChange={(e) => update("age",     e.target.value)} />
          <Input id="adresse" label="Adresse (facultatif)" icon={<MapPin size={15} />}       placeholder="Ville, Pays"  value={form.adresse} onChange={(e) => update("adresse", e.target.value)} />

          {error && <Alert type="error" message={error} />}
          <Button type="submit" size="lg" loading={loading} onClick={handleSubmit}>Ajouter le membre</Button>
        </div>
      </div>
    </main>
  )
}
