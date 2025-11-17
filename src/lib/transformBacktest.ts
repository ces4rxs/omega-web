// Transformar datos raw del backend al formato esperado por el frontend

// ---------- TIPOS DEL BACKEND REAL ----------

export interface BackendTrade {
  type: "buy" | "sell"
  time: number  // UNIX timestamp
  price: number
  size: number
  fee?: number
  slippageBps?: number
}

export interface BackendPerformance {
  initialCash: number
  finalEquity: number
  totalReturn: number        // decimal (e.g., 0.25 = 25%)
  totalReturnPct: number     // percentage (e.g., 25.5 = 25.5%)
  cagr: number               // decimal
  cagrPct: number            // percentage
  sharpeRatio: number
  maxDrawdown: number        // decimal
  trades: number
}

export interface BackendBacktestResponse {
  ok: boolean
  backtest: {
    strategy: string
    symbol: string
    timeframe: string
    period: {
      start: string
      end: string
      bars: number
    }
    performance: BackendPerformance
    trades: BackendTrade[]
    equityCurve: number[]
    execution: {
      time: string
      dataSource: string
      runId: string
    }
  }
}

/**
 * Transforma la respuesta del backend real al formato esperado por el frontend
 * Endpoint: POST /api/backtest
 */
export function transformBacktestResponse(raw: BackendBacktestResponse): any {
  try {
    const { backtest } = raw

    // Validación básica
    if (!backtest) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Respuesta del backend sin campo "backtest":', raw)
      }
      throw new Error("Respuesta inválida del backend")
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Transformando respuesta del backend:', {
        strategy: backtest.strategy,
        symbol: backtest.symbol,
        trades: backtest.trades?.length || 0,
        equityPoints: backtest.equityCurve?.length || 0
      })
    }

    // Emparejar trades: cada BUY con su SELL correspondiente
    const pairedTrades = pairTrades(backtest.trades, backtest.symbol)

    // Calcular métricas faltantes a partir de los trades
    const additionalMetrics = calculateAdditionalMetrics(pairedTrades)

    // Transformar equity curve de array de números a array de objetos con timestamps
    const transformedEquityCurve = transformEquityCurve(
      backtest.equityCurve,
      backtest.period.start,
      backtest.period.end
    )

    // Generar Buy & Hold equity curve para comparación
    const buyAndHoldEquity = generateBuyAndHoldEquity(
      pairedTrades,
      backtest.performance.initialCash,
      backtest.period.start,
      backtest.period.end
    )

    // Calculate Calmar and Recovery Factor
    const calmarRatio = backtest.performance.maxDrawdown > 0
      ? backtest.performance.cagr / backtest.performance.maxDrawdown
      : 0

    const totalReturn = backtest.performance.totalReturn
    const recoveryFactor = backtest.performance.maxDrawdown > 0
      ? totalReturn / backtest.performance.maxDrawdown
      : 0

    // Calcular winning/losing trades
    const winningTrades = pairedTrades.filter(t => t.pnl > 0).length
    const losingTrades = pairedTrades.filter(t => t.pnl <= 0).length

    // Mapear performance metrics al formato esperado por el frontend
    const performance = {
      totalReturn: backtest.performance.totalReturn,           // Ya es decimal
      cagr: backtest.performance.cagr,                        // Ya es decimal
      sharpeRatio: backtest.performance.sharpeRatio,
      maxDrawdown: backtest.performance.maxDrawdown,          // Ya es decimal
      winRate: additionalMetrics.winRate,                     // Calculado
      profitFactor: additionalMetrics.profitFactor,           // Calculado
      totalTrades: backtest.performance.trades,               // Número total
      winningTrades: winningTrades,                           // Calculado
      losingTrades: losingTrades,                             // Calculado
      expectancy: additionalMetrics.expectancy,               // Calculado
      avgWin: additionalMetrics.avgWin,
      avgLoss: additionalMetrics.avgLoss,
      // Advanced metrics
      sortinoRatio: additionalMetrics.sortinoRatio,
      calmarRatio: calmarRatio,
      recoveryFactor: recoveryFactor,
      riskRewardRatio: additionalMetrics.riskRewardRatio,
      maxAdverseExcursion: additionalMetrics.maxAdverseExcursion,
      maxFavorableExcursion: additionalMetrics.maxFavorableExcursion,
      consecutiveWins: additionalMetrics.consecutiveWins,
      consecutiveLosses: additionalMetrics.consecutiveLosses,
      avgTradeDuration: additionalMetrics.avgTradeDuration,
      largestWin: additionalMetrics.largestWin,
      largestLoss: additionalMetrics.largestLoss,
      // Buy & Hold comparison
      buyAndHoldReturn: ((pairedTrades[pairedTrades.length - 1]?.exitPrice - pairedTrades[0]?.entryPrice) / pairedTrades[0]?.entryPrice) || 0,
      alpha: backtest.performance.totalReturn - (((pairedTrades[pairedTrades.length - 1]?.exitPrice - pairedTrades[0]?.entryPrice) / pairedTrades[0]?.entryPrice) || 0),
      beta: 1.0 // Simplificado por ahora
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ TRANSFORMED PERFORMANCE:', performance)
    }

    return {
      backtest: {
        id: backtest.execution?.runId || `run-${Date.now()}`,
        performance,
        trades: pairedTrades,
        equityCurve: transformedEquityCurve,
        buyAndHoldEquity: buyAndHoldEquity,
        initialCapital: backtest.performance.initialCash,
        finalCapital: backtest.performance.finalEquity,
        createdAt: new Date().toISOString(),
        // Metadata adicional
        strategy: backtest.strategy,
        symbol: backtest.symbol,
        timeframe: backtest.timeframe,
        period: backtest.period
      }
    }
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error transformando respuesta del backend:', error)
    }
    throw new Error(`Error procesando resultados del backtest: ${error.message}`)
  }
}

/**
 * Genera la curva de equity para estrategia Buy & Hold
 */
function generateBuyAndHoldEquity(
  trades: any[],
  initialCapital: number,
  startDate: string,
  endDate: string
): Array<{time: number, value: number}> {
  if (trades.length === 0) {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    return [
      { time: start, value: initialCapital },
      { time: end, value: initialCapital }
    ]
  }

  // Obtener el primer y último precio de los trades
  const firstTrade = trades[0]
  const lastTrade = trades[trades.length - 1]

  const entryPrice = firstTrade.entryPrice
  const exitPrice = lastTrade.exitPrice

  // Calcular cuántas unidades podríamos comprar con el capital inicial
  const quantity = initialCapital / entryPrice

  // Generar puntos de equity basados en el cambio de precio
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const duration = end - start
  const points = 100 // Generar 100 puntos para una curva suave

  const buyAndHoldEquity: Array<{time: number, value: number}> = []

  for (let i = 0; i <= points; i++) {
    const timestamp = start + (duration * i / points)
    // Interpolación lineal del precio
    const progress = i / points
    const currentPrice = entryPrice + (exitPrice - entryPrice) * progress
    const currentValue = quantity * currentPrice

    buyAndHoldEquity.push({
      time: timestamp,
      value: currentValue
    })
  }

  return buyAndHoldEquity
}

/**
 * Transforma equity curve de array de números a objetos con timestamps
 */
function transformEquityCurve(equityCurve: number[], startDate: string, endDate: string): Array<{time: number, value: number}> {
  if (!equityCurve || equityCurve.length === 0) return []

  const start = new Date(startDate)
  const end = new Date(endDate)
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const interval = totalDays / equityCurve.length

  return equityCurve.map((equity, index) => {
    const timestamp = start.getTime() + (index * interval * 24 * 60 * 60 * 1000)
    return {
      time: timestamp,
      value: equity
    }
  })
}

/**
 * Calcula métricas adicionales a partir de los trades emparejados
 */
function calculateAdditionalMetrics(trades: any[]) {
  if (trades.length === 0) {
    return {
      winRate: 0,
      profitFactor: 0,
      expectancy: 0,
      avgWin: 0,
      avgLoss: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      recoveryFactor: 0,
      riskRewardRatio: 0,
      maxAdverseExcursion: 0,
      maxFavorableExcursion: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      avgTradeDuration: 0,
      largestWin: 0,
      largestLoss: 0
    }
  }

  const winningTrades = trades.filter(t => t.pnl > 0)
  const losingTrades = trades.filter(t => t.pnl < 0)

  // Basic metrics
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0

  const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0)
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0))
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0

  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)
  const expectancy = trades.length > 0 ? totalPnL / trades.length : 0

  // Average win/loss
  const avgWin = winningTrades.length > 0
    ? totalWins / winningTrades.length
    : 0

  const avgLoss = losingTrades.length > 0
    ? totalLosses / losingTrades.length
    : 0

  // Risk/Reward Ratio
  const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : 0

  // Largest win/loss
  const largestWin = winningTrades.length > 0
    ? Math.max(...winningTrades.map(t => t.pnl))
    : 0

  const largestLoss = losingTrades.length > 0
    ? Math.abs(Math.min(...losingTrades.map(t => t.pnl)))
    : 0

  // Consecutive wins/losses
  let maxConsecutiveWins = 0
  let maxConsecutiveLosses = 0
  let currentWins = 0
  let currentLosses = 0

  for (const trade of trades) {
    if (trade.pnl > 0) {
      currentWins++
      currentLosses = 0
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWins)
    } else if (trade.pnl < 0) {
      currentLosses++
      currentWins = 0
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses)
    }
  }

  // Average trade duration (convert from milliseconds to days)
  const avgTradeDuration = trades.length > 0
    ? trades.reduce((sum, t) => sum + (t.duration || 0), 0) / trades.length / (1000 * 60 * 60 * 24)
    : 0

  // MAE/MFE (simplified - using largest loss/win as proxy)
  const maxAdverseExcursion = largestLoss
  const maxFavorableExcursion = largestWin

  // Sortino Ratio (simplified - using downside deviation)
  const downsideReturns = losingTrades.map(t => t.pnl)
  const downsideDeviation = downsideReturns.length > 0
    ? Math.sqrt(downsideReturns.reduce((sum, r) => sum + r * r, 0) / downsideReturns.length)
    : 1

  const sortinoRatio = downsideDeviation > 0 ? expectancy / downsideDeviation : 0

  // Calmar Ratio (CAGR / Max Drawdown) - needs to be calculated in performance
  // For now, set to 0 and calculate at higher level
  const calmarRatio = 0

  // Recovery Factor (Net Profit / Max Drawdown)
  // For now, set to 0 and calculate at higher level
  const recoveryFactor = 0

  return {
    winRate,
    profitFactor,
    expectancy,
    avgWin,
    avgLoss,
    sortinoRatio,
    calmarRatio,
    recoveryFactor,
    riskRewardRatio,
    maxAdverseExcursion,
    maxFavorableExcursion,
    consecutiveWins: maxConsecutiveWins,
    consecutiveLosses: maxConsecutiveLosses,
    avgTradeDuration,
    largestWin,
    largestLoss
  }
}

/**
 * Empareja trades buy/sell en trades completos con entry/exit
 * Retorna trades en el formato esperado por el frontend (timestamps en ms)
 */
function pairTrades(rawTrades: BackendTrade[], symbol: string): any[] {
  const pairedTrades: any[] = []
  let tradeId = 1
  let position: BackendTrade | null = null

  for (const trade of rawTrades) {
    if (trade.type === "buy" && !position) {
      // Abrir posición long
      position = trade
    } else if (trade.type === "sell" && position) {
      // Cerrar posición long
      const pnl = (trade.price - position.price) * position.size - (position.fee || 0) - (trade.fee || 0)
      const pnlPercent = ((trade.price - position.price) / position.price) * 100
      const durationMs = trade.time - position.time

      pairedTrades.push({
        id: tradeId++,
        symbol: symbol,
        side: "long",
        entryTime: position.time,
        exitTime: trade.time,
        entryPrice: position.price,
        exitPrice: trade.price,
        quantity: position.size,
        pnl: pnl,
        pnlPercent: pnlPercent,
        duration: durationMs
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

      pairedTrades.push({
        id: tradeId++,
        symbol: symbol,
        side: "short",
        entryTime: position.time,
        exitTime: trade.time,
        entryPrice: position.price,
        exitPrice: trade.price,
        quantity: position.size,
        pnl: pnl,
        pnlPercent: pnlPercent,
        duration: durationMs
      })

      position = null
    }
  }

  return pairedTrades
}
