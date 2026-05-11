import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"

interface AlertProps {
  type: "success" | "error" | "warning" | "info"
  message: string
  className?: string
}

const config = {
  success: { icon: CheckCircle2, bg: "bg-emerald-500/8 border-emerald-500/20", text: "text-emerald-300", iconColor: "text-emerald-400" },
  error:   { icon: XCircle,       bg: "bg-rose-500/8   border-rose-500/20",    text: "text-rose-300",   iconColor: "text-rose-400"    },
  warning: { icon: AlertTriangle, bg: "bg-amber-500/8  border-amber-500/20",   text: "text-amber-300",  iconColor: "text-amber-400"   },
  info:    { icon: Info,           bg: "bg-blue-500/8   border-blue-500/20",    text: "text-blue-300",   iconColor: "text-blue-400"    },
}

export function Alert({ type, message, className }: AlertProps) {
  const { icon: Icon, bg, text, iconColor } = config[type]
  return (
    <div className={cn("flex items-start gap-3 border rounded-xl px-4 py-3 text-sm", bg, className)}>
      <Icon size={16} className={cn("shrink-0 mt-0.5", iconColor)} />
      <span className={text}>{message}</span>
    </div>
  )
}
