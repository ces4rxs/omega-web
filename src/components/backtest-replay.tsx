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
  CheckCircle2,
  Maximize2,
  Minimize2,
  Camera,
  Download,
  BarChart3,
  LineChart,
  Flame,
  Shield,
  Gauge,
  Calendar
} from "lucide-react"
import type { Trade } from "@/lib/types"

interface BacktestReplayProps {
  equityCurve: Array<{ date: string; equity: number }>
  trades: Trade[]
  initialCapital: number
  priceData?: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>
  benchmarkData?: Array<{ date: string; value: number }>
}

export function BacktestReplay({ equityCurve, trades, initialCapital, priceData, benchmarkData }: BacktestReplayProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [showTradeMarkers, setShowTradeMarkers] = useState(true)
  const [showBenchmark, setShowBenchmark] = useState(false)
  const [showDrawdownZones, setShowDrawdownZones] = useState(true)
  const [showVolume, setShowVolume] = useState(true)
  const [showSMAs, setShowSMAs] = useState(true)
  const [showMinimap, setShowMinimap] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<'single' | 'dual'>('dual')
  const [lastTradeSound, setLastTradeSound] = useState<'win' | 'loss' | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const equityCanvasRef = useRef<HTMLCanvasElement>(null)
  const priceCanvasRef = useRef<HTMLCanvasElement>(null)
  const volumeCanvasRef = useRef<HTMLCanvasElement>(null)
  const underwaterCanvasRef = useRef<HTMLCanvasElement>(null)
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Calcular métricas avanzadas
  const calculateAdvancedMetrics = () => {
    if (completedTrades.length === 0) return null

    const returns = visibleData.map((point, i) => {
      if (i === 0) return 0
      return ((point.equity - visibleData[i - 1].equity) / visibleData[i - 1].equity) * 100
    }).slice(1)

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const stdDev = Math.sqrt(returns.reduce((sq, n) => sq + Math.pow(n - avgReturn, 2), 0) / returns.length)

    // Sharpe Ratio (asumiendo 0% risk-free rate, anualizado)
    const sharpe = stdDev !== 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0

    // Sortino Ratio (solo volatilidad negativa)
    const negativeReturns = returns.filter(r => r < 0)
    const downsideStdDev = negativeReturns.length > 0
      ? Math.sqrt(negativeReturns.reduce((sq, n) => sq + Math.pow(n, 2), 0) / negativeReturns.length)
      : 0
    const sortino = downsideStdDev !== 0 ? (avgReturn / downsideStdDev) * Math.sqrt(252) : 0

    // Profit Factor
    const grossProfit = completedTrades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0)
    const grossLoss = Math.abs(completedTrades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0))
    const profitFactor = grossLoss !== 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0

    // Expectancy
    const expectancy = completedTrades.reduce((sum, t) => sum + t.pnl, 0) / completedTrades.length

    // Calmar Ratio
    const maxDD = calculateDrawdown()
    const calmar = maxDD !== 0 ? (currentReturn / maxDD) : 0

    return {
      sharpe,
      sortino,
      profitFactor,
      expectancy,
      calmar,
      avgReturn,
      stdDev
    }
  }

  const advancedMetrics = calculateAdvancedMetrics()

  // Detectar zonas de drawdown
  const getDrawdownZones = () => {
    const zones: Array<{ start: number; end: number; depth: number }> = []
    let peak = initialCapital
    let inDrawdown = false
    let drawdownStart = 0

    visibleData.forEach((point, i) => {
      if (point.equity > peak) {
        if (inDrawdown) {
          zones.push({ start: drawdownStart, end: i - 1, depth: ((peak - visibleData[i - 1].equity) / peak) * 100 })
          inDrawdown = false
        }
        peak = point.equity
      } else if (point.equity < peak && !inDrawdown) {
        inDrawdown = true
        drawdownStart = i
      }
    })

    if (inDrawdown) {
      const lastEquity = visibleData[visibleData.length - 1].equity
      zones.push({ start: drawdownStart, end: visibleData.length - 1, depth: ((peak - lastEquity) / peak) * 100 })
    }

    return zones
  }

  const drawdownZones = getDrawdownZones()

  // Calcular SMAs (Simple Moving Averages)
  const calculateSMAs = (period: number) => {
    if (!priceData || priceData.length < period) return []

    const smas: number[] = []
    for (let i = 0; i < priceData.length; i++) {
      if (i < period - 1) {
        smas.push(NaN)
      } else {
        const sum = priceData.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0)
        smas.push(sum / period)
      }
    }
    return smas
  }

  const sma20 = priceData ? calculateSMAs(20) : []
  const sma50 = priceData ? calculateSMAs(50) : []

  // Performance Heatmap por hora del día
  const getPerformanceByHour = () => {
    const hourlyPerformance: { [hour: number]: { profit: number; trades: number } } = {}

    for (let h = 0; h < 24; h++) {
      hourlyPerformance[h] = { profit: 0, trades: 0 }
    }

    completedTrades.forEach(trade => {
      const hour = new Date(trade.entryDate).getHours()
      hourlyPerformance[hour].profit += trade.pnl
      hourlyPerformance[hour].trades += 1
    })

    return hourlyPerformance
  }

  const hourlyPerformance = getPerformanceByHour()

  // Calcular Best/Worst hours
  const bestHour = Object.entries(hourlyPerformance).reduce((best, [hour, data]) => {
    return data.profit > (hourlyPerformance[parseInt(best)] || { profit: -Infinity }).profit ? hour : best
  }, '0')

  const worstHour = Object.entries(hourlyPerformance).reduce((worst, [hour, data]) => {
    return data.profit < (hourlyPerformance[parseInt(worst)] || { profit: Infinity }).profit ? hour : worst
  }, '0')

  // Underwater Equity (drawdown en tiempo)
  const getUnderwaterEquity = () => {
    const underwater: number[] = []
    let peak = initialCapital

    visibleData.forEach(point => {
      if (point.equity > peak) peak = point.equity
      const dd = ((peak - point.equity) / peak) * 100
      underwater.push(-dd)
    })

    return underwater
  }

  const underwaterData = getUnderwaterEquity()

  // Sound effects
  const playSound = (type: 'win' | 'loss') => {
    if (!soundEnabled) return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    if (type === 'win') {
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
    } else {
      oscillator.frequency.value = 200
      oscillator.type = 'square'
    }

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  }

  // Detectar nuevo trade completado para sound
  useEffect(() => {
    if (completedTrades.length > 0 && lastTrade) {
      const wasWin = lastTrade.pnl >= 0
      if (lastTradeSound !== (wasWin ? 'win' : 'loss')) {
        playSound(wasWin ? 'win' : 'loss')
        setLastTradeSound(wasWin ? 'win' : 'loss')
      }
    }
  }, [completedTrades.length])

  // Dibujar gráfico de PRECIO (candlesticks) si hay priceData
  useEffect(() => {
    if (!priceData || priceData.length === 0) return

    const canvas = priceCanvasRef.current
    if (!canvas || visibleData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height
    const padding = 50

    // Clear canvas
    ctx.fillStyle = '#0a0f1e'
    ctx.fillRect(0, 0, width, height)

    // Obtener datos visibles de precio (sincronizado con equity)
    const visiblePriceData = priceData.slice(0, currentStep + 1)

    if (visiblePriceData.length === 0) return

    // Calculate scale
    const minPrice = Math.min(...visiblePriceData.map((d) => d.low))
    const maxPrice = Math.max(...visiblePriceData.map((d) => d.high))
    const priceRange = maxPrice - minPrice || 1

    const xScale = (width - 2 * padding) / Math.max(1, visiblePriceData.length - 1)
    const yScale = (height - 2 * padding) / priceRange

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

    // Vertical time grid
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i * (width - 2 * padding)) / 10
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }

    // Draw candlesticks
    const candleWidth = Math.max(2, xScale * 0.6)

    visiblePriceData.forEach((candle, i) => {
      const x = padding + i * xScale
      const openY = height - padding - (candle.open - minPrice) * yScale
      const closeY = height - padding - (candle.close - minPrice) * yScale
      const highY = height - padding - (candle.high - minPrice) * yScale
      const lowY = height - padding - (candle.low - minPrice) * yScale

      const isGreen = candle.close >= candle.open

      // Draw wick (high-low line)
      ctx.strokeStyle = isGreen ? '#10b981' : '#ef4444'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, lowY)
      ctx.stroke()

      // Draw body (open-close)
      ctx.fillStyle = isGreen ? '#10b981' : '#ef4444'
      const bodyHeight = Math.abs(openY - closeY) || 1
      const bodyY = Math.min(openY, closeY)
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight)

      // Draw border
      ctx.strokeStyle = isGreen ? '#059669' : '#dc2626'
      ctx.lineWidth = 1
      ctx.strokeRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight)
    })

    // Draw SMAs if enabled
    if (showSMAs && sma20.length > 0) {
      // SMA 20 (rápida) - Naranja
      ctx.beginPath()
      ctx.strokeStyle = '#f97316'
      ctx.lineWidth = 2
      ctx.setLineDash([])

      visiblePriceData.forEach((_, i) => {
        if (!isNaN(sma20[i])) {
          const x = padding + i * xScale
          const y = height - padding - (sma20[i] - minPrice) * yScale

          if (i === 0 || isNaN(sma20[i - 1])) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
      })
      ctx.stroke()

      // SMA 50 (lenta) - Azul
      if (sma50.length > 0) {
        ctx.beginPath()
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2

        visiblePriceData.forEach((_, i) => {
          if (!isNaN(sma50[i])) {
            const x = padding + i * xScale
            const y = height - padding - (sma50[i] - minPrice) * yScale

            if (i === 0 || isNaN(sma50[i - 1])) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
        })
        ctx.stroke()
      }

      // Legend
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillStyle = '#f97316'
      ctx.fillText('SMA 20', padding + 10, padding + 30)
      ctx.fillStyle = '#3b82f6'
      ctx.fillText('SMA 50', padding + 10, padding + 45)
    }

    // Draw trade markers on price chart
    if (showTradeMarkers) {
      completedTrades.forEach((trade) => {
        const entryIndex = visiblePriceData.findIndex((d) => new Date(d.date) >= new Date(trade.entryDate))
        const exitIndex = visiblePriceData.findIndex((d) => new Date(d.date) >= new Date(trade.exitDate))

        if (entryIndex >= 0 && entryIndex < visiblePriceData.length) {
          const x = padding + entryIndex * xScale
          const candle = visiblePriceData[entryIndex]
          const y = height - padding - (trade.entryPrice - minPrice) * yScale

          // Entry marker - BUY arrow
          ctx.fillStyle = '#3b82f6'
          ctx.strokeStyle = '#1e40af'
          ctx.lineWidth = 2

          // Triangle pointing up
          ctx.beginPath()
          ctx.moveTo(x, y - 5)
          ctx.lineTo(x - 7, y + 5)
          ctx.lineTo(x + 7, y + 5)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()

          // Label "BUY"
          ctx.fillStyle = '#3b82f6'
          ctx.font = 'bold 10px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('BUY', x, y + 18)
        }

        if (exitIndex >= 0 && exitIndex < visiblePriceData.length) {
          const x = padding + exitIndex * xScale
          const y = height - padding - (trade.exitPrice - minPrice) * yScale

          // Exit marker - SELL arrow
          const isWin = trade.pnl >= 0
          ctx.fillStyle = isWin ? '#10b981' : '#ef4444'
          ctx.strokeStyle = isWin ? '#059669' : '#dc2626'
          ctx.lineWidth = 2

          // Triangle pointing down
          ctx.beginPath()
          ctx.moveTo(x, y + 5)
          ctx.lineTo(x - 7, y - 5)
          ctx.lineTo(x + 7, y - 5)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()

          // Label "SELL"
          ctx.fillStyle = isWin ? '#10b981' : '#ef4444'
          ctx.font = 'bold 10px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('SELL', x, y - 10)
        }
      })
    }

    // Draw axes labels
    ctx.fillStyle = '#94a3b8'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'right'

    // Y-axis labels (price)
    for (let i = 0; i <= 5; i++) {
      const value = minPrice + (priceRange * i) / 5
      const y = height - padding - (i * (height - 2 * padding)) / 5
      ctx.fillText(`$${value.toFixed(2)}`, padding - 10, y + 4)
    }

    // X-axis labels (dates)
    ctx.textAlign = 'center'
    for (let i = 0; i <= 5; i++) {
      const index = Math.floor((visiblePriceData.length - 1) * (i / 5))
      if (index < visiblePriceData.length) {
        const date = new Date(visiblePriceData[index].date)
        const x = padding + index * xScale
        ctx.fillText(
          date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
          x,
          height - padding + 20
        )
      }
    }

  }, [priceData, visibleData, currentStep, showTradeMarkers, completedTrades])

  // Dibujar gráfico de equity con canvas mejorado
  useEffect(() => {
    const canvas = equityCanvasRef.current
    if (!canvas || visibleData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height
    const padding = 50

    // Clear canvas
    ctx.fillStyle = '#0a0f1e'
    ctx.fillRect(0, 0, width, height)

    // Calculate scale
    const minEquity = Math.min(...visibleData.map((d) => d.equity), initialCapital)
    const maxEquity = Math.max(...visibleData.map((d) => d.equity), initialCapital)
    const range = maxEquity - minEquity || 1

    const xScale = (width - 2 * padding) / Math.max(1, visibleData.length - 1)
    const yScale = (height - 2 * padding) / range

    // Draw drawdown zones
    if (showDrawdownZones) {
      drawdownZones.forEach((zone) => {
        if (zone.depth > 5) { // Solo mostrar drawdowns > 5%
          const startX = padding + zone.start * xScale
          const endX = padding + zone.end * xScale

          const gradient = ctx.createLinearGradient(0, 0, 0, height)
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.15)')
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)')

          ctx.fillStyle = gradient
          ctx.fillRect(startX, padding, endX - startX, height - 2 * padding)

          // Etiqueta del drawdown
          ctx.fillStyle = '#ef4444'
          ctx.font = 'bold 11px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(`-${zone.depth.toFixed(1)}%`, (startX + endX) / 2, padding + 15)
        }
      })
    }

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

    // Vertical time grid
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i * (width - 2 * padding)) / 10
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }

    // Draw benchmark if available
    if (showBenchmark && benchmarkData && benchmarkData.length > 0) {
      const visibleBenchmark = benchmarkData.slice(0, currentStep + 1)
      const benchmarkInitial = benchmarkData[0].value

      ctx.beginPath()
      ctx.strokeStyle = '#64748b'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      visibleBenchmark.forEach((point, i) => {
        const x = padding + i * xScale
        const normalizedValue = (point.value / benchmarkInitial) * initialCapital
        const y = height - padding - (normalizedValue - minEquity) * yScale

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
      ctx.setLineDash([])
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

    // Draw equity curve with gradient
    ctx.beginPath()
    ctx.strokeStyle = currentReturn >= 0 ? '#10b981' : '#ef4444'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = currentReturn >= 0 ? '#10b981' : '#ef4444'
    ctx.shadowBlur = 10

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
    ctx.shadowBlur = 0

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
    if (currentReturn >= 0) {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)')
      gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.2)')
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)')
      gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.2)')
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)')
    }
    ctx.fillStyle = gradient
    ctx.lineTo(width - padding, height - padding)
    ctx.lineTo(padding, height - padding)
    ctx.closePath()
    ctx.fill()

    // Draw trade markers
    if (showTradeMarkers) {
      completedTrades.forEach((trade) => {
        const entryIndex = visibleData.findIndex((d) => new Date(d.date) >= new Date(trade.entryDate))
        const exitIndex = visibleData.findIndex((d) => new Date(d.date) >= new Date(trade.exitDate))

        if (entryIndex >= 0) {
          const x = padding + entryIndex * xScale
          const y = height - padding - (visibleData[entryIndex].equity - minEquity) * yScale

          // Entry marker (buy)
          ctx.fillStyle = '#3b82f6'
          ctx.beginPath()
          ctx.arc(x, y, 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = '#1e40af'
          ctx.lineWidth = 2
          ctx.stroke()

          // Triangle up
          ctx.fillStyle = '#3b82f6'
          ctx.beginPath()
          ctx.moveTo(x, y - 8)
          ctx.lineTo(x - 5, y - 14)
          ctx.lineTo(x + 5, y - 14)
          ctx.closePath()
          ctx.fill()
        }

        if (exitIndex >= 0) {
          const x = padding + exitIndex * xScale
          const y = height - padding - (visibleData[exitIndex].equity - minEquity) * yScale

          // Exit marker (sell)
          ctx.fillStyle = trade.pnl >= 0 ? '#10b981' : '#ef4444'
          ctx.beginPath()
          ctx.arc(x, y, 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = trade.pnl >= 0 ? '#059669' : '#dc2626'
          ctx.lineWidth = 2
          ctx.stroke()

          // Triangle down
          ctx.fillStyle = trade.pnl >= 0 ? '#10b981' : '#ef4444'
          ctx.beginPath()
          ctx.moveTo(x, y + 8)
          ctx.lineTo(x - 5, y + 14)
          ctx.lineTo(x + 5, y + 14)
          ctx.closePath()
          ctx.fill()
        }
      })
    }

    // Draw current position indicator with glow
    if (visibleData.length > 0) {
      const lastIndex = visibleData.length - 1
      const x = padding + lastIndex * xScale
      const y = height - padding - (visibleData[lastIndex].equity - minEquity) * yScale

      // Outer glow
      ctx.fillStyle = currentReturn >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
      ctx.beginPath()
      ctx.arc(x, y, 16, 0, Math.PI * 2)
      ctx.fill()

      // Inner circle
      ctx.fillStyle = currentReturn >= 0 ? '#10b981' : '#ef4444'
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fill()

      // Border
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Draw axes labels
    ctx.fillStyle = '#94a3b8'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'right'

    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = minEquity + (range * i) / 5
      const y = height - padding - (i * (height - 2 * padding)) / 5
      ctx.fillText(`$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, padding - 10, y + 4)
    }

    // X-axis labels (dates)
    ctx.textAlign = 'center'
    for (let i = 0; i <= 5; i++) {
      const index = Math.floor((visibleData.length - 1) * (i / 5))
      if (index < visibleData.length) {
        const date = new Date(visibleData[index].date)
        const x = padding + index * xScale
        ctx.fillText(
          date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
          x,
          height - padding + 20
        )
      }
    }

  }, [visibleData, currentReturn, showTradeMarkers, completedTrades, initialCapital, showDrawdownZones, drawdownZones, showBenchmark, benchmarkData, currentStep])

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const takeScreenshot = () => {
    const canvas = equityCanvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `backtest-replay-${new Date().toISOString().slice(0, 10)}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const currentDate = visibleData[visibleData.length - 1]?.date
  const lastTrade = completedTrades[completedTrades.length - 1]

  return (
    <div ref={containerRef} className={isFullscreen ? 'bg-slate-950 p-6' : ''}>
      <Card className="overflow-hidden border-blue-500/30 bg-gradient-to-br from-slate-900 to-slate-950">
        <CardHeader className="bg-gradient-to-r from-blue-600/10 via-cyan-600/10 to-purple-600/10 border-b border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <div className="relative">
                  <Zap className="w-6 h-6 text-blue-400 animate-pulse" />
                  <div className="absolute inset-0 blur-lg bg-blue-500/50"></div>
                </div>
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent font-bold">
                  Replay Profesional
                </span>
                <span className="text-xs px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300">
                  PRO
                </span>
              </CardTitle>
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {currentDate ? new Date(currentDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short'
                }) : 'Inicio del backtest'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Progreso</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {progress.toFixed(1)}%
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={takeScreenshot}
                  className="bg-slate-800/50 border-slate-700 hover:bg-slate-700 hover:border-blue-500/50"
                  title="Capturar Screenshot"
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="bg-slate-800/50 border-slate-700 hover:bg-slate-700 hover:border-blue-500/50"
                  title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Price Chart (Candlesticks) - Solo si hay priceData */}
        {priceData && priceData.length > 0 && (
          <div className="relative">
            <div className="absolute top-2 left-2 z-10 flex gap-2">
              <div className="text-xs px-2 py-1 bg-black/70 backdrop-blur-sm rounded border border-green-500/30 text-green-300 flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                Precio (OHLC)
              </div>
            </div>

            <canvas
              ref={priceCanvasRef}
              className="w-full rounded-lg bg-gradient-to-br from-slate-950 to-slate-900 border border-green-500/20"
              style={{ width: '100%', height: '300px' }}
            />

            {/* Current price indicator */}
            {priceData && currentStep < priceData.length && (
              <motion.div
                key={currentStep}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-4 right-4 bg-black/90 backdrop-blur-md rounded-xl p-3 border border-green-500/30 shadow-2xl shadow-green-500/20"
              >
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Precio Actual</div>
                <div className={`text-2xl font-bold ${priceData[currentStep].close >= priceData[0].open ? 'text-green-400' : 'text-red-400'}`}>
                  ${priceData[currentStep].close.toFixed(2)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div>
                    <span className="text-gray-500">H:</span>{' '}
                    <span className="text-green-400">${priceData[currentStep].high.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">L:</span>{' '}
                    <span className="text-red-400">${priceData[currentStep].low.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Equity Chart */}
        <div className="relative">
          <div className="absolute top-2 left-2 z-10 flex gap-2">
            <div className="text-xs px-2 py-1 bg-black/70 backdrop-blur-sm rounded border border-blue-500/30 text-blue-300 flex items-center gap-1">
              <LineChart className="w-3 h-3" />
              Equity Curve
            </div>
            {showDrawdownZones && (
              <div className="text-xs px-2 py-1 bg-red-500/20 backdrop-blur-sm rounded border border-red-500/30 text-red-300 flex items-center gap-1">
                <Flame className="w-3 h-3" />
                Drawdown Zones
              </div>
            )}
            {showBenchmark && benchmarkData && (
              <div className="text-xs px-2 py-1 bg-gray-500/20 backdrop-blur-sm rounded border border-gray-500/30 text-gray-300 flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                Benchmark
              </div>
            )}
          </div>

          <canvas
            ref={equityCanvasRef}
            className="w-full rounded-lg bg-gradient-to-br from-slate-950 to-slate-900 border border-blue-500/20"
            style={{ width: '100%', height: '400px' }}
          />

          {/* Floating current value */}
          <motion.div
            key={currentEquity}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-4 right-4 bg-black/90 backdrop-blur-md rounded-xl p-4 border border-blue-500/30 shadow-2xl shadow-blue-500/20"
          >
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Equity Actual</div>
            <div className={`text-3xl font-bold mb-1 ${currentReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${currentEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-2">
              {currentReturn >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-lg font-semibold ${currentReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {currentReturn >= 0 ? '+' : ''}{currentReturn.toFixed(2)}%
              </span>
            </div>
          </motion.div>
        </div>

        {/* Advanced Metrics Panel */}
        {advancedMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
          >
            <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-gray-400">Sharpe Ratio</span>
              </div>
              <div className={`text-2xl font-bold ${advancedMetrics.sharpe > 1 ? 'text-green-400' : advancedMetrics.sharpe > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                {advancedMetrics.sharpe.toFixed(2)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-gray-400">Sortino</span>
              </div>
              <div className={`text-2xl font-bold ${advancedMetrics.sortino > 1 ? 'text-green-400' : advancedMetrics.sortino > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                {advancedMetrics.sortino.toFixed(2)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-gray-400">Profit Factor</span>
              </div>
              <div className={`text-2xl font-bold ${advancedMetrics.profitFactor === Infinity ? 'text-green-400' : advancedMetrics.profitFactor > 2 ? 'text-green-400' : advancedMetrics.profitFactor > 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                {advancedMetrics.profitFactor === Infinity ? '∞' : advancedMetrics.profitFactor.toFixed(2)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-900/30 to-yellow-900/30 border border-orange-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-3 h-3 text-orange-400" />
                <span className="text-xs text-gray-400">Expectancy</span>
              </div>
              <div className={`text-2xl font-bold ${advancedMetrics.expectancy > 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${advancedMetrics.expectancy.toFixed(0)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span className="text-xs text-gray-400">Calmar</span>
              </div>
              <div className={`text-2xl font-bold ${advancedMetrics.calmar > 2 ? 'text-green-400' : advancedMetrics.calmar > 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                {advancedMetrics.calmar.toFixed(2)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-900/30 to-rose-900/30 border border-pink-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-3 h-3 text-pink-400" />
                <span className="text-xs text-gray-400">Volatilidad</span>
              </div>
              <div className="text-2xl font-bold text-pink-400">
                {advancedMetrics.stdDev.toFixed(2)}%
              </div>
            </div>
          </motion.div>
        )}

        {/* Performance Heatmap - Visual por hora */}
        {showHeatmap && completedTrades.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-purple-400" />
                  Performance Heatmap por Hora
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Mejor hora: {parseInt(bestHour)}:00 • Peor hora: {parseInt(worstHour)}:00
                </p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-1">
              {Array.from({ length: 24 }, (_, hour) => {
                const data = hourlyPerformance[hour]
                const maxProfit = Math.max(...Object.values(hourlyPerformance).map(h => h.profit))
                const minProfit = Math.min(...Object.values(hourlyPerformance).map(h => h.profit))
                const range = maxProfit - minProfit || 1

                // Calcular intensidad del color
                let bgColor = 'bg-slate-800/50'
                let textColor = 'text-gray-400'
                let borderColor = 'border-slate-700'

                if (data.trades > 0) {
                  const intensity = Math.abs((data.profit - minProfit) / range)

                  if (data.profit > 0) {
                    // Verde para ganancias
                    if (intensity > 0.7) {
                      bgColor = 'bg-green-500/40'
                      textColor = 'text-green-200'
                      borderColor = 'border-green-400/50'
                    } else if (intensity > 0.4) {
                      bgColor = 'bg-green-600/30'
                      textColor = 'text-green-300'
                      borderColor = 'border-green-500/40'
                    } else {
                      bgColor = 'bg-green-700/20'
                      textColor = 'text-green-400'
                      borderColor = 'border-green-600/30'
                    }
                  } else if (data.profit < 0) {
                    // Rojo para pérdidas
                    if (intensity > 0.7) {
                      bgColor = 'bg-red-500/40'
                      textColor = 'text-red-200'
                      borderColor = 'border-red-400/50'
                    } else if (intensity > 0.4) {
                      bgColor = 'bg-red-600/30'
                      textColor = 'text-red-300'
                      borderColor = 'border-red-500/40'
                    } else {
                      bgColor = 'bg-red-700/20'
                      textColor = 'text-red-400'
                      borderColor = 'border-red-600/30'
                    }
                  }
                }

                return (
                  <motion.div
                    key={hour}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: hour * 0.02 }}
                    className={`${bgColor} ${borderColor} border rounded-lg p-2 aspect-square flex flex-col items-center justify-center hover:scale-110 transition-transform cursor-pointer group relative`}
                    title={`${hour}:00 - ${data.trades} trades - $${data.profit.toFixed(0)}`}
                  >
                    <div className={`text-[10px] font-bold ${textColor}`}>
                      {hour}h
                    </div>
                    {data.trades > 0 && (
                      <>
                        <div className="text-[8px] text-gray-400">{data.trades}t</div>
                        <div className={`absolute inset-0 ${bgColor} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                          <div className="text-[10px] font-bold text-white">
                            ${data.profit > 0 ? '+' : ''}{data.profit.toFixed(0)}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500/40 border border-green-400/50 rounded"></div>
                <span className="text-gray-400">Alta ganancia</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500/40 border border-red-400/50 rounded"></div>
                <span className="text-gray-400">Alta pérdida</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-800/50 border border-slate-700 rounded"></div>
                <span className="text-gray-400">Sin trades</span>
              </div>
            </div>
          </motion.div>
        )}

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

          <div className="space-y-3">
            {/* Speed Control */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 whitespace-nowrap min-w-[80px]">Velocidad:</span>
              <Slider
                min={0.5}
                max={5}
                step={0.5}
                value={speed}
                onValueChange={setSpeed}
                className="flex-1"
              />
              <span className="text-sm font-mono font-semibold text-white min-w-[3rem] bg-slate-800/50 px-2 py-1 rounded border border-slate-700">
                {speed.toFixed(1)}x
              </span>
            </div>

            {/* Feature Toggles */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-400 mr-2">Vista:</span>
              <Button
                variant={showTradeMarkers ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowTradeMarkers(!showTradeMarkers)}
                className={showTradeMarkers ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800/50 border-slate-700'}
              >
                <Target className="w-3 h-3 mr-1" />
                Trades
              </Button>
              <Button
                variant={showDrawdownZones ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowDrawdownZones(!showDrawdownZones)}
                className={showDrawdownZones ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-800/50 border-slate-700'}
              >
                <Flame className="w-3 h-3 mr-1" />
                Drawdowns
              </Button>
              {priceData && (
                <>
                  <Button
                    variant={showSMAs ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowSMAs(!showSMAs)}
                    className={showSMAs ? 'bg-orange-600 hover:bg-orange-700' : 'bg-slate-800/50 border-slate-700'}
                  >
                    <LineChart className="w-3 h-3 mr-1" />
                    SMAs
                  </Button>
                  <Button
                    variant={showHeatmap ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={showHeatmap ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-800/50 border-slate-700'}
                  >
                    <Flame className="w-3 h-3 mr-1" />
                    Heatmap
                  </Button>
                </>
              )}
              {benchmarkData && (
                <Button
                  variant={showBenchmark ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowBenchmark(!showBenchmark)}
                  className={showBenchmark ? 'bg-gray-600 hover:bg-gray-700' : 'bg-slate-800/50 border-slate-700'}
                >
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Benchmark
                </Button>
              )}
              <Button
                variant={soundEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={soundEnabled ? 'bg-pink-600 hover:bg-pink-700' : 'bg-slate-800/50 border-slate-700'}
                title="Sound FX en trades"
              >
                <Zap className="w-3 h-3 mr-1" />
                Sound
              </Button>
            </div>
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
        <div className="bg-gradient-to-r from-slate-800/30 via-blue-800/20 to-slate-800/30 rounded-lg p-3 border border-blue-500/10">
          <div className="text-xs text-gray-400 text-center">
            <span className="font-semibold text-blue-300">⌨️ Atajos de Teclado:</span>{' '}
            <span className="bg-slate-700/50 px-2 py-0.5 rounded mx-1">Espacio</span> Play/Pause •{' '}
            <span className="bg-slate-700/50 px-2 py-0.5 rounded mx-1">←</span>
            <span className="bg-slate-700/50 px-2 py-0.5 rounded mx-1">→</span> Navegar •{' '}
            <span className="bg-slate-700/50 px-2 py-0.5 rounded mx-1">R</span> Reiniciar
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}
