"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Alert } from "@/components/ui/Alert"
import { ThemeToggle } from "@/components/ThemeToggle"
import { ShieldCheck, Lock } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!code.trim()) { setError("Veuillez saisir le code administrateur."); return }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error ?? `Erreur ${res.status}. Réessayez.`); return }
      router.push("/admin/dashboard")
    } catch { setError("Erreur de connexion. Réessayez.") }
    finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5">
      <div className="fixed top-4 right-4 z-50"><ThemeToggle /></div>
      <div className="w-full max-w-sm animate-fade-up">

        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-2xl bg-violet-500/30 blur-xl scale-75" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-900/40">
              <ShieldCheck size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Administration</h1>
          <p className="text-sm text-slate-500 mt-1">Accès réservé aux administrateurs</p>
        </div>

        {/* Form */}
        <div className="glass rounded-3xl p-6 border border-white/[0.06]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="code"
              label="Code d'accès"
              icon={<Lock size={15} />}
              type="password"
              placeholder="••••••••"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="off"
            />
            {error && <Alert type="error" message={error} />}
            <Button type="submit" size="lg" loading={loading}>
              Se connecter
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-slate-700 hover:text-slate-500 transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  )
}
