"use client"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import type { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "success" | "warning"
  size?: "xs" | "sm" | "md" | "lg"
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = [
    "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    "active:scale-[0.96] select-none",
  ].join(" ")

  const variants = {
    // Bleu saphir – action principale
    primary: cn(
      "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white",
      "shadow-[0_4px_18px_rgba(59,130,246,0.45)] hover:shadow-[0_6px_24px_rgba(59,130,246,0.55)]",
      "hover:from-blue-400 hover:via-blue-500 hover:to-indigo-600",
      "focus-visible:ring-blue-500/70",
    ),
    // Verre dépoli – action secondaire
    secondary: cn(
      "glass text-slate-200 border border-white/[0.12]",
      "hover:bg-white/[0.10] hover:border-white/[0.22] hover:text-white",
      "focus-visible:ring-slate-400/50",
    ),
    // Contour bleu – action tertiaire
    outline: cn(
      "bg-transparent text-blue-400 border-2 border-blue-500/50",
      "hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300",
      "focus-visible:ring-blue-500/50",
    ),
    // Rouge – action destructrice
    danger: cn(
      "bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white",
      "shadow-[0_4px_18px_rgba(244,63,94,0.35)] hover:shadow-[0_6px_24px_rgba(244,63,94,0.50)]",
      "hover:from-rose-400 hover:via-rose-500 hover:to-red-600",
      "focus-visible:ring-rose-500/60",
    ),
    // Vert – confirmation / succès
    success: cn(
      "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white",
      "shadow-[0_4px_18px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_24px_rgba(16,185,129,0.50)]",
      "hover:from-emerald-400 hover:via-emerald-500 hover:to-teal-600",
      "focus-visible:ring-emerald-500/60",
    ),
    // Ambre – avertissement
    warning: cn(
      "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white",
      "shadow-[0_4px_18px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_24px_rgba(245,158,11,0.50)]",
      "hover:from-amber-300 hover:via-amber-400 hover:to-orange-500",
      "focus-visible:ring-amber-500/60",
    ),
    // Transparent – action discrète
    ghost: cn(
      "bg-transparent text-slate-400",
      "hover:bg-white/[0.07] hover:text-slate-200",
      "focus-visible:ring-slate-400/40",
    ),
  }

  const sizes = {
    xs: "px-2.5 py-1   text-xs  gap-1   rounded-lg",
    sm: "px-3   py-1.5 text-xs  gap-1.5 rounded-xl",
    md: "px-4   py-2.5 text-sm  gap-2   rounded-xl",
    lg: "px-5   py-3   text-sm  gap-2   w-full rounded-2xl",
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading
        ? <Loader2 className="animate-spin shrink-0" size={size === "lg" ? 17 : 14} />
        : icon && <span className="shrink-0">{icon}</span>
      }
      {children}
    </button>
  )
}
