import { cn } from "@/lib/utils"

interface CardProps {
  className?: string
  children: React.ReactNode
  glow?: boolean
}

export function Card({ className, children, glow }: CardProps) {
  return (
    <div className={cn(
      "glass rounded-2xl p-4",
      glow && "glow-sm",
      className
    )}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("mb-4 pb-3 border-b border-white/[0.07]", className)}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h2 className={cn("text-sm font-semibold text-slate-200 tracking-wide", className)}>
      {children}
    </h2>
  )
}

// Carte stat avec icône colorée
interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  color?: "blue" | "green" | "red" | "yellow" | "purple"
  sub?: string
  className?: string
}

const colorMap = {
  blue:   { bg: "bg-blue-500/10",   icon: "text-blue-400",   val: "text-blue-300"   },
  green:  { bg: "bg-emerald-500/10",icon: "text-emerald-400",val: "text-emerald-300" },
  red:    { bg: "bg-rose-500/10",   icon: "text-rose-400",   val: "text-rose-300"   },
  yellow: { bg: "bg-amber-500/10",  icon: "text-amber-400",  val: "text-amber-300"  },
  purple: { bg: "bg-violet-500/10", icon: "text-violet-400", val: "text-violet-300" },
}

export function StatCard({ label, value, icon, color = "blue", sub, className }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className={cn("glass rounded-2xl p-4 flex flex-col gap-3", className)}>
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", c.bg)}>
        <span className={cn("w-5 h-5", c.icon)}>{icon}</span>
      </div>
      <div>
        <div className={cn("text-2xl font-black tracking-tight", c.val)}>{value}</div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}
