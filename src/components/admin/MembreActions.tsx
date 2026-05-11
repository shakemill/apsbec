"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { CheckCircle2, PauseCircle, PlayCircle, History, Pencil, Trash2 } from "lucide-react"
import type { Membre } from "@/types"

export function MembreActions({ membre }: { membre: Membre }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function patch(statut: string) {
    setLoading(statut)
    await fetch(`/api/membres/${membre.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    })
    router.refresh()
    setLoading(null)
  }

  async function supprimer() {
    if (!confirm(`Supprimer ${membre.prenom} ${membre.nom} ?`)) return
    setLoading("delete")
    await fetch(`/api/membres/${membre.id}`, { method: "DELETE" })
    router.refresh()
    setLoading(null)
  }

  return (
    <div className="flex gap-2 mt-3 flex-wrap">
      {membre.statut === "en_attente" && (
        <Button size="sm" variant="primary" icon={<CheckCircle2 size={13} />} loading={loading === "actif"} onClick={() => patch("actif")}>
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
  )
}
