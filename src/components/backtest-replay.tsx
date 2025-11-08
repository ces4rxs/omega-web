"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  DollarSign,
  Zap,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import type { Trade } from "@/lib/types"

interface BacktestReplayProps {
  equityCurve: Array<{ date: string; equity: number }>
  trades: Trade[]
  initialCapital: number
}

export function BacktestReplay({ equityCurve, trades, initialCapital }: BacktestReplayProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [showTradMarkers, setShowTradeMarkers] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const maxSteps = equityCurve.length
  const visibleData = equityCurve.slice(0, currentStep + 1)

  // Calcular trades completados hasta el momento actual
  const completedTrades = trades.filter((trade) => {
    const tradeEndDate = new Date(trade.exitDate).getTime()
    const currentDate = new Date(equityCurve[currentStep]?.date || 0).getTime()
    return tradeEndDate <= currentDate
  })

  // Calcular métricas en tiempo real
  const currentEquity = visibleData[visibleData.length - 1]?.equity || initialCapital
  const currentReturn = ((currentEquity - initialCapital) / initialCapital) * 100
  const progress = (currentStep / (maxSteps - 1)) * 100

  // Calcular max drawdown hasta el momento
  const calculateDrawdown = () => {
    let peak = initialCapital
    let maxDD = 0
    visibleData.forEach((point) => {
      if (point.equity > peak) peak = point.equity
      const dd = ((peak - point.equity) / peak) * 100
      if (dd > maxDD) maxDD = dd
    })
    return maxDD
  }

  // Calcular win rate actual
  const winningTrades = completedTrades.filter((t) => t.pnl > 0).length
  const winRate = completedTrades.length > 0 ? (winningTrades / completedTrades.length) * 100 : 0

  // Calcular consecutive wins/losses
  const getStreak = () => {
    if (completedTrades.length === 0) return { type: 'none', count: 0 }
    let streak = 0
    let isWinStreak = completedTrades[completedTrades.length - 1].pnl > 0

    for (let i = completedTrades.length - 1; i >= 0; i--) {
      const isWin = completedTrades[i].pnl > 0
      if (isWin === isWinStreak) {
        streak++
      } else {
        break
      }
    }

    return { type: isWinStreak ? 'win' : 'loss', count: streak }
  }

  const streak = getStreak()

  // Dibujar gráfico con canvas para mejor performance
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || visibleData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height
    const padding = 40

    // Clear canvas
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, width, height)

    // Calculate scale
    const minEquity = Math.min(...visibleData.map((d) => d.equity), initialCapital)
    const maxEquity = Math.max(...visibleData.map((d) => d.equity), initialCapital)
    const range = maxEquity - minEquity || 1

    const xScale = (width - 2 * padding) / Math.max(1, visibleData.length - 1)
    const yScale = (height - 2 * padding) / range

    // Draw grid
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * (height - 2 * padding)) / 5
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw initial capital line
    ctx.strokeStyle = '#475569'
    ctx.setLineDash([5, 5])
    ctx.lineWidth = 1
    const initialY = height - padding - (initialCapital - minEquity) * yScale
    ctx.beginPath()
    ctx.moveTo(padding, initialY)
    ctx.lineTo(width - padding, initialY)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw equity curve
    ctx.beginPath()
    ctx.strokeStyle = currentReturn >= 0 ? '#10b981' : '#ef4444'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    visibleData.forEach((point, i) => {
      const x = padding + i * xScale
      const y = height - padding - (point.equity - minEquity) * yScale

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
    if (currentReturn >= 0) {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)')
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)')
    }
    ctx.fillStyle = gradient
    ctx.lineTo(width - padding, height - padding)
    ctx.lineTo(padding, height - padding)
    ctx.closePath()
    ctx.fill()

    // Draw trade markers
    if (showTradMarkers) {
      completedTrades.forEach((trade) => {
        const entryIndex = visibleData.findIndex((d) => new Date(d.date) >= new Date(trade.entryDate))
        const exitIndex = visibleData.findIndex((d) => new Date(d.date) >= new Date(trade.exitDate))

        if (entryIndex >= 0) {
          const x = padding + entryIndex * xScale
          const y = height - padding - (visibleData[entryIndex].equity - minEquity) * yScale

          // Entry marker (buy)
          ctx.fillStyle = '#3b82f6'
          ctx.beginPath()
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = '#1e40af'
          ctx.lineWidth = 2
          ctx.stroke()
        }

        if (exitIndex >= 0) {
          const x = padding + exitIndex * xScale
          const y = height - padding - (visibleData[exitIndex].equity - minEquity) * yScale

          // Exit marker (sell)
          ctx.fillStyle = trade.pnl >= 0 ? '#10b981' : '#ef4444'
          ctx.beginPath()
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = trade.pnl >= 0 ? '#059669' : '#dc2626'
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })
    }

    // Draw current position indicator
    if (visibleData.length > 0) {
      const lastIndex = visibleData.length - 1
      const x = padding + lastIndex * xScale
      const y = height - padding - (visibleData[lastIndex].equity - minEquity) * yScale

      ctx.fillStyle = currentReturn >= 0 ? '#10b981' : '#ef4444'
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fill()

      // Pulse effect
      ctx.strokeStyle = currentReturn >= 0 ? '#10b981' : '#ef4444'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, 12, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw axes labels
    ctx.fillStyle = '#94a3b8'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'right'

    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = minEquity + (range * i) / 5
      const y = height - padding - (i * (height - 2 * padding)) / 5
      ctx.fillText(`$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, padding - 10, y + 4)
    }

  }, [visibleData, currentReturn, showTradMarkers, completedTrades, initialCapital])

  // Controlar reproducción
  useEffect(() => {
    if (isPlaying && currentStep < maxSteps - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= maxSteps - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 100 / speed)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, currentStep, maxSteps, speed])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handlePlayPause()
      } else if (e.code === 'ArrowLeft') {
        handleStepBack()
      } else if (e.code === 'ArrowRight') {
        handleStepForward()
      } else if (e.code === 'KeyR') {
        handleReset()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentStep, isPlaying, maxSteps])

  const handlePlayPause = () => {
    if (currentStep >= maxSteps - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const handleStepBack = () => {
    setIsPlaying(false)
    setCurrentStep((prev) => Math.max(0, prev - 10))
  }

  const handleStepForward = () => {
    setIsPlaying(false)
    setCurrentStep((prev) => Math.min(maxSteps - 1, prev + 10))
  }

  const handleSkipToStart = () => {
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const handleSkipToEnd = () => {
    setIsPlaying(false)
    setCurrentStep(maxSteps - 1)
  }

  const currentDate = visibleData[visibleData.length - 1]?.date
  const lastTrade = completedTrades[completedTrades.length - 1]

  return (
    <Card className="overflow-hidden border-blue-500/30">
      <CardHeader className="bg-gradient-to-r from-blue-600/10 to-cyan-600/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Replay del Backtest
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              {currentDate ? new Date(currentDate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Inicio'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Progreso</div>
            <div className="text-2xl font-bold text-white">
              {progress.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Canvas Chart */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-80 rounded-lg bg-slate-900"
            style={{ width: '100%', height: '320px' }}
          />

          {/* Floating current value */}
          <motion.div
            key={currentEquity}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/10"
          >
            <div className="text-xs text-gray-400 mb-1">Equity Actual</div>
            <div className={`text-2xl font-bold ${currentReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${currentEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm ${currentReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {currentReturn >= 0 ? '+' : ''}{currentReturn.toFixed(2)}%
            </div>
          </motion.div>
        </div>

        {/* Real-time Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            key={completedTrades.length}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Trades</span>
            </div>
            <div className="text-3xl font-bold text-white">{completedTrades.length}</div>
          </motion.div>

          <motion.div
            key={winRate}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Win Rate</span>
            </div>
            <div className="text-3xl font-bold text-green-400">{winRate.toFixed(1)}%</div>
          </motion.div>

          <motion.div
            key={calculateDrawdown()}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-400">Max DD</span>
            </div>
            <div className="text-3xl font-bold text-orange-400">-{calculateDrawdown().toFixed(2)}%</div>
          </motion.div>

          <motion.div
            key={streak.count}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={`bg-gradient-to-br ${
              streak.type === 'win'
                ? 'from-purple-900/30 to-pink-900/30 border-purple-500/30'
                : 'from-gray-900/30 to-slate-900/30 border-gray-500/30'
            } border rounded-lg p-4`}
          >
            <div className="flex items-center gap-2 mb-2">
              {streak.type === 'win' ? (
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm text-gray-400">Racha</span>
            </div>
            <div className={`text-3xl font-bold ${
              streak.type === 'win' ? 'text-purple-400' : 'text-gray-400'
            }`}>
              {streak.count > 0 ? `${streak.count} ${streak.type === 'win' ? 'W' : 'L'}` : '-'}
            </div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Paso {currentStep + 1} de {maxSteps}</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSkipToStart}
              disabled={currentStep === 0}
              className="h-10 w-10"
              title="Inicio (R)"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleStepBack}
              disabled={currentStep === 0}
              className="h-10 w-10"
              title="Retroceder (←)"
            >
              <Rewind className="w-5 h-5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={handlePlayPause}
              className="h-14 w-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/20"
              title="Play/Pause (Espacio)"
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleStepForward}
              disabled={currentStep >= maxSteps - 1}
              className="h-10 w-10"
              title="Avanzar (→)"
            >
              <FastForward className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleSkipToEnd}
              disabled={currentStep >= maxSteps - 1}
              className="h-10 w-10"
              title="Final"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Speed Control */}
            <div className="flex items-center gap-3 flex-1">
              <span className="text-sm text-gray-400 whitespace-nowrap">Velocidad:</span>
              <Slider
                min={0.5}
                max={5}
                step={0.5}
                value={speed}
                onValueChange={setSpeed}
                className="flex-1"
              />
              <span className="text-sm font-mono font-semibold text-white min-w-[3rem]">
                {speed.toFixed(1)}x
              </span>
            </div>

            {/* Show Markers Toggle */}
            <Button
              variant={showTradMarkers ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowTradeMarkers(!showTradMarkers)}
              className={showTradMarkers ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Marcadores
            </Button>
          </div>
        </div>

        {/* Last Trade Info */}
        <AnimatePresence mode="wait">
          {lastTrade && (
            <motion.div
              key={lastTrade.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`border-2 rounded-lg p-4 ${
                lastTrade.pnl >= 0
                  ? 'bg-green-900/20 border-green-500/50'
                  : 'bg-red-900/20 border-red-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  {lastTrade.pnl >= 0 ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      Último Trade: ¡Ganancia!
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      Último Trade: Pérdida
                    </>
                  )}
                </h4>
                <span className={`text-lg font-bold ${lastTrade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {lastTrade.pnl >= 0 ? '+' : ''}${lastTrade.pnl.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Entrada:</span>{' '}
                  <span className="text-white font-semibold">
                    ${lastTrade.entryPrice.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Salida:</span>{' '}
                  <span className="text-white font-semibold">
                    ${lastTrade.exitPrice.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">P&L:</span>{' '}
                  <span className={`font-semibold ${lastTrade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {lastTrade.pnlPercent >= 0 ? '+' : ''}{lastTrade.pnlPercent.toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Duración:</span>{' '}
                  <span className="text-white font-semibold">{lastTrade.duration} días</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard Shortcuts Help */}
        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="text-xs text-gray-400 text-center">
            <span className="font-semibold">Atajos:</span> Espacio (Play/Pause) • ← → (Navegar) • R (Reiniciar)
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
