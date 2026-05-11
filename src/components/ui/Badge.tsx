import { cn } from "@/lib/utils"

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "purple"

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
}

const variants: Record<BadgeVariant, string> = {
  success: "bg-emerald-500/12 text-emerald-300 border-emerald-500/20 ring-1 ring-emerald-500/10",
  warning: "bg-amber-500/12  text-amber-300  border-amber-500/20  ring-1 ring-amber-500/10",
  danger:  "bg-rose-500/12   text-rose-300   border-rose-500/20   ring-1 ring-rose-500/10",
  info:    "bg-blue-500/12   text-blue-300   border-blue-500/20   ring-1 ring-blue-500/10",
  neutral: "bg-white/[0.06]  text-slate-400  border-white/[0.08]  ring-1 ring-white/[0.05]",
  purple:  "bg-violet-500/12 text-violet-300 border-violet-500/20 ring-1 ring-violet-500/10",
}

const dots: Record<BadgeVariant, string> = {
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger:  "bg-rose-400",
  info:    "bg-blue-400",
  neutral: "bg-slate-500",
  purple:  "bg-violet-400",
}

export function Badge({ variant = "neutral", children, className, dot }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
      variants[variant],
      className
    )}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dots[variant])} />}
      {children}
    </span>
  )
}
