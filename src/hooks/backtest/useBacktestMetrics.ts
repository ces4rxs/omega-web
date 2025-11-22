/**
 * Hook para calcular métricas de backtesting en tiempo real
 * Usa las funciones puras de calculations.ts
 */

import { useMemo } from 'react'
import type {
  EquityPoint,
  Trade,
  BacktestMetrics
} from '@/types/backtest'
import {
  getCompletedTradesUntil,
  calculateMaxDrawdown,
  calculateWinRate,
  getStreak,
  calculateAdvancedMetrics,
  getDrawdownZones,
  getPerformanceByHour,
  getBestHour,
  getWorstHour,
  getUnderwaterEquity
} from '@/lib/backtest/calculations'

interface UseBacktestMetricsParams {
  visibleData: EquityPoint[]
  trades: Trade[]
  initialCapital: number
  currentDate: string | null
}

export function useBacktestMetrics({
  visibleData,
  trades,
  initialCapital,
  currentDate
}: UseBacktestMetricsParams): BacktestMetrics {
  // ============================================================================
  // COMPLETED TRADES
  // ============================================================================

  const completedTrades = useMemo(() => {
    if (!currentDate) return []
    return getCompletedTradesUntil(trades, currentDate)
  }, [trades, currentDate])

  // ============================================================================
  // CURRENT EQUITY & RETURN
  // ============================================================================

  const currentEquity = useMemo(
    () => visibleData[visibleData.length - 1]?.equity || initialCapital,
    [visibleData, initialCapital]
  )

  const currentReturn = useMemo(
    () => ((currentEquity - initialCapital) / initialCapital) * 100,
    [currentEquity, initialCapital]
  )

  // ============================================================================
  // DRAWDOWN METRICS
  // ============================================================================

  const maxDrawdown = useMemo(
    () => calculateMaxDrawdown(visibleData, initialCapital),
    [visibleData, initialCapital]
  )

  const drawdownZones = useMemo(
    () => getDrawdownZones(visibleData, initialCapital),
    [visibleData, initialCapital]
  )

  const underwaterData = useMemo(
    () => getUnderwaterEquity(visibleData, initialCapital),
    [visibleData, initialCapital]
  )

  // ============================================================================
  // TRADING METRICS
  // ============================================================================

  const winRate = useMemo(
    () => calculateWinRate(completedTrades),
    [completedTrades]
  )

  const streak = useMemo(
    () => getStreak(completedTrades),
    [completedTrades]
  )

  // ============================================================================
  // ADVANCED METRICS
  // ============================================================================

  const advancedMetrics = useMemo(
    () => calculateAdvancedMetrics(visibleData, completedTrades, initialCapital),
    [visibleData, completedTrades, initialCapital]
  )

  // ============================================================================
  // TEMPORAL ANALYSIS
  // ============================================================================

  const hourlyPerformance = useMemo(
    () => getPerformanceByHour(completedTrades),
    [completedTrades]
  )

  const bestHour = useMemo(
    () => getBestHour(hourlyPerformance),
    [hourlyPerformance]
  )

  const worstHour = useMemo(
    () => getWorstHour(hourlyPerformance),
    [hourlyPerformance]
  )

  // ============================================================================
  // RETURN
  // ============================================================================

  return useMemo(
    () => ({
      currentEquity,
      currentReturn,
      maxDrawdown,
      winRate,
      completedTrades,
      streak,
      advancedMetrics,
      drawdownZones,
      hourlyPerformance,
      bestHour,
      worstHour,
      underwaterData
    }),
    [
      currentEquity,
      currentReturn,
      maxDrawdown,
      winRate,
      completedTrades,
      streak,
      advancedMetrics,
      drawdownZones,
      hourlyPerformance,
      bestHour,
      worstHour,
      underwaterData
    ]
  )
}
