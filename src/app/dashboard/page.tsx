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
  ArrowRight
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)
  const [isPro, setIsPro] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          setUserName(user.name || user.email?.split('@')[0])
          setIsPro(user?.subscription?.planId === 'professional')
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
      value: "127",
      change: "+23 este mes",
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
      action: () => router.push("/dashboard/backtest")
    },
    {
      title: "Optimizar",
      description: "Optimiza parámetros de tus estrategias",
      icon: <Target className="w-6 h-6" />,
      color: "from-purple-600 to-pink-600",
      action: () => router.push("/dashboard/optimizer"),
      pro: true
    },
    {
      title: "Análisis Avanzado",
      description: "Monte Carlo, Walk-Forward y más",
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-indigo-600 to-blue-600",
      action: () => router.push("/dashboard/analysis/monte-carlo"),
      pro: true
    }
  ]

  const recentBacktests = [
    { strategy: "SMA Crossover", symbol: "AAPL", return: "+15.2%", date: "Hace 2 horas", status: "success" },
    { strategy: "RSI Mean Revert", symbol: "TSLA", return: "-3.8%", date: "Hace 5 horas", status: "warning" },
    { strategy: "Trend Following", symbol: "BTC", return: "+28.5%", date: "Ayer", status: "success" },
    { strategy: "Breakout", symbol: "SPY", return: "+9.2%", date: "Hace 2 días", status: "success" }
  ]

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
          {isPro && (
            <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
              PRO
            </span>
          )}
        </div>
        <p className="text-gray-400 text-lg">
          Tu dashboard de backtesting está listo. Explora estrategias, analiza rendimiento y optimiza tu trading.
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
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                className="cursor-pointer hover:border-blue-500/50 transition-all group relative overflow-hidden"
                onClick={action.action}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${action.color} text-white`}>
                      {action.icon}
                    </div>
                    {action.pro && !isPro && (
                      <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                        PRO
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-white mb-1">{action.title}</h4>
                  <p className="text-sm text-gray-400">{action.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-blue-400 text-sm group-hover:gap-2 transition-all">
                    Comenzar
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

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
