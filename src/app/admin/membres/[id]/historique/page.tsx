import { redirect, notFound } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/auth"
import { getMembre, getCotisationsByMembre, getAbonnementsByMembre } from "@/lib/blob"
import { PageHeader } from "@/components/ui/PageHeader"
import { HistoriqueMembre } from "@/components/admin/HistoriqueMembre"

export default async function HistoriqueMembrePage({ params }: { params: Promise<{ id: string }> }) {
  const ok = await isAdminAuthenticated()
  if (!ok) redirect("/admin")

  const { id } = await params
  const membre = await getMembre(id)
  if (!membre) notFound()

  const cotisations = await getCotisationsByMembre(id)
  const abonnements = await getAbonnementsByMembre(id)

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <PageHeader
          title={`Historique de ${membre.prenom} ${membre.nom}`}
          subtitle={`+${membre.telephone}`}
          backHref="/admin/membres"
        />
        <HistoriqueMembre 
          membre={membre} 
          cotisations={cotisations} 
          abonnements={abonnements}
        />
      </div>
    </main>
  )
}
