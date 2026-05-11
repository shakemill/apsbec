import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/auth"
import { getAllMembres, getAllCotisations, getAllAbonnements, getConfig } from "@/lib/blob"
import { PageHeader } from "@/components/ui/PageHeader"
import { RapportWhatsApp } from "@/components/admin/RapportWhatsApp"
import { moisCourant } from "@/lib/utils"

export default async function RapportPage() {
  const ok = await isAdminAuthenticated()
  if (!ok) redirect("/admin")

  const [membres, cotisations, abonnements, config] = await Promise.all([
    getAllMembres(),
    getAllCotisations(),
    getAllAbonnements(),
    getConfig(),
  ])

  const defaultConfig = {
    cotisationMensuelle: 0,
    abonnementAnnuel: 0,
    nomClub: "APSBEC",
    devise: "FCFA",
    codeAdminHash: "",
  }

  return (
    <main className="min-h-screen px-4 py-8 pb-16">
      <div className="max-w-lg mx-auto animate-fade-up">
        <PageHeader
          title="Rapport"
          subtitle="Exporter pour WhatsApp"
          backHref="/admin/dashboard"
        />
        <RapportWhatsApp
          membres={membres}
          cotisations={cotisations}
          abonnements={abonnements}
          config={config ?? defaultConfig}
          moisDefaut={moisCourant()}
          anneeDefaut={new Date().getFullYear()}
        />
      </div>
    </main>
  )
}
