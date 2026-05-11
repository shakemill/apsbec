"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Combobox } from "@/components/ui/Combobox"

const SORT_OPTIONS = [
  { value: "recent", label: "Récents d'abord" },
  { value: "oldest", label: "Anciens d'abord" },
  { value: "name",   label: "Nom (A–Z)"        },
  { value: "age",    label: "Âge (décroissant)" },
]

interface MembresFiltersProps {
  filtre?: string
  q?: string
}

export function MembresFilters({ filtre, q }: MembresFiltersProps) {
  const router = useRouter()
  const [search, setSearch] = useState(q || "")
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "name" | "age">("recent")
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function buildParams(overrides: { filtre?: string; q?: string; sort?: string } = {}) {
    const params = new URLSearchParams()
    const f = "filtre" in overrides ? overrides.filtre : filtre
    const s = "q"      in overrides ? overrides.q      : search
    const o = "sort"   in overrides ? overrides.sort   : sortBy !== "recent" ? sortBy : undefined
    if (f) params.set("filtre", f)
    if (s) params.set("q", s)
    if (o && o !== "recent") params.set("sort", o)
    return params.toString()
  }

  function updateFilters(newFiltre?: string, newQ?: string) {
    const params = new URLSearchParams()
    if (newFiltre) params.set("filtre", newFiltre)
    if (newQ)      params.set("q", newQ)
    if (sortBy !== "recent") params.set("sort", sortBy)
    router.push(`/admin/membres?${params.toString()}`)
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setSearch(val)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      router.push(`/admin/membres?${buildParams({ q: val })}`)
    }, 300)
  }

  function handleClearSearch() {
    setSearch("")
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    router.push(`/admin/membres?${buildParams({ q: "" })}`)
  }

  useEffect(() => {
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current) }
  }, [])

  const filtres = [
    { val: "",           label: "Tous"       },
    { val: "actif",      label: "Actifs"     },
    { val: "en_attente", label: "En attente" },
    { val: "suspendu",   label: "Suspendus"  },
  ]

  return (
    <div className="flex flex-col gap-3 mb-4">

      {/* Recherche */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Rechercher : nom, prénom, téléphone…"
          value={search}
          onChange={handleSearch}
          className="glass w-full rounded-2xl pl-9 pr-9 py-2.5 text-sm text-slate-200
                     placeholder:text-slate-500 border border-white/[0.06]
                     focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30
                     transition-all"
        />
        {search && (
          <button onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filtres statut */}
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {filtres.map((f) => {
          const actif = filtre === f.val || (!filtre && !f.val)
          return (
            <button
              key={f.val}
              onClick={() => updateFilters(f.val || undefined, search || undefined)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                actif
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-900/30"
                  : "glass border border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/[0.12]"
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Tri */}
      <Combobox
        options={SORT_OPTIONS}
        value={sortBy}
        onChange={(val) => {
          const v = val as typeof sortBy
          setSortBy(v)
          router.push(`/admin/membres?${buildParams({ sort: v })}`)
        }}
      />
    </div>
  )
}
