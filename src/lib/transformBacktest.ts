// Transformar datos raw del backend al formato esperado por el frontend

import type { Trade } from "./types"

interface RawTrade {
  type: "buy" | "sell"
  time: number  // UNIX timestamp
  price: number
  size: number
  fee?: number
  slippageBps?: number
}

interface RawPerformance {
  initialCash: number
  finalEquity: number
  totalReturn: number
  totalReturnPct: number
  cagr: number
  cagrPct: number
  sharpeRatio: number
  maxDrawdown: number
  maxDrawdownPct: number
  trades: number
}

interface RawBacktestResponse {
  ok?: boolean
  backtest: {
    strategy: string
    symbol: string
    timeframe: string
    period: {
      start: string
      end: string
      bars: number
    }
    performance: RawPerformance
    trades: RawTrade[]
    equityCurve: number[]
    execution: any
  }
}

/**
 * Transforma la respuesta completa del backend al formato esperado por el frontend
 */
export function transformBacktestResponse(raw: RawBacktestResponse, symbol: string): any {
  const { backtest } = raw

  // DEBUG: Ver qué devuelve el backend
  console.log('🔍 RAW BACKEND RESPONSE:', JSON.stringify(raw, null, 2))
  console.log('🔍 PERFORMANCE METRICS:', backtest.performance)

  // Emparejar trades: cada BUY con su SELL correspondiente
  const pairedTrades = pairTrades(backtest.trades, symbol)

  // Calcular métricas faltantes a partir de los trades
  const additionalMetrics = calculateAdditionalMetrics(pairedTrades)

  // Transformar equity curve de array de números a array de objetos con fechas
  const transformedEquityCurve = transformEquityCurve(
    backtest.equityCurve,
    backtest.period.start,
    backtest.period.end
  )

  // Mapear performance metrics al formato esperado por el frontend
  const performance = {
    totalReturn: backtest.performance.totalReturn,           // Ya es decimal
    cagr: backtest.performance.cagr,                        // Ya es decimal
    sharpeRatio: backtest.performance.sharpeRatio,
    maxDrawdown: backtest.performance.maxDrawdown,          // Ya es decimal
    winRate: additionalMetrics.winRate,                     // Calculado
    profitFactor: additionalMetrics.profitFactor,           // Calculado
    totalTrades: backtest.performance.trades,               // Número total
    expectancy: additionalMetrics.expectancy                // Calculado
  }

  console.log('✅ TRANSFORMED PERFORMANCE:', performance)

  return {
    backtest: {
      id: backtest.execution?.runId || 'unknown',
      performance,
      trades: pairedTrades,
      equityCurve: transformedEquityCurve,
      createdAt: new Date().toISOString()
    }
  }
}

/**
 * Transforma equity curve de array de números a objetos con fechas
 */
function transformEquityCurve(equityCurve: number[], startDate: string, endDate: string): Array<{date: string, equity: number}> {
  if (!equityCurve || equityCurve.length === 0) return []

  const start = new Date(startDate)
  const end = new Date(endDate)
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const interval = totalDays / equityCurve.length

  return equityCurve.map((equity, index) => {
    const date = new Date(start.getTime() + (index * interval * 24 * 60 * 60 * 1000))
    return {
      date: date.toISOString().split('T')[0],
      equity: equity
    }
  })
}

/**
 * Calcula métricas adicionales a partir de los trades emparejados
 */
function calculateAdditionalMetrics(trades: Trade[]) {
  if (trades.length === 0) {
    return {
      winRate: 0,
      profitFactor: 0,
      expectancy: 0
    }
  }

  const winningTrades = trades.filter(t => t.pnl > 0)
  const losingTrades = trades.filter(t => t.pnl < 0)

  const winRate = trades.length > 0 ? winningTrades.length / trades.length : 0

  const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0)
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0))
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0

  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)
  const expectancy = trades.length > 0 ? totalPnL / trades.length : 0

  return {
    winRate,
    profitFactor,
    expectancy
  }
}

/**
 * Empareja trades buy/sell en trades completos con entry/exit
 */
function pairTrades(rawTrades: RawTrade[], symbol: string): Trade[] {
  const pairedTrades: Trade[] = []
  let position: RawTrade | null = null
  let tradeId = 1

  for (const trade of rawTrades) {
    if (trade.type === "buy" && !position) {
      // Abrir posición long
      position = trade
    } else if (trade.type === "sell" && position) {
      // Cerrar posición long
      const pnl = (trade.price - position.price) * position.size - (position.fee || 0) - (trade.fee || 0)
      const pnlPercent = ((trade.price - position.price) / position.price) * 100
      const durationMs = trade.time - position.time
      const durationDays = Math.round(durationMs / (1000 * 60 * 60 * 24))

      pairedTrades.push({
        id: `trade-${tradeId++}`,
        symbol: symbol,
        side: "long",
        entryDate: new Date(position.time).toISOString(),
        exitDate: new Date(trade.time).toISOString(),
        entryPrice: position.price,
        exitPrice: trade.price,
        quantity: position.size,
        pnl: pnl,
        pnlPercent: pnlPercent,
        duration: durationDays
      })

      position = null
    } else if (trade.type === "sell" && !position) {
      // Abrir posición short
      position = trade
    } else if (trade.type === "buy" && position && position.type === "sell") {
      // Cerrar posición short
      const pnl = (position.price - trade.price) * position.size - (position.fee || 0) - (trade.fee || 0)
      const pnlPercent = ((position.price - trade.price) / position.price) * 100
      const durationMs = trade.time - position.time
      const durationDays = Math.round(durationMs / (1000 * 60 * 60 * 24))

      pairedTrades.push({
        id: `trade-${tradeId++}`,
        symbol: symbol,
        side: "short",
        entryDate: new Date(position.time).toISOString(),
        exitDate: new Date(trade.time).toISOString(),
        entryPrice: position.price,
        exitPrice: trade.price,
        quantity: position.size,
        pnl: pnl,
        pnlPercent: pnlPercent,
        duration: durationDays
      })

      position = null
    }
  }

  return pairedTrades
}
