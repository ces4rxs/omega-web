/**
 * Funciones puras para cálculos de backtesting
 * Todas las funciones son puras (sin side effects) y completamente testeables
 */

import type {
  EquityPoint,
  PriceCandle,
  DrawdownZone,
  AdvancedMetrics,
  HourlyPerformance,
  StreakInfo,
  Trade
} from '@/types/backtest'

// ============================================================================
// FILTRADO DE TRADES
// ============================================================================

/**
 * Filtra trades completados hasta una fecha específica
 */
export function getCompletedTradesUntil(
  trades: Trade[],
  currentDate: string
): Trade[] {
  const currentTime = new Date(currentDate).getTime()

  return trades.filter((trade) => {
    const tradeEndDate = new Date(trade.exitDate).getTime()
    return tradeEndDate <= currentTime
  })
}

// ============================================================================
// CÁLCULOS DE DRAWDOWN
// ============================================================================

/**
 * Calcula el máximo drawdown hasta el momento
 */
export function calculateMaxDrawdown(
  equityData: EquityPoint[],
  initialCapital: number
): number {
  let peak = initialCapital
  let maxDD = 0

  equityData.forEach((point) => {
    if (point.equity > peak) peak = point.equity
    const dd = ((peak - point.equity) / peak) * 100
    if (dd > maxDD) maxDD = dd
  })

  return maxDD
}

/**
 * Detecta zonas de drawdown en la equity curve
 */
export function getDrawdownZones(
  equityData: EquityPoint[],
  initialCapital: number
): DrawdownZone[] {
  const zones: DrawdownZone[] = []
  let peak = initialCapital
  let inDrawdown = false
  let drawdownStart = 0

  equityData.forEach((point, i) => {
    if (point.equity > peak) {
      if (inDrawdown) {
        zones.push({
          start: drawdownStart,
          end: i - 1,
          depth: ((peak - equityData[i - 1].equity) / peak) * 100
        })
        inDrawdown = false
      }
      peak = point.equity
    } else if (point.equity < peak && !inDrawdown) {
      inDrawdown = true
      drawdownStart = i
    }
  })

  // Si aún estamos en drawdown al final
  if (inDrawdown) {
    const lastEquity = equityData[equityData.length - 1].equity
    zones.push({
      start: drawdownStart,
      end: equityData.length - 1,
      depth: ((peak - lastEquity) / peak) * 100
    })
  }

  return zones
}

/**
 * Calcula underwater equity (drawdown a lo largo del tiempo)
 */
export function getUnderwaterEquity(
  equityData: EquityPoint[],
  initialCapital: number
): number[] {
  const underwater: number[] = []
  let peak = initialCapital

  equityData.forEach(point => {
    if (point.equity > peak) peak = point.equity
    const dd = ((peak - point.equity) / peak) * 100
    underwater.push(-dd)
  })

  return underwater
}

// ============================================================================
// WIN RATE Y STREAKS
// ============================================================================

/**
 * Calcula win rate de trades completados
 */
export function calculateWinRate(trades: Trade[]): number {
  if (trades.length === 0) return 0

  const winningTrades = trades.filter((t) => t.pnl > 0).length
  return (winningTrades / trades.length) * 100
}

/**
 * Calcula racha actual (wins o losses consecutivos)
 */
export function getStreak(trades: Trade[]): StreakInfo {
  if (trades.length === 0) {
    return { type: 'none', count: 0 }
  }

  let streak = 0
  const lastTrade = trades[trades.length - 1]
  const isWinStreak = lastTrade.pnl > 0

  for (let i = trades.length - 1; i >= 0; i--) {
    const isWin = trades[i].pnl > 0
    if (isWin === isWinStreak) {
      streak++
    } else {
      break
    }
  }

  return {
    type: isWinStreak ? 'win' : 'loss',
    count: streak
  }
}

// ============================================================================
// MÉTRICAS AVANZADAS
// ============================================================================

/**
 * Calcula todas las métricas avanzadas (Sharpe, Sortino, Profit Factor, etc)
 */
export function calculateAdvancedMetrics(
  equityData: EquityPoint[],
  trades: Trade[],
  initialCapital: number
): AdvancedMetrics | null {
  if (trades.length === 0) return null

  // Calcular retornos diarios
  const returns = equityData.map((point, i) => {
    if (i === 0) return 0
    return ((point.equity - equityData[i - 1].equity) / equityData[i - 1].equity) * 100
  }).slice(1)

  if (returns.length === 0) return null

  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  const stdDev = Math.sqrt(
    returns.reduce((sq, n) => sq + Math.pow(n - avgReturn, 2), 0) / returns.length
  )

  // Sharpe Ratio (asumiendo 0% risk-free rate, anualizado)
  const sharpe = stdDev !== 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0

  // Sortino Ratio (solo volatilidad negativa)
  const negativeReturns = returns.filter(r => r < 0)
  const downsideStdDev = negativeReturns.length > 0
    ? Math.sqrt(negativeReturns.reduce((sq, n) => sq + Math.pow(n, 2), 0) / negativeReturns.length)
    : 0
  const sortino = downsideStdDev !== 0 ? (avgReturn / downsideStdDev) * Math.sqrt(252) : 0

  // Profit Factor
  const grossProfit = trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0)
  const grossLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0))
  const profitFactor = grossLoss !== 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0

  // Expectancy (ganancia esperada por trade)
  const expectancy = trades.reduce((sum, t) => sum + t.pnl, 0) / trades.length

  // Calmar Ratio
  const currentEquity = equityData[equityData.length - 1].equity
  const currentReturn = ((currentEquity - initialCapital) / initialCapital) * 100
  const maxDD = calculateMaxDrawdown(equityData, initialCapital)
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

// ============================================================================
// ANÁLISIS TEMPORAL
// ============================================================================

/**
 * Calcula performance por hora del día
 */
export function getPerformanceByHour(trades: Trade[]): HourlyPerformance {
  const hourlyPerformance: HourlyPerformance = {}

  // Inicializar todas las horas
  for (let h = 0; h < 24; h++) {
    hourlyPerformance[h] = { profit: 0, trades: 0 }
  }

  // Acumular datos por hora
  trades.forEach(trade => {
    const hour = new Date(trade.entryDate).getHours()
    hourlyPerformance[hour].profit += trade.pnl
    hourlyPerformance[hour].trades += 1
  })

  return hourlyPerformance
}

/**
 * Encuentra la mejor hora de trading
 */
export function getBestHour(hourlyPerformance: HourlyPerformance): string {
  return Object.entries(hourlyPerformance).reduce((best, [hour, data]) => {
    const bestProfit = hourlyPerformance[parseInt(best)]?.profit ?? -Infinity
    return data.profit > bestProfit ? hour : best
  }, '0')
}

/**
 * Encuentra la peor hora de trading
 */
export function getWorstHour(hourlyPerformance: HourlyPerformance): string {
  return Object.entries(hourlyPerformance).reduce((worst, [hour, data]) => {
    const worstProfit = hourlyPerformance[parseInt(worst)]?.profit ?? Infinity
    return data.profit < worstProfit ? hour : worst
  }, '0')
}

// ============================================================================
// INDICADORES TÉCNICOS
// ============================================================================

/**
 * Calcula Simple Moving Average (SMA)
 */
export function calculateSMA(priceData: PriceCandle[], period: number): number[] {
  if (priceData.length < period) return []

  const smas: number[] = []

  for (let i = 0; i < priceData.length; i++) {
    if (i < period - 1) {
      smas.push(NaN)
    } else {
      const sum = priceData
        .slice(i - period + 1, i + 1)
        .reduce((acc, d) => acc + d.close, 0)
      smas.push(sum / period)
    }
  }

  return smas
}

/**
 * Calcula múltiples SMAs a la vez
 */
export function calculateMultipleSMAs(
  priceData: PriceCandle[],
  periods: number[]
): Record<number, number[]> {
  const result: Record<number, number[]> = {}

  periods.forEach(period => {
    result[period] = calculateSMA(priceData, period)
  })

  return result
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Formatea un número como porcentaje
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

/**
 * Formatea un número como dinero
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`
}

/**
 * Calcula el progreso en porcentaje
 */
export function calculateProgress(currentStep: number, maxSteps: number): number {
  if (maxSteps <= 1) return 100
  return (currentStep / (maxSteps - 1)) * 100
}
