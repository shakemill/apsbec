import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ThemeToggle"

interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, backHref, action, className }: PageHeaderProps) {
  return (
    <header className={cn("flex items-center gap-2 mb-6", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="flex items-center justify-center w-9 h-9 rounded-xl glass hover:bg-white/[0.10] text-slate-400 hover:text-slate-100 shrink-0"
        >
          <ChevronLeft size={20} />
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-slate-100 truncate leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
      <ThemeToggle />
    </header>
  )
}
