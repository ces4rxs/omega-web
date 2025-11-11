"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, BarChart2, Brain, Home, Settings } from "lucide-react"

import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "AI Master", href: "/dashboard", icon: Brain },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export const Sidebar = () => {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col border-r border-dark-border bg-dark-bg-secondary px-4 py-6 md:flex">
      <div className="mb-10 flex items-center gap-2 px-2">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 via-cyan-400 to-amber-400" />
        <div>
          <p className="text-xs uppercase tracking-widest text-dark-text-secondary">
            Omega Quantum
          </p>
          <p className="text-lg font-semibold text-dark-text">Command Center</p>
        </div>
      </div>
      <nav className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                "text-dark-text-secondary hover:bg-dark-border/20 hover:text-amber-300",
                isActive && "bg-amber-500/10 text-amber-300",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
