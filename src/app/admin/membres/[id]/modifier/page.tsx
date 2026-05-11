import { redirect, notFound } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/auth"
import { getMembre } from "@/lib/blob"
import { ModifierMembreForm } from "@/components/admin/ModifierMembreForm"
import { PageHeader } from "@/components/ui/PageHeader"

export default async function ModifierMembrePage({ params }: { params: Promise<{ id: string }> }) {
  const ok = await isAdminAuthenticated()
  if (!ok) redirect("/admin")
  const { id } = await params
  const membre = await getMembre(id)
  if (!membre) notFound()

  return (
    <main className="min-h-screen px-4 py-8 pb-16">
      <div className="max-w-sm mx-auto animate-fade-up">
        <PageHeader title="Modifier le membre" backHref="/admin/membres" />
        <ModifierMembreForm membre={membre} />
      </div>
    </main>
  )
}
