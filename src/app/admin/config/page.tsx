import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/auth"
import { getConfig } from "@/lib/blob"
import { PageHeader } from "@/components/ui/PageHeader"
import { ConfigForm } from "@/components/admin/ConfigForm"

export default async function ConfigPage() {
  const ok = await isAdminAuthenticated()
  if (!ok) redirect("/admin")
  const config = await getConfig()

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-sm mx-auto">
        <PageHeader title="Configuration" subtitle="Paramètres du club" backHref="/admin/dashboard" />
        <ConfigForm config={config} />
      </div>
    </main>
  )
}
