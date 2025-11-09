"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Sparkles, TrendingUp, Shield } from "lucide-react"
import { useTier } from "@/hooks/use-tier"

interface RiskAIAdvisorProps {
  riskManagement: {
    enableStopLoss: boolean
    stopLoss: number
    enableTakeProfit: boolean
    takeProfit: number
    enableRiskPerTrade: boolean
    riskPerTrade: number
    enableDailyLossLimit: boolean
    dailyLossLimit: number
    enableTrailingStop: boolean
    trailingStopDistance: number
  }
  capital: number
}

export function RiskAIAdvisor({ riskManagement, capital }: RiskAIAdvisorProps) {
  const { isProfessional, isEnterprise } = useTier()

  // Solo mostrar para Professional o Enterprise
  if (!isProfessional && !isEnterprise) {
    return null
  }

  const suggestions = useMemo(() => {
    const tips: Array<{ type: 'success' | 'warning' | 'info'; message: string }> = []

    // Analizar Risk/Reward Ratio
    if (riskManagement.enableStopLoss && riskManagement.enableTakeProfit) {
      const ratio = riskManagement.takeProfit / riskManagement.stopLoss
      if (ratio < 1.5) {
        tips.push({
          type: 'warning',
          message: `Risk/Reward ratio de 1:${ratio.toFixed(2)} es bajo. Aumenta Take Profit a ${(riskManagement.stopLoss * 2).toFixed(1)}% para ratio 1:2.`
        })
      } else if (ratio >= 2.0) {
        tips.push({
          type: 'success',
          message: `Risk/Reward ratio de 1:${ratio.toFixed(2)} es excelente. Mantén este balance.`
        })
      }
    }

    // Sugerir Stop Loss si no está activado
    if (!riskManagement.enableStopLoss) {
      tips.push({
        type: 'warning',
        message: 'Sin Stop Loss activo. Actívalo al 2-3% para proteger tu capital de pérdidas grandes.'
      })
    }

    // Validar Stop Loss muy amplio
    if (riskManagement.enableStopLoss && riskManagement.stopLoss > 5) {
      tips.push({
        type: 'warning',
        message: `Stop Loss de ${riskManagement.stopLoss}% es muy amplio. Considera reducirlo a 2-4% para mejor gestión de riesgo.`
      })
    }

    // Sugerir Daily Loss Limit
    if (!riskManagement.enableDailyLossLimit) {
      tips.push({
        type: 'info',
        message: 'Activa Daily Loss Limit al 5% para prevenir pérdidas emocionales en días malos.'
      })
    }

    // Sugerir Risk Per Trade
    if (!riskManagement.enableRiskPerTrade) {
      tips.push({
        type: 'info',
        message: 'Activa Risk Per Trade al 1-2% para gestión profesional de capital.'
      })
    }

    // Validar Risk Per Trade muy alto
    if (riskManagement.enableRiskPerTrade && riskManagement.riskPerTrade > 3) {
      tips.push({
        type: 'warning',
        message: `Risk Per Trade de ${riskManagement.riskPerTrade}% es agresivo. La regla de oro: nunca exceder 2-3% por trade.`
      })
    }

    // Sugerir Trailing Stop para estrategias de tendencia
    if (!riskManagement.enableTrailingStop && riskManagement.enableStopLoss) {
      tips.push({
        type: 'info',
        message: 'Considera Trailing Stop al 1.5% para capturar tendencias y proteger ganancias automáticamente.'
      })
    }

    // Felicitaciones si todo está bien configurado
    if (
      riskManagement.enableStopLoss &&
      riskManagement.stopLoss <= 4 &&
      riskManagement.enableTakeProfit &&
      riskManagement.takeProfit / riskManagement.stopLoss >= 2 &&
      riskManagement.enableRiskPerTrade &&
      riskManagement.riskPerTrade <= 2
    ) {
      tips.push({
        type: 'success',
        message: '✨ Configuración de riesgo excelente! Estás siguiendo las mejores prácticas institucionales.'
      })
    }

    return tips
  }, [riskManagement])

  if (suggestions.length === 0) {
    return null
  }

  return (
    <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/10 to-blue-900/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Neural Risk Advisor</span>
              <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full">
                {isEnterprise ? 'ENTERPRISE' : 'PRO'}
              </span>
            </CardTitle>
            <p className="text-sm text-gray-400">Sugerencias IA basadas en tu configuración</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((tip, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border ${
              tip.type === 'success'
                ? 'bg-green-900/20 border-green-700/30'
                : tip.type === 'warning'
                ? 'bg-yellow-900/20 border-yellow-700/30'
                : 'bg-blue-900/20 border-blue-700/30'
            }`}
          >
            <div className="flex items-start gap-2">
              {tip.type === 'success' ? (
                <Shield className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              ) : tip.type === 'warning' ? (
                <TrendingUp className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              )}
              <p
                className={`text-sm ${
                  tip.type === 'success'
                    ? 'text-green-300'
                    : tip.type === 'warning'
                    ? 'text-yellow-300'
                    : 'text-blue-300'
                }`}
              >
                {tip.message}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
