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

interface RawBacktestResponse {
  backtest: {
    id: string
    performance: any
    trades: RawTrade[]
    equityCurve: any[]
    createdAt: string
  }
}

/**
 * Transforma trades raw (buy/sell individuales) en trades completos (pares entry/exit)
 */
export function transformBacktestResponse(raw: RawBacktestResponse, symbol: string): any {
  const { backtest } = raw

  // Emparejar trades: cada BUY con su SELL correspondiente
  const pairedTrades = pairTrades(backtest.trades, symbol)

  return {
    backtest: {
      ...backtest,
      trades: pairedTrades
    }
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
