"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Alert } from "@/components/ui/Alert"
import { User, CalendarDays, MapPin, Phone } from "lucide-react"
import type { Membre } from "@/types"

export function ModifierMembreForm({ membre }: { membre: Membre }) {
  const router = useRouter()
  const [form, setForm] = useState({
    nom: membre.nom,
    prenom: membre.prenom,
    age: String(membre.age),
    adresse: membre.adresse ?? "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`/api/membres/${membre.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom.trim().toUpperCase(),
          prenom: form.prenom.trim(),
          age: parseInt(form.age),
          adresse: form.adresse.trim() || undefined,
        }),
      })
      if (!res.ok) { setError("Erreur lors de la mise à jour."); return }
      router.push("/admin/membres")
    } catch {
      setError("Erreur de connexion.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Téléphone (non modifiable) */}
      <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/[0.06]">
        <Phone size={15} className="text-slate-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-500 mb-0.5">Téléphone (non modifiable)</div>
          <div className="text-sm font-mono font-semibold text-blue-400">+{membre.telephone}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input id="prenom" label="Prénom *" icon={<User size={15} />} value={form.prenom} onChange={(e) => update("prenom", e.target.value)} />
        <Input id="nom"    label="Nom *"    icon={<User size={15} />} value={form.nom}    onChange={(e) => update("nom",    e.target.value)} />
      </div>
      <Input id="age"     label="Âge *"               icon={<CalendarDays size={15} />} type="number" inputMode="numeric" min={5} max={120} value={form.age}     onChange={(e) => update("age",     e.target.value)} />
      <Input id="adresse" label="Adresse (facultatif)" icon={<MapPin size={15} />}       placeholder="Ville, Pays"       value={form.adresse} onChange={(e) => update("adresse", e.target.value)} />

      {error && <Alert type="error" message={error} />}
      <Button type="submit" size="lg" loading={loading}>Enregistrer les modifications</Button>
    </form>
  )
}
