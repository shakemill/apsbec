import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  queryParams?: Record<string, string>
}

export function Pagination({ currentPage, totalPages, baseUrl, queryParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(queryParams)
    if (page > 1) params.set("page", String(page))
    else params.delete("page")
    const qs = params.toString()
    return qs ? `${baseUrl}?${qs}` : baseUrl
  }

  // Build page number windows
  const pages: (number | "…")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push("…")
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push("…")
    pages.push(totalPages)
  }

  const btnBase = "flex items-center justify-center w-8 h-8 rounded-xl text-sm font-semibold transition-all"

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6 pb-2">
      {/* Prev */}
      {currentPage > 1 ? (
        <Link href={buildUrl(currentPage - 1)}
          className={`${btnBase} glass border border-white/[0.06] text-slate-400 hover:text-slate-100 hover:border-white/[0.14] active:scale-95`}>
          <ChevronLeft size={15} />
        </Link>
      ) : (
        <span className={`${btnBase} opacity-20 text-slate-600 cursor-not-allowed`}>
          <ChevronLeft size={15} />
        </span>
      )}

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`dot-${i}`} className="w-8 flex items-center justify-center text-slate-600 text-sm">…</span>
        ) : p === currentPage ? (
          <span key={p} className={`${btnBase} bg-blue-600 text-white shadow-sm shadow-blue-900/50`}>{p}</span>
        ) : (
          <Link key={p} href={buildUrl(p as number)}
            className={`${btnBase} glass border border-white/[0.06] text-slate-400 hover:text-slate-100 hover:border-white/[0.14] active:scale-95`}>
            {p}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link href={buildUrl(currentPage + 1)}
          className={`${btnBase} glass border border-white/[0.06] text-slate-400 hover:text-slate-100 hover:border-white/[0.14] active:scale-95`}>
          <ChevronRight size={15} />
        </Link>
      ) : (
        <span className={`${btnBase} opacity-20 text-slate-600 cursor-not-allowed`}>
          <ChevronRight size={15} />
        </span>
      )}
    </div>
  )
}
