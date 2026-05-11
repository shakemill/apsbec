"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import { CheckCircle2, PauseCircle, PlayCircle, History, Pencil, Trash2 } from "lucide-react"
import type { Membre } from "@/types"

const ACTION_LABELS: Record<string, string> = {
  actif:    "validé et activé",
  suspendu: "suspendu",
  delete:   "supprimé",
}

export function MembreActions({ membre }: { membre: Membre }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null)

  async function patch(statut: string) {
    setLoading(statut)
    setResult(null)
    try {
      const res = await fetch(`/api/membres/${membre.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setResult({ type: "error", message: data.error ?? "Une erreur est survenue." })
        return
      }
      setResult({
        type: "success",
        message: `${membre.prenom} ${membre.nom} a été ${ACTION_LABELS[statut] ?? statut} avec succès.`,
      })
      router.refresh()
    } catch {
      setResult({ type: "error", message: "Erreur de connexion. Réessayez." })
    } finally {
      setLoading(null)
    }
  }

  async function supprimer() {
    if (!confirm(`Supprimer définitivement ${membre.prenom} ${membre.nom} ?\nToutes ses cotisations seront également supprimées.`)) return
    setLoading("delete")
    setResult(null)
    try {
      const res = await fetch(`/api/membres/${membre.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setResult({ type: "error", message: data.error ?? "Erreur lors de la suppression." })
        return
      }
      router.refresh()
    } catch {
      setResult({ type: "error", message: "Erreur de connexion. Réessayez." })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-3 mt-3">
      {result && (
        <Alert
          type={result.type}
          message={result.message}
          onClose={() => setResult(null)}
        />
      )}
      <div className="flex gap-2 flex-wrap">
        {membre.statut === "en_attente" && (
          <Button size="sm" variant="success" icon={<CheckCircle2 size={13} />} loading={loading === "actif"} onClick={() => patch("actif")}>
            Valider
          </Button>
        )}
        {membre.statut === "actif" && (
          <Button size="sm" variant="secondary" icon={<PauseCircle size={13} />} loading={loading === "suspendu"} onClick={() => patch("suspendu")}>
            Suspendre
          </Button>
        )}
        {membre.statut === "suspendu" && (
          <Button size="sm" variant="primary" icon={<PlayCircle size={13} />} loading={loading === "actif"} onClick={() => patch("actif")}>
            Réactiver
          </Button>
        )}
        <Button size="sm" variant="ghost" icon={<History size={13} />} onClick={() => router.push(`/admin/membres/${membre.id}/historique`)}>
          Historique
        </Button>
        <Button size="sm" variant="ghost" icon={<Pencil size={13} />} onClick={() => router.push(`/admin/membres/${membre.id}/modifier`)}>
          Modifier
        </Button>
        <Button size="sm" variant="danger" icon={<Trash2 size={13} />} loading={loading === "delete"} onClick={supprimer}>
          Supprimer
        </Button>
      </div>
    </div>
  )
}
