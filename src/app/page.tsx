import Link from "next/link"
import { User, UserPlus, ShieldCheck } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

const nav = [
  {
    href: "/membre",
    icon: User,
    label: "Espace Membre",
    desc: "Consulter mon compte & historique",
    color: "from-blue-500/20 to-indigo-500/10",
    iconColor: "text-blue-400",
    border: "hover:border-blue-500/30",
  },
  {
    href: "/inscription",
    icon: UserPlus,
    label: "S'inscrire",
    desc: "Nouveau membre — créer mon compte",
    color: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-400",
    border: "hover:border-emerald-500/30",
  },
  {
    href: "/admin",
    icon: ShieldCheck,
    label: "Administration",
    desc: "Gestion des membres & cotisations",
    color: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-400",
    border: "hover:border-violet-500/30",
  },
]

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-16">
      {/* Toggle thème */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center mb-12 animate-fade-up">
        <div className="relative mb-5">
          <div className="absolute inset-0 rounded-3xl bg-blue-500/30 blur-2xl scale-75" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-900/50">
            <span className="text-2xl font-black text-white tracking-tight">AP</span>
          </div>
        </div>
        <h1 className="text-4xl font-black tracking-tight gradient-text mb-1">APSBEC</h1>
        <p className="text-sm text-slate-500 text-center max-w-xs leading-relaxed">
          Gestion des membres & cotisations du club
        </p>
      </div>

      {/* Navigation */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {nav.map(({ href, icon: Icon, label, desc, color, iconColor, border }, i) => (
          <Link
            key={href}
            href={href}
            className={`animate-fade-up delay-${i + 1} group relative flex items-center gap-4 glass rounded-2xl p-4 border border-white/[0.08] ${border} hover:bg-white/[0.06] active:scale-[0.98]`}
          >
            {/* Gradient bg */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <div className={`relative w-11 h-11 rounded-xl bg-white/[0.06] group-hover:bg-white/[0.10] flex items-center justify-center shrink-0`}>
              <Icon size={20} className={iconColor} />
            </div>

            <div className="relative flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-100">{label}</div>
              <div className="text-xs text-slate-500 mt-0.5 truncate">{desc}</div>
            </div>

            <svg className="relative w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      <p className="text-slate-700 text-xs mt-12 tracking-widest uppercase">apsbec.org</p>
    </main>
  )
}
