/**
 * Hook para rendering del equity chart en canvas
 * Maneja todo el dibujo del equity curve con gradientes, markers, etc
 */

import { useEffect, useRef } from 'react'
import type {
  EquityPoint,
  BenchmarkPoint,
  DrawdownZone,
  Trade
} from '@/types/backtest'
import {
  setupCanvas,
  calculateScale,
  drawGrid,
  drawYAxisLabels,
  drawXAxisLabels,
  drawDrawdownZone,
  drawHorizontalLine,
  drawEquityLine,
  drawEquityGradientFill,
  drawCurrentPositionIndicator
} from '@/lib/backtest/canvasUtils'

interface UseEquityCanvasParams {
  visibleData: EquityPoint[]
  initialCapital: number
  currentReturn: number
  completedTrades: Trade[]
  drawdownZones: DrawdownZone[]
  benchmarkData?: BenchmarkPoint[]
  currentStep: number
  showTradeMarkers: boolean
  showDrawdownZones: boolean
  showBenchmark: boolean
}

export function useEquityCanvas(params: UseEquityCanvasParams): React.RefObject<HTMLCanvasElement> {
  const {
    visibleData,
    initialCapital,
    currentReturn,
    completedTrades,
    drawdownZones,
    benchmarkData,
    currentStep,
    showTradeMarkers,
    showDrawdownZones,
    showBenchmark
  } = params

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || visibleData.length === 0) return

    const setup = setupCanvas(canvas)
    if (!setup) return

    const { ctx, width, height } = setup
    const padding = 50

    // ============================================================================
    // CALCULATE SCALE
    // ============================================================================

    const minEquity = Math.min(...visibleData.map(d => d.equity), initialCapital)
    const maxEquity = Math.max(...visibleData.map(d => d.equity), initialCapital)

    const scale = calculateScale(
      visibleData.length,
      minEquity,
      maxEquity,
      width,
      height,
      padding
    )

    // ============================================================================
    // DRAW DRAWDOWN ZONES (BACKGROUND)
    // ============================================================================

    if (showDrawdownZones) {
      drawdownZones.forEach(zone => {
        drawDrawdownZone(ctx, zone, scale, width, height, padding)
      })
    }

    // ============================================================================
    // DRAW GRID
    // ============================================================================

    drawGrid(ctx, width, height, padding)

    // ============================================================================
    // DRAW BENCHMARK (IF ENABLED)
    // ============================================================================

    if (showBenchmark && benchmarkData && benchmarkData.length > 0) {
      const visibleBenchmark = benchmarkData.slice(0, currentStep + 1)
      const benchmarkInitial = benchmarkData[0].value

      ctx.beginPath()
      ctx.strokeStyle = '#64748b'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      visibleBenchmark.forEach((point, i) => {
        const x = padding + i * scale.xScale
        const normalizedValue = (point.value / benchmarkInitial) * initialCapital
        const y = height - padding - (normalizedValue - minEquity) * scale.yScale

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
      ctx.setLineDash([])
    }

    // ============================================================================
    // DRAW INITIAL CAPITAL LINE
    // ============================================================================

    drawHorizontalLine(
      ctx,
      initialCapital,
      scale,
      width,
      height,
      padding,
      '#475569',
      true
    )

    // ============================================================================
    // DRAW EQUITY CURVE
    // ============================================================================

    const isPositive = currentReturn >= 0

    // Gradient fill first
    drawEquityGradientFill(
      ctx,
      visibleData,
      scale,
      width,
      height,
      padding,
      isPositive
    )

    // Then line on top
    drawEquityLine(
      ctx,
      visibleData,
      scale,
      width,
      height,
      padding,
      isPositive ? '#10b981' : '#ef4444',
      3,
      10
    )

    // ============================================================================
    // DRAW TRADE MARKERS
    // ============================================================================

    if (showTradeMarkers) {
      completedTrades.forEach(trade => {
        const entryIndex = visibleData.findIndex(
          d => new Date(d.date) >= new Date(trade.entryDate)
        )
        const exitIndex = visibleData.findIndex(
          d => new Date(d.date) >= new Date(trade.exitDate)
        )

        // Entry marker
        if (entryIndex >= 0) {
          const x = padding + entryIndex * scale.xScale
          const y = height - padding - (visibleData[entryIndex].equity - minEquity) * scale.yScale

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

        // Exit marker
        if (exitIndex >= 0) {
          const x = padding + exitIndex * scale.xScale
          const y = height - padding - (visibleData[exitIndex].equity - minEquity) * scale.yScale

          const isWin = trade.pnl >= 0

          ctx.fillStyle = isWin ? '#10b981' : '#ef4444'
          ctx.beginPath()
          ctx.arc(x, y, 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = isWin ? '#059669' : '#dc2626'
          ctx.lineWidth = 2
          ctx.stroke()

          // Triangle down
          ctx.fillStyle = isWin ? '#10b981' : '#ef4444'
          ctx.beginPath()
          ctx.moveTo(x, y + 8)
          ctx.lineTo(x - 5, y + 14)
          ctx.lineTo(x + 5, y + 14)
          ctx.closePath()
          ctx.fill()
        }
      })
    }

    // ============================================================================
    // DRAW CURRENT POSITION INDICATOR
    // ============================================================================

    if (visibleData.length > 0) {
      const lastIndex = visibleData.length - 1
      const x = padding + lastIndex * scale.xScale
      const y = height - padding - (visibleData[lastIndex].equity - minEquity) * scale.yScale

      drawCurrentPositionIndicator(ctx, x, y, isPositive)
    }

    // ============================================================================
    // DRAW AXES LABELS
    // ============================================================================

    drawYAxisLabels(ctx, minEquity, maxEquity, height, padding)

    const dates = visibleData.map(d => d.date)
    drawXAxisLabels(ctx, dates, width, height, padding)

  }, [
    visibleData,
    currentReturn,
    showTradeMarkers,
    completedTrades,
    initialCapital,
    showDrawdownZones,
    drawdownZones,
    showBenchmark,
    benchmarkData,
    currentStep
  ])

  return canvasRef
}
