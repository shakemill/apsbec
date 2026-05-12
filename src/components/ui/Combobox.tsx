"use client"
import { useState, useRef, useEffect, useId } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Search, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ComboboxOption {
  value: string
  label: string
  /** texte secondaire affiché à droite (ex: indicatif, téléphone) */
  hint?: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  icon?: React.ReactNode
  /** Affiche un champ de recherche dans le dropdown */
  searchable?: boolean
  id?: string
  className?: string
  disabled?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Choisir…",
  label,
  icon,
  searchable = false,
  id,
  className,
  disabled,
}: ComboboxProps) {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState("")
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)
  const containerRef          = useRef<HTMLDivElement>(null)
  const searchRef             = useRef<HTMLInputElement>(null)
  const uid                   = useId()
  const btnId                 = id ?? uid

  useEffect(() => { setMounted(true) }, [])

  const selected = options.find((o) => o.value === value)
  const filtered  = query.trim()
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          (o.hint ?? "").toLowerCase().includes(query.toLowerCase()),
      )
    : options

  /* ── Fermer au clic extérieur ─────────────────────────────── */
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [])

  /* ── Focus search à l'ouverture ────────────────────────────── */
  useEffect(() => {
    if (open && searchable) setTimeout(() => searchRef.current?.focus(), 60)
  }, [open, searchable])

  function toggle() {
    if (disabled) return
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropPos({
        top:   rect.bottom + window.scrollY + 6,
        left:  rect.left   + window.scrollX,
        width: rect.width,
      })
    }
    setOpen((v) => !v)
  }

  function select(val: string) {
    onChange(val)
    setOpen(false)
    setQuery("")
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setOpen(false); setQuery("") }
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={btnId}
          className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>

        {/* ── Trigger ───────────────────────────────────────────── */}
        <button
          id={btnId}
          type="button"
          onClick={toggle}
          disabled={disabled}
          className={cn(
            "w-full glass rounded-xl text-sm text-left flex items-center gap-2 transition-all",
            "border border-white/[0.08] focus:outline-none",
            icon ? "pl-10 pr-4 py-3" : "px-4 py-3",
            open  ? "border-blue-500/50 bg-white/[0.07]"
                  : "hover:border-white/[0.15] hover:bg-white/[0.04]",
            disabled && "opacity-40 cursor-not-allowed",
          )}
        >
          {icon && (
            <span className="absolute left-3.5 text-slate-500 pointer-events-none">
              {icon}
            </span>
          )}

          <span className={cn("flex-1 truncate", selected ? "text-slate-100" : "text-slate-500")}>
            {selected ? selected.label : placeholder}
          </span>

          {selected?.hint && (
            <span className="text-xs text-slate-500 font-mono shrink-0">{selected.hint}</span>
          )}

          <ChevronDown
            size={15}
            className={cn(
              "text-slate-500 shrink-0 transition-transform duration-200",
              open && "rotate-180 text-blue-400",
            )}
          />
        </button>

        {/* ── Dropdown via portal (évite tout problème de z-index/overflow) ── */}
        {open && mounted && createPortal(
          <div
            className={cn(
              "fixed z-[9999]",
              "glass-strong rounded-2xl overflow-hidden",
              "shadow-[0_16px_48px_rgba(0,0,0,0.50)] border border-white/[0.10]",
              "animate-fade-up",
            )}
            style={{
              top:   dropPos.top,
              left:  dropPos.left,
              width: dropPos.width,
              animationDuration: "0.14s",
            }}
          >
            {/* Recherche */}
            {searchable && (
              <div className="p-2 border-b border-white/[0.07]">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher…"
                    className={cn(
                      "w-full bg-white/[0.06] rounded-xl pl-8 pr-3 py-2",
                      "text-sm text-slate-100 placeholder:text-slate-500",
                      "focus:outline-none focus:bg-white/[0.10] transition-colors",
                    )}
                  />
                </div>
              </div>
            )}

            {/* Liste */}
            <div className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-4 py-4 text-sm text-slate-500 text-center">
                  Aucun résultat
                </div>
              ) : (
                filtered.map((opt) => {
                  const active = opt.value === value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => select(opt.value)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors",
                        active
                          ? "bg-blue-500/15 text-blue-300"
                          : "text-slate-200 hover:bg-white/[0.07] hover:text-white",
                      )}
                    >
                      <span className="flex-1 truncate">{opt.label}</span>
                      {opt.hint && (
                        <span className="text-xs text-slate-500 font-mono shrink-0">
                          {opt.hint}
                        </span>
                      )}
                      {active && <Check size={14} className="text-blue-400 shrink-0" />}
                    </button>
                  )
                })
              )}
            </div>
          </div>,
          document.body,
        )}
      </div>
    </div>
  )
}
