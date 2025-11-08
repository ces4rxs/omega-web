"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Play,
  Pause,
  StopCircle,
  Lock,
  Crown,
  Zap,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from "lucide-react"
import { useTier } from "@/hooks/use-tier"
import { useRouter } from "next/navigation"

interface LoopConfig {
  strategy: string
  symbols: string[]
  timeframes: string[]
  maxBacktests: number
  stopOnError: boolean
}

interface LoopResult {
  backtestId: string
  symbol: string
  timeframe: string
  status: 'completed' | 'failed' | 'running'
  metrics?: {
    sharpeRatio: number
    totalReturn: number
    maxDrawdown: number
  }
  error?: string
  duration: number
}

interface LoopSession {
  id: string
  status: 'running' | 'paused' | 'completed' | 'stopped'
  progress: number
  totalBacktests: number
  completedBacktests: number
  results: LoopResult[]
  startedAt: Date
}

export default function AutoLoopPage() {
  const { canUseAutoLoop, isEnterprise } = useTier()
  const router = useRouter()

  const [config, setConfig] = useState<LoopConfig>({
    strategy: 'SMA_Crossover',
    symbols: ['AAPL', 'TSLA', 'GOOGL'],
    timeframes: ['1h', '4h', '1d'],
    maxBacktests: 20,
    stopOnError: false,
  })

  const [session, setSession] = useState<LoopSession | null>(null)
  const [symbolInput, setSymbolInput] = useState('')

  const startLoop = async () => {
    const totalBacktests = config.symbols.length * config.timeframes.length

    if (totalBacktests > config.maxBacktests) {
      alert(`El número total de backtests (${totalBacktests}) excede el límite de ${config.maxBacktests}`)
      return
    }

    const newSession: LoopSession = {
      id: Date.now().toString(),
      status: 'running',
      progress: 0,
      totalBacktests,
      completedBacktests: 0,
      results: [],
      startedAt: new Date(),
    }

    setSession(newSession)

    // Simulate auto-loop execution
    for (let i = 0; i < totalBacktests; i++) {
      const symbol = config.symbols[Math.floor(i / config.timeframes.length)]
      const timeframe = config.timeframes[i % config.timeframes.length]

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const result: LoopResult = {
        backtestId: `bt_${Date.now()}_${i}`,
        symbol,
        timeframe,
        status: Math.random() > 0.1 ? 'completed' : 'failed',
        metrics: Math.random() > 0.1 ? {
          sharpeRatio: Math.random() * 3,
          totalReturn: Math.random() * 100 - 20,
          maxDrawdown: Math.random() * -30,
        } : undefined,
        error: Math.random() > 0.1 ? undefined : 'Timeout error',
        duration: Math.random() * 5000 + 1000,
      }

      setSession((prev) => {
        if (!prev) return null
        return {
          ...prev,
          progress: ((i + 1) / totalBacktests) * 100,
          completedBacktests: i + 1,
          results: [...prev.results, result],
          status: i + 1 === totalBacktests ? 'completed' : prev.status,
        }
      })

      if (result.status === 'failed' && config.stopOnError) {
        setSession((prev) => prev ? { ...prev, status: 'stopped' } : null)
        break
      }
    }
  }

  const pauseLoop = () => {
    setSession((prev) => prev ? { ...prev, status: 'paused' } : null)
  }

  const resumeLoop = () => {
    setSession((prev) => prev ? { ...prev, status: 'running' } : null)
  }

  const stopLoop = () => {
    setSession((prev) => prev ? { ...prev, status: 'stopped' } : null)
  }

  const addSymbol = () => {
    if (!symbolInput.trim()) return
    const symbol = symbolInput.trim().toUpperCase()
    if (!config.symbols.includes(symbol)) {
      setConfig((prev) => ({
        ...prev,
        symbols: [...prev.symbols, symbol],
      }))
    }
    setSymbolInput('')
  }

  const removeSymbol = (symbol: string) => {
    setConfig((prev) => ({
      ...prev,
      symbols: prev.symbols.filter((s) => s !== symbol),
    }))
  }

  if (!canUseAutoLoop) {
    return (
      <div className="p-8">
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-purple-600/20 flex items-center justify-center mb-6 relative">
                <Lock className="w-10 h-10 text-purple-400" />
                <Crown className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Auto-Trading Loop Bloqueado
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Ejecuta hasta 100 backtests automáticamente sin intervención.
                Prueba múltiples símbolos y timeframes en minutos.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8 w-full">
                <div className="bg-gray-800/30 rounded-lg p-6 text-left">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Automatización Total
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Configura una vez y deja que el sistema ejecute todos los backtests.
                  </p>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-6 text-left">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Resultados Comparativos
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Ve qué símbolos y timeframes funcionan mejor para tu estrategia.
                  </p>
                </div>
              </div>

              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mb-8 w-full">
                <p className="text-purple-300 mb-2">
                  ✨ Exclusivo de <span className="font-bold">ENTERPRISE</span>
                </p>
                <p className="text-sm text-gray-400">
                  Hasta 100 backtests desatendidos vs 20 en otros planes
                </p>
              </div>

              <Button
                onClick={() => router.push('/pricing')}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Crown className="w-5 h-5 mr-2" />
                Upgrade a Enterprise $159.99/mes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              Auto-Trading Loop
              <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" />
                ENTERPRISE
              </span>
            </h1>
            <p className="text-gray-400 mt-1">
              Ejecuta múltiples backtests automáticamente
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Strategy */}
              <div>
                <Label className="text-sm text-gray-400 mb-2 block">Estrategia</Label>
                <Input
                  value={config.strategy}
                  onChange={(e) => setConfig({ ...config, strategy: e.target.value })}
                  disabled={session?.status === 'running'}
                />
              </div>

              {/* Symbols */}
              <div>
                <Label className="text-sm text-gray-400 mb-2 block">
                  Símbolos ({config.symbols.length})
                </Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Ej: AAPL"
                    value={symbolInput}
                    onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && addSymbol()}
                    disabled={session?.status === 'running'}
                  />
                  <Button
                    onClick={addSymbol}
                    size="sm"
                    disabled={session?.status === 'running'}
                  >
                    +
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.symbols.map((symbol) => (
                    <div
                      key={symbol}
                      className="bg-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      <span>{symbol}</span>
                      <button
                        onClick={() => removeSymbol(symbol)}
                        className="text-red-400 hover:text-red-300"
                        disabled={session?.status === 'running'}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeframes */}
              <div>
                <Label className="text-sm text-gray-400 mb-2 block">Timeframes</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['15m', '1h', '4h', '1d'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => {
                        if (config.timeframes.includes(tf)) {
                          setConfig({
                            ...config,
                            timeframes: config.timeframes.filter((t) => t !== tf),
                          })
                        } else {
                          setConfig({
                            ...config,
                            timeframes: [...config.timeframes, tf],
                          })
                        }
                      }}
                      disabled={session?.status === 'running'}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        config.timeframes.includes(tf)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Backtests */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Backtests</span>
                  <span className="text-lg font-bold text-blue-400">
                    {config.symbols.length * config.timeframes.length}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-2 pt-4 border-t border-gray-800">
                {!session || session.status === 'completed' || session.status === 'stopped' ? (
                  <Button
                    onClick={startLoop}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Iniciar Loop
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {session.status === 'running' ? (
                      <Button
                        onClick={pauseLoop}
                        variant="outline"
                        className="w-full"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pausar
                      </Button>
                    ) : (
                      <Button
                        onClick={resumeLoop}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Reanudar
                      </Button>
                    )}
                    <Button
                      onClick={stopLoop}
                      variant="outline"
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-900/20"
                    >
                      <StopCircle className="w-4 h-4 mr-2" />
                      Detener
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {session ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Progreso del Loop</CardTitle>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    session.status === 'running' ? 'bg-green-600/20 text-green-400' :
                    session.status === 'paused' ? 'bg-yellow-600/20 text-yellow-400' :
                    session.status === 'completed' ? 'bg-blue-600/20 text-blue-400' :
                    'bg-red-600/20 text-red-400'
                  }`}>
                    {session.status.toUpperCase()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">
                      {session.completedBacktests} / {session.totalBacktests} backtests
                    </span>
                    <span className="text-purple-400 font-mono">
                      {session.progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-2 bg-gradient-to-r from-purple-600 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${session.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Results List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {session.results.map((result, idx) => (
                    <motion.div
                      key={result.backtestId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`border rounded-lg p-3 ${
                        result.status === 'completed'
                          ? 'bg-green-900/20 border-green-500/30'
                          : result.status === 'failed'
                          ? 'bg-red-900/20 border-red-500/30'
                          : 'bg-blue-900/20 border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {result.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : result.status === 'failed' ? (
                            <XCircle className="w-5 h-5 text-red-400" />
                          ) : (
                            <Clock className="w-5 h-5 text-blue-400 animate-spin" />
                          )}
                          <div>
                            <p className="font-semibold text-white">
                              {result.symbol} · {result.timeframe}
                            </p>
                            {result.error && (
                              <p className="text-xs text-red-400">{result.error}</p>
                            )}
                          </div>
                        </div>

                        {result.metrics && (
                          <div className="text-right text-sm">
                            <div className="text-white font-mono">
                              Sharpe: {result.metrics.sharpeRatio.toFixed(2)}
                            </div>
                            <div className={result.metrics.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {result.metrics.totalReturn >= 0 ? '+' : ''}
                              {result.metrics.totalReturn.toFixed(2)}%
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Summary */}
                {session.status === 'completed' && (
                  <div className="bg-gray-800/50 rounded-lg p-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {session.results.filter((r) => r.status === 'completed').length}
                      </div>
                      <div className="text-xs text-gray-400">Exitosos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {session.results.filter((r) => r.status === 'failed').length}
                      </div>
                      <div className="text-xs text-gray-400">Fallidos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {(session.results.reduce((sum, r) => sum + r.duration, 0) / 1000).toFixed(1)}s
                      </div>
                      <div className="text-xs text-gray-400">Duración Total</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Configura y ejecuta tu Auto-Loop
                </h3>
                <p className="text-gray-400">
                  Selecciona símbolos, timeframes y presiona "Iniciar Loop"
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
