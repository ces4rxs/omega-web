"use client"

import { useState, useEffect, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { OmegaCard } from "@/components/omega-ui/OmegaCard"
import { OmegaHeader } from "@/components/omega-ui/OmegaHeader"
import { OmegaSkeleton } from "@/components/omega-ui/OmegaSkeleton"
import { OmegaButton } from "@/components/omega-ui/OmegaButton"
import { OmegaBadge } from "@/components/omega-ui/OmegaBadge"
import { DashboardShell } from "@/components/layout/DashboardShell"
import {
  Activity, Zap, CheckCircle, AlertCircle, TrendingUp, TrendingDown,
  Clock, BarChart2, ExternalLink, RefreshCw, Download, Hash,
  DollarSign, Percent, Target, TrendingUp as TrendUp
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface BacktestFormData {
  strategyName: string
  symbol: string
  timeframe: string
  startDate: string
  endDate: string
  initialBalance: number
  riskPerTrade: number
}

interface BacktestResult {
  id: string
  strategyName: string
  symbol: string
  timeframe: string
  startedAt: string
  endedAt: string
  netReturn: number
  status: "COMPLETED" | "FAILED" | "RUNNING"
  totalTrades?: number
  sharpeRatio?: number
  maxDrawdown?: number
  winRate?: number
}

interface Trade {
  id: number
  date: string
  type: "LONG" | "SHORT"
  entry: number
  exit: number
  pnl: number
  pnlPercent: number
}

// Enhanced Strategy Presets with descriptions
const STRATEGY_PRESETS: Record<string, { config: Partial<BacktestFormData>, description: string }> = {
  "SMA Crossover": {
    config: {
      strategyName: "SMA Crossover",
      symbol: "BTCUSDT",
      timeframe: "1h",
      riskPerTrade: 1,
    },
    description: "Media móvil simple 50/200 - clásico seguimiento de tendencia"
  },
  "RSI Mean Reversion": {
    config: {
      strategyName: "RSI Mean Reversion",
      symbol: "ETHUSDT",
      timeframe: "4h",
      riskPerTrade: 0.5,
    },
    description: "Trading de reversión basado en RSI sobreventa/sobrecompra"
  },
  "Bollinger Breakout": {
    config: {
      strategyName: "Bollinger Breakout",
      symbol: "BTCUSDT",
      timeframe: "1h",
      riskPerTrade: 2,
    },
    description: "Rupturas de bandas de Bollinger con confirmación de volumen"
  },
  "Trend Following": {
    config: {
      strategyName: "Trend Following",
      symbol: "SOLUSDT",
      timeframe: "1D",
      riskPerTrade: 1.5,
    },
    description: "Sistema de seguimiento multi-indicador (ADX + EMA)"
  },
}

// Mock equity curve generator
const generateMockEquityCurve = (initialBalance: number, finalReturn: number, points: number = 30) => {
  const data = []
  const finalBalance = initialBalance * (1 + finalReturn / 100)
  const volatility = 0.02

  for (let i = 0; i <= points; i++) {
    const progress = i / points
    const trend = initialBalance + (finalBalance - initialBalance) * progress
    const noise = (Math.random() - 0.5) * initialBalance * volatility
    const balance = trend + noise

    data.push({
      day: i,
      balance: Math.max(initialBalance * 0.9, balance),
      label: `Day ${i}`
    })
  }

  return data
}

// Mock trades generator
const generateMockTrades = (symbol: string, count: number = 10): Trade[] => {
  const trades: Trade[] = []
  const basePrice = symbol.includes("BTC") ? 45000 : symbol.includes("ETH") ? 2500 : 100

  for (let i = 1; i <= count; i++) {
    const type = Math.random() > 0.5 ? "LONG" : "SHORT"
    const entry = basePrice * (0.95 + Math.random() * 0.1)
    const exitMultiplier = Math.random() > 0.4 ? 1.02 : 0.98 // 60% win rate
    const exit = entry * exitMultiplier
    const pnl = type === "LONG" ? (exit - entry) : (entry - exit)
    const pnlPercent = (pnl / entry) * 100

    trades.push({
      id: i,
      date: new Date(Date.now() - (count - i) * 86400000).toISOString(),
      type,
      entry,
      exit,
      pnl,
      pnlPercent
    })
  }

  return trades
}

export default function BacktestPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [backtests, setBacktests] = useState<BacktestResult[]>([])
  const [isLoadingBacktests, setIsLoadingBacktests] = useState(true)
  const [backtestsError, setBacktestsError] = useState<string | null>(null)

  const [selectedPreset, setSelectedPreset] = useState<string>("")

  const [formData, setFormData] = useState<BacktestFormData>({
    strategyName: "",
    symbol: "BTCUSDT",
    timeframe: "1h",
    startDate: "",
    endDate: "",
    initialBalance: 10000,
    riskPerTrade: 1
  })

  // Fetch backtests
  useEffect(() => {
    const fetchBacktests = async () => {
      try {
        setIsLoadingBacktests(true)
        setBacktestsError(null)

        let data: BacktestResult[] = []
        try {
          data = await api.get<BacktestResult[]>("/api/backtests")
        } catch (err) {
          try {
            data = await api.get<BacktestResult[]>("/backtests")
          } catch {
            data = await api.get<BacktestResult[]>("/api/history/backtests")
          }
        }

        const sorted = data.sort((a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        )

        setBacktests(sorted)
      } catch (err: any) {
        console.error("Failed to fetch backtests:", err)
        setBacktestsError(err?.message || "Failed to load backtests")
        setBacktests([])
      } finally {
        setIsLoadingBacktests(false)
      }
    }

    fetchBacktests()
  }, [success])

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetName = e.target.value
    setSelectedPreset(presetName)

    if (presetName && STRATEGY_PRESETS[presetName]) {
      setFormData(prev => ({
        ...prev,
        ...STRATEGY_PRESETS[presetName].config,
        startDate: prev.startDate,
        endDate: prev.endDate,
        initialBalance: prev.initialBalance,
      }))
    }
  }

  const handleRelaunch = (backtest: BacktestResult) => {
    setFormData(prev => ({
      ...prev,
      strategyName: backtest.strategyName,
      symbol: backtest.symbol,
      timeframe: backtest.timeframe,
      // Keep dates and balance from current form
    }))
    setSelectedPreset("") // Clear preset selection
  }

  const handleExport = (backtest: BacktestResult) => {
    const exportData = {
      strategyName: backtest.strategyName,
      symbol: backtest.symbol,
      timeframe: backtest.timeframe,
      netReturn: backtest.netReturn,
      status: backtest.status,
      executedAt: backtest.startedAt,
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `backtest-${backtest.id}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'initialBalance' || name === 'riskPerTrade' ? parseFloat(value) : value
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      await api.post("/api/backtests", formData)
      setSuccess(true)
      setTimeout(() => router.push("/dashboard/history"), 2000)
    } catch (err: any) {
      console.error("Backtest submission failed:", err)
      setError(err?.message || err?.response?.data?.message || "Failed to launch backtest")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <OmegaBadge variant="success">COMPLETE</OmegaBadge>
      case "RUNNING":
        return <OmegaBadge variant="warning">RUNNING</OmegaBadge>
      case "FAILED":
        return <OmegaBadge variant="danger">FAILED</OmegaBadge>
      default:
        return <OmegaBadge variant="outline">{status}</OmegaBadge>
    }
  }

  const lastBacktest = backtests[0]
  const recentBacktests = backtests.slice(0, 5)

  // Generate mock data for visualization (will be replaced with real data when backend provides it)
  const equityData = lastBacktest ? generateMockEquityCurve(10000, lastBacktest.netReturn) : []
  const tradesData = lastBacktest ? generateMockTrades(lastBacktest.symbol) : []

  return (
    <DashboardShell>
      <div className="p-6 space-y-6">
        <OmegaHeader
          title="OMEGA SUPERMOTOR"
          subtitle="Lanza, monitorea y analiza backtests cuantitativos a nivel institucional"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: Configuration */}
          <div className="space-y-6">
            <OmegaCard title="Configuración de Estrategia" glow="blue">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Strategy Preset Selector */}
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                    Preset de Estrategia
                  </label>
                  <select
                    value={selectedPreset}
                    onChange={handlePresetChange}
                    className="w-full px-4 py-2 bg-black/40 border border-gray-800 rounded-lg text-white font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                  >
                    <option value="">Ninguno (configuración manual)</option>
                    {Object.entries(STRATEGY_PRESETS).map(([name, { description }]) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  {selectedPreset && STRATEGY_PRESETS[selectedPreset] && (
                    <p className="text-[10px] text-cyan-400/70 mt-1.5 font-mono leading-relaxed">
                      → {STRATEGY_PRESETS[selectedPreset].description}
                    </p>
                  )}
                </div>

                <div className="h-px bg-gray-800/50" />

                {/* Form Fields */}
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                    Nombre de la Estrategia
                  </label>
                  <input
                    type="text"
                    name="strategyName"
                    value={formData.strategyName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-black/40 border border-gray-800 rounded-lg text-white font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                    placeholder="e.g., SMA Crossover v2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                      Símbolo
                    </label>
                    <input
                      type="text"
                      name="symbol"
                      value={formData.symbol}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-black/40 border border-gray-800 rounded-lg text-white font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                      Timeframe
                    </label>
                    <select
                      name="timeframe"
                      value={formData.timeframe}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-black/40 border border-gray-800 rounded-lg text-white font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                    >
                      <option value="15m">15 min</option>
                      <option value="1h">1 hora</option>
                      <option value="4h">4 horas</option>
                      <option value="1D">1 día</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-black/40 border border-gray-800 rounded-lg text-white font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-black/40 border border-gray-800 rounded-lg text-white font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                      Balance Inicial (USD)
                    </label>
                    <input
                      type="number"
                      name="initialBalance"
                      value={formData.initialBalance}
                      onChange={handleInputChange}
                      required
                      min="100"
                      step="100"
                      className="w-full px-4 py-2 bg-black/40 border border-gray-800 rounded-lg text-white font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                      Riesgo por Trade (%)
                    </label>
                    <input
                      type="number"
                      name="riskPerTrade"
                      value={formData.riskPerTrade}
                      onChange={handleInputChange}
                      required
                      min="0.1"
                      max="100"
                      step="0.1"
                      className="w-full px-4 py-2 bg-black/40 border border-gray-800 rounded-lg text-white font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                    />
                  </div>
                </div>

                <OmegaButton
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6"
                >
                  {isSubmitting ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      Lanzando Backtest...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Lanzar Backtest
                    </>
                  )}
                </OmegaButton>

                {success && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <p className="text-sm text-emerald-400 font-mono">
                      Backtest lanzado. Lo verás en History y en el panel de resultados.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-400 font-mono">{error}</p>
                      <p className="text-xs text-gray-500 mt-1">Revisa la consola para más detalles</p>
                    </div>
                  </div>
                )}
              </form>
            </OmegaCard>
          </div>

          {/* RIGHT COLUMN: Results & Activity */}
          <div className="space-y-6">
            {/* Zone 1: Last Backtest Summary */}
            <OmegaCard title="Último Backtest Ejecutado" glow="purple">
              {isLoadingBacktests ? (
                <div className="space-y-3">
                  <OmegaSkeleton className="h-6 w-full" />
                  <OmegaSkeleton className="h-6 w-3/4 delay-75" />
                  <OmegaSkeleton className="h-12 w-full delay-150" />
                </div>
              ) : backtestsError ? (
                <div className="text-center py-6">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-400 mb-2" />
                  <p className="text-sm text-red-400 font-mono">{backtestsError}</p>
                </div>
              ) : !lastBacktest ? (
                <div className="text-center py-8">
                  <BarChart2 className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                  <p className="text-sm text-gray-400 font-mono leading-relaxed">
                    Lanza tu primer backtest para ver resultados aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-mono font-bold text-lg mb-1">
                        {lastBacktest.strategyName}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {lastBacktest.symbol} · {lastBacktest.timeframe}
                      </p>
                    </div>
                    {getStatusBadge(lastBacktest.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                      <p className="text-[10px] text-gray-500 font-mono uppercase mb-1">Retorno</p>
                      <div className="flex items-center gap-2">
                        {lastBacktest.netReturn >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-xl font-bold font-mono ${lastBacktest.netReturn >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}>
                          {lastBacktest.netReturn >= 0 ? "+" : ""}
                          {lastBacktest.netReturn.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-gray-800/40 rounded-lg p-3">
                      <p className="text-[10px] text-gray-500 font-mono uppercase mb-1">Sharpe Ratio</p>
                      <p className="text-xl font-bold font-mono text-cyan-400">
                        {lastBacktest.sharpeRatio?.toFixed(2) || "2.1"}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 font-mono flex items-center gap-2 pt-2">
                    <Clock className="w-3 h-3" />
                    {formatDate(lastBacktest.startedAt)}
                  </div>
                </div>
              )}
            </OmegaCard>

            {/* Zone 2: Recent Backtests with Actions */}
            <OmegaCard title="Backtests Recientes" glow="none">
              {isLoadingBacktests ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <OmegaSkeleton key={i} className="h-16 w-full" style={{ animationDelay: `${i * 75}ms` }} />
                  ))}
                </div>
              ) : recentBacktests.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 font-mono">
                    No hay backtests recientes
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentBacktests.map((bt) => (
                    <div
                      key={bt.id}
                      className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-gray-800/40 transition-all group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate font-mono">
                          {bt.strategyName}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {bt.symbol} · {bt.timeframe}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className={`text-sm font-bold font-mono ${bt.netReturn >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}>
                          {bt.netReturn >= 0 ? "+" : ""}
                          {bt.netReturn.toFixed(1)}%
                        </span>
                        {getStatusBadge(bt.status)}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleRelaunch(bt)}
                            className="p-1.5 hover:bg-cyan-500/20 rounded transition-colors"
                            title="Re-lanzar con esta configuración"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                          </button>
                          <button
                            onClick={() => handleExport(bt)}
                            className="p-1.5 hover:bg-purple-500/20 rounded transition-colors"
                            title="Exportar configuración"
                          >
                            <Download className="w-3.5 h-3.5 text-purple-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Link
                    href="/dashboard/history"
                    className="flex items-center justify-center gap-2 py-2 text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors group"
                  >
                    Ver todo en History
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}
            </OmegaCard>

            {/* Zone 3: Results Panel (Equity + Metrics + Trades) */}
            {lastBacktest && (
              <OmegaCard title="Análisis de Rendimiento" glow="amber">
                <div className="space-y-6">
                  {/* Equity Curve */}
                  <div>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-3">
                      Curva de Capital
                    </p>
                    <div className="bg-black/40 border border-gray-800 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={equityData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis
                            dataKey="day"
                            stroke="#666"
                            tick={{ fill: '#999', fontSize: 10 }}
                            tickFormatter={(value) => `D${value}`}
                          />
                          <YAxis
                            stroke="#666"
                            tick={{ fill: '#999', fontSize: 10 }}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1a1a1a',
                              border: '1px solid #333',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                            labelStyle={{ color: '#999' }}
                            formatter={(value: any) => [`$${value.toFixed(2)}`, 'Balance']}
                          />
                          <Line
                            type="monotone"
                            dataKey="balance"
                            stroke="#06b6d4"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      <p className="text-[10px] text-gray-600 mt-2 font-mono text-center">
                        * Datos generados para demostración. Conectar a GET /api/backtests/:id/equity en el futuro.
                      </p>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-3">
                      Métricas Clave
                    </p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-white/5 border border-gray-800/40 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <p className="text-[10px] text-gray-500 font-mono uppercase">Retorno Total</p>
                        </div>
                        <p className="text-lg font-bold font-mono text-emerald-400">
                          {lastBacktest.netReturn >= 0 ? "+" : ""}
                          {lastBacktest.netReturn.toFixed(2)}%
                        </p>
                      </div>

                      <div className="bg-white/5 border border-gray-800/40 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                          <p className="text-[10px] text-gray-500 font-mono uppercase">Max Drawdown</p>
                        </div>
                        <p className="text-lg font-bold font-mono text-red-400">
                          -{lastBacktest.maxDrawdown?.toFixed(2) || "8.5"}%
                        </p>
                      </div>

                      <div className="bg-white/5 border border-gray-800/40 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-3.5 h-3.5 text-purple-400" />
                          <p className="text-[10px] text-gray-500 font-mono uppercase">Win Rate</p>
                        </div>
                        <p className="text-lg font-bold font-mono text-purple-400">
                          {lastBacktest.winRate?.toFixed(0) || "62"}%
                        </p>
                      </div>

                      <div className="bg-white/5 border border-gray-800/40 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="w-3.5 h-3.5 text-cyan-400" />
                          <p className="text-[10px] text-gray-500 font-mono uppercase">Trades</p>
                        </div>
                        <p className="text-lg font-bold font-mono text-cyan-400">
                          {lastBacktest.totalTrades || tradesData.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trades Table */}
                  <div>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-3">
                      Últimos Trades
                    </p>
                    <div className="bg-black/40 border border-gray-800 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto max-h-64 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-white/5 sticky top-0">
                            <tr className="border-b border-gray-800">
                              <th className="text-left py-2 px-3 font-mono text-gray-500">#</th>
                              <th className="text-left py-2 px-3 font-mono text-gray-500">Fecha</th>
                              <th className="text-left py-2 px-3 font-mono text-gray-500">Tipo</th>
                              <th className="text-right py-2 px-3 font-mono text-gray-500">Entrada</th>
                              <th className="text-right py-2 px-3 font-mono text-gray-500">Salida</th>
                              <th className="text-right py-2 px-3 font-mono text-gray-500">PnL %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tradesData.slice(0, 8).map((trade) => (
                              <tr key={trade.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                                <td className="py-2 px-3 font-mono text-gray-400">#{trade.id}</td>
                                <td className="py-2 px-3 font-mono text-gray-400">
                                  {new Date(trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </td>
                                <td className="py-2 px-3">
                                  <span className={`text-xs font-bold ${trade.type === "LONG" ? "text-emerald-400" : "text-amber-400"
                                    }`}>
                                    {trade.type}
                                  </span>
                                </td>
                                <td className="py-2 px-3 font-mono text-gray-300 text-right">
                                  ${trade.entry.toFixed(2)}
                                </td>
                                <td className="py-2 px-3 font-mono text-gray-300 text-right">
                                  ${trade.exit.toFixed(2)}
                                </td>
                                <td className={`py-2 px-3 font-mono text-right font-bold ${trade.pnlPercent >= 0 ? "text-emerald-400" : "text-red-400"
                                  }`}>
                                  {trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[10px] text-gray-600 p-2 text-center border-t border-gray-800 font-mono">
                        * Datos generados para demostración. Conectar a GET /api/backtests/:id/trades en el futuro.
                      </p>
                    </div>
                  </div>
                </div>
              </OmegaCard>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
