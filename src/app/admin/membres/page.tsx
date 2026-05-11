import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/auth"
import { getAllMembres } from "@/lib/blob"
import { PageHeader } from "@/components/ui/PageHeader"
import { Badge } from "@/components/ui/Badge"
import { Pagination } from "@/components/ui/Pagination"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import type { StatutMembre } from "@/types"
import { MembreActions } from "@/components/admin/MembreActions"
import { MembresFilters } from "@/components/admin/MembresFilters"
import { UserPlus, Phone, CalendarDays } from "lucide-react"

const PAGE_SIZE = 10

const statutBadge: Record<StatutMembre, { variant: "success" | "warning" | "danger"; label: string }> = {
  actif:      { variant: "success", label: "Actif"      },
  en_attente: { variant: "warning", label: "En attente" },
  suspendu:   { variant: "danger",  label: "Suspendu"   },
}

export default async function AdminMembresPage({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string; q?: string; sort?: string; page?: string }>
}) {
  const ok = await isAdminAuthenticated()
  if (!ok) redirect("/admin")

  const { filtre, q, sort, page: pageParam } = await searchParams
  let membres = await getAllMembres()

  // ── Filtres ────────────────────────────────────────────────────────────────
  if (filtre) membres = membres.filter((m) => m.statut === filtre)
  if (q) {
    const query = q.toLowerCase()
    membres = membres.filter(
      (m) =>
        m.nom.toLowerCase().includes(query) ||
        m.prenom.toLowerCase().includes(query) ||
        m.telephone.includes(query)
    )
  }

  // ── Tri ────────────────────────────────────────────────────────────────────
  if (sort === "oldest")    membres.sort((a, b) => a.dateInscription.localeCompare(b.dateInscription))
  else if (sort === "name") membres.sort((a, b) => `${a.prenom} ${a.nom}`.toLowerCase().localeCompare(`${b.prenom} ${b.nom}`.toLowerCase()))
  else if (sort === "age")  membres.sort((a, b) => b.age - a.age)
  else                      membres.sort((a, b) => b.dateInscription.localeCompare(a.dateInscription))

  // ── Pagination ─────────────────────────────────────────────────────────────
  const total      = membres.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page       = Math.min(Math.max(1, parseInt(pageParam ?? "1") || 1), totalPages)
  const paginatedMembres = membres.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Params to forward to Pagination (without page itself)
  const queryParams: Record<string, string> = {}
  if (filtre) queryParams.filtre = filtre
  if (q)      queryParams.q      = q
  if (sort)   queryParams.sort   = sort

  return (
    <main className="min-h-screen px-4 py-8 pb-16">
      <div className="max-w-lg mx-auto animate-fade-up">
        <PageHeader
          title="Membres"
          subtitle={`${total} membre${total > 1 ? "s" : ""}`}
          backHref="/admin/dashboard"
          action={
            <Link
              href="/admin/membres/nouveau"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors active:scale-95"
            >
              <UserPlus size={14} />
              Ajouter
            </Link>
          }
        />

        <MembresFilters filtre={filtre} q={q} />

        {total === 0 ? (
          <div className="glass rounded-2xl border border-white/[0.06] p-8 text-center">
            <p className="text-slate-500 text-sm">Aucun membre trouvé.</p>
          </div>
        ) : (
          <>
            {/* Indicateur de page si plus d'une page */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs text-slate-600">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} sur {total}
                </span>
                <span className="text-xs text-slate-600">
                  Page {page} / {totalPages}
                </span>
              </div>
            )}

            {/* Liste */}
            <div className="flex flex-col gap-3">
              {paginatedMembres.map((m) => {
                const { variant, label } = statutBadge[m.statut]
                const initials = `${m.prenom[0]}${m.nom[0]}`.toUpperCase()
                return (
                  <div key={m.id} className="glass rounded-2xl p-4 border border-white/[0.06]">
                    <div className="flex items-start gap-3">
                      {/* Avatar initiales */}
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-blue-400">{initials}</span>
                      </div>
                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-slate-100 truncate">{m.prenom} {m.nom}</div>
                          <Badge variant={variant} dot>{label}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                            <Phone size={11} />+{m.telephone}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-600">
                            <CalendarDays size={11} />{formatDate(m.dateInscription)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <MembreActions membre={m} />
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              baseUrl="/admin/membres"
              queryParams={queryParams}
            />
          </>
        )}
      </div>
    </main>
  )
}
