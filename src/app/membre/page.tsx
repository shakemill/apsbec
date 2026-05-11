"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input, Select } from "@/components/ui/Input"
import { Alert } from "@/components/ui/Alert"
import { PageHeader } from "@/components/ui/PageHeader"
import { Phone, Globe } from "lucide-react"
import Link from "next/link"

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

export default function MembrePage() {
  const router = useRouter()
  const [indicatif, setIndicatif] = useState("237")
  const [numero, setNumero] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const tel = `${indicatif}${numero.replace(/\s/g, "")}`
    if (numero.trim().length < 6) { setError("Veuillez saisir un numéro valide."); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/membres/telephone/${tel}`)
      if (!res.ok) { setError("Aucun compte trouvé pour ce numéro. Vérifiez ou inscrivez-vous."); return }
      router.push(`/membre/${tel}`)
    } catch { setError("Erreur de connexion. Réessayez.") }
    finally { setLoading(false) }
  }

  const telComplet = `+${indicatif}${numero.replace(/\s/g, "")}`

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm animate-fade-up">

        {/* Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mb-4">
            <Phone size={24} className="text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">Espace Membre</h1>
          <p className="text-sm text-slate-500 mt-1 text-center">Saisissez votre numéro pour accéder à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select
            id="indicatif"
            label="Pays"
            icon={<Globe size={16} />}
            value={indicatif}
            onChange={(e) => setIndicatif(e.target.value)}
          >
            {INDICATIFS.map((i) => (
              <option key={i.code} value={i.code} className="bg-slate-900">{i.pays} (+{i.code})</option>
            ))}
          </Select>

          <Input
            id="numero"
            label="Numéro de téléphone"
            icon={<Phone size={16} />}
            type="tel"
            placeholder="695 101 010"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            inputMode="numeric"
          />

          {/* Preview */}
          {numero && (
            <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-xs text-slate-500">Numéro complet</span>
              <span className="ml-auto text-sm font-mono font-semibold text-blue-400">{telComplet}</span>
            </div>
          )}

          {error && <Alert type="error" message={error} />}

          <Button type="submit" size="lg" loading={loading}>
            Accéder à mon compte
          </Button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-6">
          Pas encore membre ?{" "}
          <Link href="/inscription" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
            S&apos;inscrire
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-slate-700 hover:text-slate-500">← Retour à l&apos;accueil</Link>
        </div>
      </div>
    </main>
  )
}
