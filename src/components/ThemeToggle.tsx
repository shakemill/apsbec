"use client"
import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = (localStorage.getItem("theme") ?? "dark") as "dark" | "light"
    setTheme(saved)
    setMounted(true)
  }, [])

  function toggle() {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("theme", next)
    document.documentElement.setAttribute("data-theme", next)
  }

  return (
    <button
      onClick={toggle}
      suppressHydrationWarning
      aria-label={theme === "dark" ? "Mode clair" : "Mode sombre"}
      className="flex items-center justify-center w-9 h-9 rounded-xl glass hover:bg-white/[0.10]
                 text-slate-400 hover:text-slate-200 active:scale-90 transition-all shrink-0"
    >
      {/* Placeholder rendu côté serveur — icône remplacée après hydratation */}
      {!mounted
        ? <span className="w-[17px] h-[17px]" />
        : theme === "dark"
          ? <Sun  size={17} className="text-amber-400" />
          : <Moon size={17} className="text-blue-500"  />
      }
    </button>
  )
}
