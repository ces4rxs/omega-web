"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  BarChart3,
  Target,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Crown,
  Brain,
  Shield,
  MessageSquare,
  Repeat,
  Lock
} from "lucide-react"
import { useTier } from "@/hooks/use-tier"

export default function DashboardPage() {
  const router = useRouter()
  const { currentTier, isEnterprise, isProfessional, isFree, features } = useTier()
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          setUserName(user.name || user.email?.split('@')[0])
        } catch (e) {
          console.error('Error parsing user:', e)
        }
      }
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const stats = [
    {
      title: "Rendimiento Total",
      value: "+24.8%",
      change: "+12.3%",
      trend: "up",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-green-400",
      bgColor: "from-green-500/10 to-emerald-500/10",
      borderColor: "border-green-500/20"
    },
    {
      title: "Sharpe Ratio",
      value: "2.43",
      change: "+0.18",
      trend: "up",
      icon: <Target className="w-5 h-5" />,
      color: "text-blue-400",
      bgColor: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      title: "Win Rate",
      value: "68.4%",
      change: "+5.2%",
      trend: "up",
      icon: <Activity className="w-5 h-5" />,
      color: "text-purple-400",
      bgColor: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      title: "Total Backtests",
      value: features.backtestsPerMonth === 'unlimited' ? '∞' : '5',
      change: features.backtestsPerMonth === 'unlimited' ? 'Ilimitados' : `${features.backtestsPerMonth} este mes`,
      trend: "neutral",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-cyan-400",
      bgColor: "from-cyan-500/10 to-teal-500/10",
      borderColor: "border-cyan-500/20"
    }
  ]

  const quickActions = [
    {
      title: "Nuevo Backtest",
      description: "Ejecuta una nueva prueba de estrategia",
      icon: <Zap className="w-6 h-6" />,
      color: "from-blue-600 to-cyan-600",
      action: () => router.push("/dashboard/backtest"),
      tierRequired: null
    },
    {
      title: "AI Insights",
      description: "Análisis inteligente con Hybrid + Neural AI",
      icon: <Brain className="w-6 h-6" />,
      color: "from-purple-600 to-pink-600",
      action: () => router.push("/dashboard/backtest"),
      tierRequired: 'professional',
      tierBadge: 'PRO'
    },
    {
      title: "Quantum Risk",
      description: "Análisis de riesgo cuántico avanzado",
      icon: <Shield className="w-6 h-6" />,
      color: "from-orange-600 to-red-600",
      action: () => router.push("/dashboard/backtest"),
      tierRequired: 'professional',
      tierBadge: 'PRO'
    },
    {
      title: "AI Copilot",
      description: "Chat inteligente para optimizar estrategias",
      icon: <MessageSquare className="w-6 h-6" />,
      color: "from-indigo-600 to-purple-600",
      action: () => router.push("/dashboard/ai-copilot"),
      tierRequired: 'enterprise',
      tierBadge: 'ENTERPRISE'
    },
    {
      title: "Auto-Loop",
      description: "Ejecuta hasta 100 backtests automáticamente",
      icon: <Repeat className="w-6 h-6" />,
      color: "from-pink-600 to-rose-600",
      action: () => router.push("/dashboard/auto-loop"),
      tierRequired: 'enterprise',
      tierBadge: 'ENTERPRISE'
    },
    {
      title: "Watchlist",
      description: `Monitorea hasta ${features.watchlistSymbols} símbolos`,
      icon: <Target className="w-6 h-6" />,
      color: "from-teal-600 to-green-600",
      action: () => router.push("/dashboard/watchlist"),
      tierRequired: null
    }
  ]

  const recentBacktests = [
    { strategy: "SMA Crossover", symbol: "AAPL", return: "+15.2%", date: "Hace 2 horas", status: "success" },
    { strategy: "RSI Mean Revert", symbol: "TSLA", return: "-3.8%", date: "Hace 5 horas", status: "warning" },
    { strategy: "Trend Following", symbol: "BTC", return: "+28.5%", date: "Ayer", status: "success" },
    { strategy: "Breakout", symbol: "SPY", return: "+9.2%", date: "Hace 2 días", status: "success" }
  ]

  const getTierBadge = (tier: string) => {
    if (tier === 'enterprise') {
      return (
        <span className="text-xs px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center gap-1">
          <Crown className="w-3 h-3" />
          ENTERPRISE
        </span>
      )
    }
    return (
      <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full">
        PRO
      </span>
    )
  }

  const canAccessAction = (tierRequired: string | null) => {
    if (!tierRequired) return true
    if (tierRequired === 'professional') return isProfessional || isEnterprise
    if (tierRequired === 'enterprise') return isEnterprise
    return true
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            Bienvenido{userName ? `, ${userName}` : ""} 👋
          </h2>
          {isProfessional && (
            <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full">
              PROFESSIONAL
            </span>
          )}
          {isEnterprise && (
            <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center gap-1">
              <Crown className="w-3 h-3" />
              ENTERPRISE
            </span>
          )}
          {isFree && (
            <Button
              size="sm"
              onClick={() => router.push('/pricing')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Upgrade
            </Button>
          )}
        </div>
        <p className="text-gray-400 text-lg">
          {isEnterprise
            ? 'Tienes acceso completo a todas las características de IA y análisis avanzado.'
            : isProfessional
            ? 'Disfruta de backtesting ilimitado y análisis de IA profesional.'
            : 'Tu dashboard de backtesting está listo. Actualiza para desbloquear características de IA.'}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className={`border ${stat.borderColor} bg-gradient-to-br ${stat.bgColor} hover:scale-105 transition-transform cursor-pointer`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  {stat.trend === "up" && (
                    <span className="text-green-400 text-sm flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Acciones Rápidas
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const hasAccess = canAccessAction(action.tierRequired)
            const isLocked = action.tierRequired && !hasAccess

            return (
              <motion.div
                key={index}
                whileHover={{ scale: isLocked ? 1 : 1.05 }}
                whileTap={{ scale: isLocked ? 1 : 0.95 }}
              >
                <Card
                  className={`cursor-pointer transition-all group relative overflow-hidden ${
                    isLocked
                      ? 'opacity-75 hover:border-yellow-500/50'
                      : 'hover:border-blue-500/50'
                  }`}
                  onClick={() => {
                    if (isLocked) {
                      router.push('/pricing')
                    } else {
                      action.action()
                    }
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${action.color} text-white relative`}>
                        {action.icon}
                        {isLocked && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Lock className="w-3 h-3 text-black" />
                          </div>
                        )}
                      </div>
                      {action.tierBadge && (
                        getTierBadge(action.tierRequired || '')
                      )}
                    </div>
                    <h4 className="font-semibold text-white mb-1">{action.title}</h4>
                    <p className="text-sm text-gray-400">{action.description}</p>
                    <div className={`mt-4 flex items-center gap-1 text-sm group-hover:gap-2 transition-all ${
                      isLocked ? 'text-yellow-400' : 'text-blue-400'
                    }`}>
                      {isLocked ? (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Desbloquear
                        </>
                      ) : (
                        <>
                          Comenzar
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* AI Features Banner - Only for FREE users */}
      {isFree && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-pink-900/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10" />
            <CardContent className="p-8 relative">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        Desbloquea el Poder de la IA
                      </h3>
                      <p className="text-purple-300">
                        Accede a 15 módulos de IA para optimizar tus estrategias
                      </p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-start gap-2">
                      <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-white">AI Insights</p>
                        <p className="text-xs text-gray-400">Análisis inteligente con calificación A+ a F</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-white">Quantum Risk</p>
                        <p className="text-xs text-gray-400">Índice de riesgo 0-100 en tiempo real</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-white">AI Copilot</p>
                        <p className="text-xs text-gray-400">Chat inteligente 24/7</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/pricing')}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 ml-6"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Ver Planes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Backtests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Backtests Recientes
                </CardTitle>
                <CardDescription>Tus últimas pruebas de estrategias</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/history")}
              >
                Ver todo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBacktests.map((backtest, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${backtest.status === 'success' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                      <CheckCircle2 className={`w-4 h-4 ${backtest.status === 'success' ? 'text-green-400' : 'text-yellow-400'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{backtest.strategy}</p>
                      <p className="text-sm text-gray-400">{backtest.symbol} • {backtest.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${backtest.return.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {backtest.return}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
