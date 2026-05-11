"use client"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

export function Input({ label, error, hint, icon, className, id, type, ...props }: InputProps) {
  const isPassword = type === "password"
  const [show, setShow] = useState(false)

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={isPassword ? (show ? "text" : "password") : type}
          className={cn(
            "w-full glass rounded-xl text-sm text-slate-100 placeholder:text-slate-600",
            "focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.06]",
            icon          ? "pl-10" : "pl-4",
            isPassword    ? "pr-10" : "pr-4",
            "py-3",
            error && "border-rose-500/60 focus:border-rose-500",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hint  && !error && <span className="text-xs text-slate-600">{hint}</span>}
      {error &&           <span className="text-xs text-rose-400 flex items-center gap-1">⚠ {error}</span>}
    </div>
  )
}

// ── Select stylé ──────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  icon?: React.ReactNode
  error?: string
}

export function Select({ label, icon, error, className, id, children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            {icon}
          </div>
        )}
        <select
          id={id}
          className={cn(
            "w-full glass rounded-xl text-sm text-slate-100 appearance-none cursor-pointer",
            "focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.06]",
            icon ? "pl-10 pr-8 py-3" : "px-4 py-3",
            error && "border-rose-500/60",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <span className="text-xs text-rose-400">⚠ {error}</span>}
    </div>
  )
}
