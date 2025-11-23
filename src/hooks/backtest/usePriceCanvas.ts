/**
 * Hook para rendering del price chart (candlesticks) en canvas
 * Maneja dibujo de velas, SMAs, y trade markers en el gráfico de precio
 */

import { useEffect, useRef, useMemo } from 'react'
import type { PriceCandle, Trade } from '@/types/backtest'
import {
  setupCanvas,
  calculateScale,
  drawGrid,
  drawYAxisLabels,
  drawXAxisLabels,
  drawCandlesticks,
  drawSMALine,
  drawEntryMarker,
  drawExitMarker
} from '@/lib/backtest/canvasUtils'
import { calculateMultipleSMAs } from '@/lib/backtest/calculations'

interface UsePriceCanvasParams {
  priceData: PriceCandle[] | undefined
  currentStep: number
  completedTrades: Trade[]
  showTradeMarkers: boolean
  showSMAs: boolean
}

export function usePriceCanvas(params: UsePriceCanvasParams): React.RefObject<HTMLCanvasElement | null> {
  const {
    priceData,
    currentStep,
    completedTrades,
    showTradeMarkers,
    showSMAs
  } = params

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // ============================================================================
  // CALCULATE SMAs
  // ============================================================================

  const smas = useMemo(() => {
    if (!priceData || priceData.length === 0) return { 20: [], 50: [] }
    return calculateMultipleSMAs(priceData, [20, 50])
  }, [priceData])

  const sma20 = smas[20]
  const sma50 = smas[50]

  // ============================================================================
  // RENDER EFFECT
  // ============================================================================

  useEffect(() => {
    if (!priceData || priceData.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const setup = setupCanvas(canvas)
    if (!setup) return

    const { ctx, width, height } = setup
    const padding = 50

    // Get visible price data (synced with equity)
    const visiblePriceData = priceData.slice(0, currentStep + 1)
    if (visiblePriceData.length === 0) return

    // ============================================================================
    // CALCULATE SCALE
    // ============================================================================

    const minPrice = Math.min(...visiblePriceData.map(d => d.low))
    const maxPrice = Math.max(...visiblePriceData.map(d => d.high))

    const scale = calculateScale(
      visiblePriceData.length,
      minPrice,
      maxPrice,
      width,
      height,
      padding
    )

    // ============================================================================
    // DRAW GRID
    // ============================================================================

    drawGrid(ctx, width, height, padding)

    // ============================================================================
    // DRAW CANDLESTICKS
    // ============================================================================

    drawCandlesticks(ctx, visiblePriceData, scale, height, padding)

    // ============================================================================
    // DRAW SMAs
    // ============================================================================

    if (showSMAs && sma20.length > 0) {
      // SMA 20 (fast) - Orange
      const visibleSMA20 = sma20.slice(0, currentStep + 1)
      drawSMALine(ctx, visibleSMA20, scale, height, padding, '#f97316', 2)

      // SMA 50 (slow) - Blue
      if (sma50.length > 0) {
        const visibleSMA50 = sma50.slice(0, currentStep + 1)
        drawSMALine(ctx, visibleSMA50, scale, height, padding, '#3b82f6', 2)
      }

      // Legend
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillStyle = '#f97316'
      ctx.fillText('SMA 20', padding + 10, padding + 30)
      ctx.fillStyle = '#3b82f6'
      ctx.fillText('SMA 50', padding + 10, padding + 45)
    }

    // ============================================================================
    // DRAW TRADE MARKERS
    // ============================================================================

    if (showTradeMarkers) {
      completedTrades.forEach(trade => {
        const entryIndex = visiblePriceData.findIndex(
          d => new Date(d.date) >= new Date(trade.entryDate)
        )
        const exitIndex = visiblePriceData.findIndex(
          d => new Date(d.date) >= new Date(trade.exitDate)
        )

        // Entry marker (BUY)
        if (entryIndex >= 0 && entryIndex < visiblePriceData.length) {
          const x = padding + entryIndex * scale.xScale
          const y = height - padding - (trade.entryPrice - minPrice) * scale.yScale

          drawEntryMarker(ctx, x, y)
        }

        // Exit marker (SELL)
        if (exitIndex >= 0 && exitIndex < visiblePriceData.length) {
          const x = padding + exitIndex * scale.xScale
          const y = height - padding - (trade.exitPrice - minPrice) * scale.yScale
          const isWin = trade.pnl >= 0

          drawExitMarker(ctx, x, y, isWin)
        }
      })
    }

    // ============================================================================
    // DRAW AXES LABELS
    // ============================================================================

    drawYAxisLabels(
      ctx,
      minPrice,
      maxPrice,
      height,
      padding,
      5,
      (value) => `$${value.toFixed(2)}`
    )

    const dates = visiblePriceData.map(d => d.date)
    drawXAxisLabels(ctx, dates, width, height, padding)

  }, [priceData, currentStep, showTradeMarkers, completedTrades, showSMAs, sma20, sma50])

  return canvasRef
}
