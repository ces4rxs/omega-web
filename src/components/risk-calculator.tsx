"use client"

import { useMemo } from "react"

interface RiskCalculatorProps {
  capital: number
  riskManagement: {
    enableCommission: boolean
    commission: number
    enableSlippage: boolean
    slippage: number
    enableStopLoss: boolean
    stopLoss: number
    enableTakeProfit: boolean
    takeProfit: number
    enableTrailingStop: boolean
    trailingStopDistance: number
    enableDailyLossLimit: boolean
    dailyLossLimit: number
    enableMaxDrawdownLimit: boolean
    maxDrawdownLimit: number
    enableRiskPerTrade: boolean
    riskPerTrade: number
    enablePositionSizing: boolean
    positionSize: number
    maxPositions: number
  }
}

export function RiskCalculator({ capital, riskManagement }: RiskCalculatorProps) {
  const calculations = useMemo(() => {
    const results: string[] = []

    // Commission cost per 100 trades
    if (riskManagement.enableCommission) {
      const costPer100 = riskManagement.commission * 2 * 100 // entrada + salida
      results.push(`Comisiones: ~$${costPer100.toFixed(0)} por 100 trades`)
    }

    // Slippage impact
    if (riskManagement.enableSlippage) {
      results.push(`Slippage: ${riskManagement.slippage}% por entrada/salida`)
    }

    // Stop Loss protection
    if (riskManagement.enableStopLoss) {
      const maxLossUSD = capital * (riskManagement.stopLoss / 100)
      results.push(`Stop Loss: máximo -$${maxLossUSD.toFixed(2)} por trade`)
    }

    // Take Profit target
    if (riskManagement.enableTakeProfit) {
      const targetProfitUSD = capital * (riskManagement.takeProfit / 100)
      results.push(`Take Profit: objetivo +$${targetProfitUSD.toFixed(2)} por trade`)
    }

    // Trailing Stop
    if (riskManagement.enableTrailingStop) {
      results.push(`Trailing Stop: se ajusta ${riskManagement.trailingStopDistance}% bajo el pico`)
    }

    // Daily Loss Limit
    if (riskManagement.enableDailyLossLimit) {
      const dailyLimitUSD = capital * (riskManagement.dailyLossLimit / 100)
      results.push(`Límite diario: -$${dailyLimitUSD.toFixed(2)} (${riskManagement.dailyLossLimit}%)`)
    }

    // Max Drawdown Limit
    if (riskManagement.enableMaxDrawdownLimit) {
      const maxDDUSD = capital * (riskManagement.maxDrawdownLimit / 100)
      results.push(`Límite drawdown: -$${maxDDUSD.toFixed(2)} desde pico (${riskManagement.maxDrawdownLimit}%)`)
    }

    // Risk Per Trade
    if (riskManagement.enableRiskPerTrade) {
      const riskPerTradeUSD = capital * (riskManagement.riskPerTrade / 100)
      results.push(`Riesgo por trade: $${riskPerTradeUSD.toFixed(2)} (${riskManagement.riskPerTrade}% del capital)`)
    }

    // Position Sizing
    if (riskManagement.enablePositionSizing) {
      const capitalPerPosition = capital * (riskManagement.positionSize / 100) / riskManagement.maxPositions
      results.push(`Capital por posición: $${capitalPerPosition.toFixed(2)}`)
    }

    return results
  }, [capital, riskManagement])

  // Calculate Risk/Reward if both SL and TP are enabled
  const riskRewardRatio = useMemo(() => {
    if (riskManagement.enableStopLoss && riskManagement.enableTakeProfit) {
      const ratio = riskManagement.takeProfit / riskManagement.stopLoss
      return ratio.toFixed(2)
    }
    return null
  }, [riskManagement])

  return (
    <div className="mt-4 p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg space-y-2">
      <p className="text-xs text-orange-300 font-semibold mb-1">💡 Impacto Estimado:</p>
      <div className="space-y-1">
        {calculations.map((calc, idx) => (
          <p key={idx} className="text-xs text-gray-400">
            • {calc}
          </p>
        ))}
      </div>

      {riskRewardRatio && (
        <div className="mt-3 p-2 bg-green-900/20 border border-green-700/30 rounded">
          <p className="text-xs text-green-300">
            <span className="font-semibold">✓ Risk/Reward Ratio:</span> 1:{riskRewardRatio}
            {parseFloat(riskRewardRatio) >= 2.0 && <span className="ml-1">(Excelente!)</span>}
            {parseFloat(riskRewardRatio) < 1.5 && <span className="ml-1">(Bajo - considera mejorar)</span>}
          </p>
        </div>
      )}

      {calculations.length === 0 && (
        <p className="text-xs text-gray-500 italic">
          Activa controles de riesgo para ver el impacto estimado
        </p>
      )}
    </div>
  )
}
