"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Home,
  Activity,
  Brain,
  BarChart2,
  Settings,
  LineChart,
  TrendingUp,
  BookOpen,
  History,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  badge?: string
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: <Home size={18} /> },
  { name: "Backtest", href: "/dashboard/backtest", icon: <Activity size={18} /> },
  { name: "Optimizer", href: "/dashboard/optimizer", icon: <TrendingUp size={18} />, badge: "PRO" },
  { name: "Strategies", href: "/dashboard/strategies", icon: <BookOpen size={18} />, badge: "PRO" },
  { name: "Analysis", href: "/dashboard/analysis/monte-carlo", icon: <LineChart size={18} />, badge: "PRO" },
  { name: "History", href: "/dashboard/history", icon: <History size={18} /> },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      const token = localStorage.getItem('accessToken')

      if (!token) {
        router.push('/login')
        return
      }

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          console.error('Error parsing user:', e)
        }
      }
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-zinc-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      router.push('/login')
    }
  }

  const isPro = user?.subscription?.planId === 'professional'

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black/30 backdrop-blur-xl flex flex-col justify-between p-4">
        <div>
          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="text-xl font-bold tracking-widest">
              BACKTESTER <span className="text-blue-400">PRO</span>
            </h1>
            {isPro && (
              <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
                PRO
              </span>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-md transition ${
                    isActive
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {item.badge && !isPro && (
                    <span className="text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="space-y-2">
          <button
            onClick={() => router.push('/dashboard/settings')}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-md transition ${
              pathname === '/dashboard/settings'
                ? "bg-blue-600/20 text-blue-400"
                : "hover:bg-white/5"
            }`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>

          {/* User info */}
          <div className="pt-4 border-t border-white/10 text-xs text-gray-400">
            <p className="truncate">{user?.email}</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
