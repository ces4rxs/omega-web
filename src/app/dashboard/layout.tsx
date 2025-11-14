"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  Activity,
  Settings,
  LineChart,
  TrendingUp,
  BookOpen,
  History,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Newspaper,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DevTierSwitcher } from "@/components/dev-tier-switcher"

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  badge?: string
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: <Home size={18} /> },
  { name: "Backtest", href: "/dashboard/backtest", icon: <Activity size={18} /> },
  { name: "News", href: "/dashboard/news", icon: <Newspaper size={18} /> },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

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

      // Load sidebar collapsed state
      const sidebarCollapsed = localStorage.getItem('sidebarCollapsed')
      if (sidebarCollapsed === 'true') {
        setIsSidebarCollapsed(true)
      }

      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-lg">Cargando...</p>
        </div>
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

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed
    setIsSidebarCollapsed(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(newState))
    }
  }

  const isPro = user?.subscription?.planId === 'professional'

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <>
      <div>
        {/* Logo */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-bold tracking-widest">
                BACKTESTER <span className="text-blue-400">PRO</span>
              </h1>
            </div>
            {isPro && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-block mt-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg"
              >
                ⭐ PRO
              </motion.span>
            )}
          </motion.div>
        )}
        {collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex justify-center"
          >
            <Sparkles className="w-6 h-6 text-blue-400" />
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <motion.button
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(item.href)}
                title={collapsed ? item.name : undefined}
                className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} w-full ${collapsed ? 'px-2' : 'px-3'} py-2.5 rounded-lg transition-all group relative overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                    : "hover:bg-white/5 hover:translate-x-1"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className={`flex items-center ${collapsed ? '' : 'gap-3'} relative z-10`}>
                  <div className={isActive ? "text-blue-400" : "text-gray-400 group-hover:text-white transition"}>
                    {item.icon}
                  </div>
                  {!collapsed && (
                    <span className={`font-medium ${isActive ? "text-white" : "text-gray-300"}`}>
                      {item.name}
                    </span>
                  )}
                </div>
                {!collapsed && item.badge && !isPro && (
                  <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full font-semibold relative z-10">
                    {item.badge}
                  </span>
                )}
              </motion.button>
            )
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="space-y-2">
        <button
          onClick={() => router.push('/dashboard/settings')}
          title={collapsed ? "Settings" : undefined}
          className={`flex items-center ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'} w-full py-2.5 rounded-lg transition-all ${
            pathname === '/dashboard/settings'
              ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
              : "hover:bg-white/5 text-gray-300 hover:text-white"
          }`}
        >
          <Settings size={18} />
          {!collapsed && <span className="font-medium">Settings</span>}
        </button>

        <Button
          onClick={handleLogout}
          title={collapsed ? "Cerrar Sesión" : undefined}
          variant="outline"
          className={`w-full ${collapsed ? 'justify-center px-2' : 'justify-start'} hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all`}
        >
          <LogOut size={18} className={collapsed ? '' : 'mr-2'} />
          {!collapsed && 'Cerrar Sesión'}
        </Button>

        {/* User info */}
        {!collapsed && (
          <div className="pt-4 border-t border-white/10">
            <div className="px-3 py-2 rounded-lg bg-white/5">
              <p className="text-xs text-gray-500 mb-1">Usuario</p>
              <p className="text-sm text-white font-medium truncate">{user?.email}</p>
            </div>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="w-full py-2 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all mt-2"
          title={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex ${isSidebarCollapsed ? 'w-16' : 'w-72'} border-r border-white/10 bg-black/30 backdrop-blur-xl flex-col justify-between ${isSidebarCollapsed ? 'p-2' : 'p-6'} transition-all duration-300`}>
        <SidebarContent collapsed={isSidebarCollapsed} />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <h1 className="text-lg font-bold">
              BACKTESTER <span className="text-blue-400">PRO</span>
            </h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="w-80 h-full bg-black/95 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-16">
        {children}
      </main>

      {/* Dev Tier Switcher - Solo visible en development */}
      <DevTierSwitcher />
    </div>
  )
}
