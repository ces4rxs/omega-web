"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, AlertCircle, CheckCircle, TrendingDown, Activity } from "lucide-react"
import type { PerformanceMetrics } from "@/lib/types"

interface RiskAlert {
  id: string
  level: 'critical' | 'warning' | 'success' | 'info'
  title: string
  message: string
  metric?: string
  value?: number | string
}

interface RiskAlertsProps {
  metrics: PerformanceMetrics
}

export function RiskAlerts({ metrics }: RiskAlertsProps) {
  const alerts: RiskAlert[] = []

  // Critical Drawdown Alert
  if (metrics.maxDrawdown > 20) {
    alerts.push({
      id: 'high-drawdown',
      level: 'critical',
      title: 'Drawdown Crítico',
      message: `El drawdown máximo de ${metrics.maxDrawdown.toFixed(2)}% excede el límite recomendado de 20%.`,
      metric: 'Max Drawdown',
      value: `${metrics.maxDrawdown.toFixed(2)}%`
    })
  } else if (metrics.maxDrawdown > 15) {
    alerts.push({
      id: 'moderate-drawdown',
      level: 'warning',
      title: 'Drawdown Elevado',
      message: `El drawdown máximo de ${metrics.maxDrawdown.toFixed(2)}% está por encima del 15%. Considera ajustar tu gestión de riesgo.`,
      metric: 'Max Drawdown',
      value: `${metrics.maxDrawdown.toFixed(2)}%`
    })
  }

  // Low Win Rate Alert
  if (metrics.winRate < 40) {
    alerts.push({
      id: 'low-winrate',
      level: 'warning',
      title: 'Win Rate Bajo',
      message: `Win rate de ${metrics.winRate.toFixed(2)}% es bajo. Revisa tu estrategia o condiciones de entrada.`,
      metric: 'Win Rate',
      value: `${metrics.winRate.toFixed(2)}%`
    })
  }

  // Profit Factor Alert
  if (metrics.profitFactor < 1.0) {
    alerts.push({
      id: 'negative-pf',
      level: 'critical',
      title: 'Profit Factor Negativo',
      message: 'La estrategia está perdiendo dinero. El profit factor debe ser mayor a 1.0.',
      metric: 'Profit Factor',
      value: metrics.profitFactor.toFixed(2)
    })
  } else if (metrics.profitFactor < 1.5) {
    alerts.push({
      id: 'low-pf',
      level: 'warning',
      title: 'Profit Factor Bajo',
      message: 'Profit factor aceptable pero bajo. Objetivo recomendado: > 1.5',
      metric: 'Profit Factor',
      value: metrics.profitFactor.toFixed(2)
    })
  } else if (metrics.profitFactor > 2.0) {
    alerts.push({
      id: 'excellent-pf',
      level: 'success',
      title: 'Excelente Profit Factor',
      message: 'Profit factor superior a 2.0. Estrategia muy rentable!',
      metric: 'Profit Factor',
      value: metrics.profitFactor.toFixed(2)
    })
  }

  // Sharpe Ratio Alert
  if (metrics.sharpeRatio < 0) {
    alerts.push({
      id: 'negative-sharpe',
      level: 'critical',
      title: 'Sharpe Ratio Negativo',
      message: 'Rentabilidad ajustada al riesgo es negativa. La estrategia no compensa el riesgo.',
      metric: 'Sharpe Ratio',
      value: metrics.sharpeRatio.toFixed(2)
    })
  } else if (metrics.sharpeRatio < 1.0) {
    alerts.push({
      id: 'low-sharpe',
      level: 'warning',
      title: 'Sharpe Ratio Bajo',
      message: 'Sharpe ratio por debajo de 1.0. Busca estrategias con mejor rentabilidad ajustada al riesgo.',
      metric: 'Sharpe Ratio',
      value: metrics.sharpeRatio.toFixed(2)
    })
  } else if (metrics.sharpeRatio > 2.0) {
    alerts.push({
      id: 'excellent-sharpe',
      level: 'success',
      title: 'Excelente Sharpe Ratio',
      message: 'Sharpe ratio superior a 2.0. Rentabilidad ajustada al riesgo excepcional!',
      metric: 'Sharpe Ratio',
      value: metrics.sharpeRatio.toFixed(2)
    })
  }

  // Low Sample Size Alert
  if (metrics.totalTrades < 30) {
    alerts.push({
      id: 'low-sample',
      level: 'warning',
      title: 'Muestra Pequeña',
      message: `Solo ${metrics.totalTrades} trades. Se recomienda mínimo 30 para validación estadística.`,
      metric: 'Total Trades',
      value: metrics.totalTrades.toString()
    })
  }

  // Consecutive Losses Alert
  if (metrics.consecutiveLosses && metrics.consecutiveLosses >= 5) {
    alerts.push({
      id: 'consecutive-losses',
      level: 'critical',
      title: 'Racha de Pérdidas',
      message: `Racha de ${metrics.consecutiveLosses} pérdidas consecutivas detectada. Alto riesgo psicológico.`,
      metric: 'Consecutive Losses',
      value: metrics.consecutiveLosses.toString()
    })
  } else if (metrics.consecutiveLosses && metrics.consecutiveLosses >= 3) {
    alerts.push({
      id: 'moderate-losses',
      level: 'warning',
      title: 'Múltiples Pérdidas',
      message: `${metrics.consecutiveLosses} pérdidas consecutivas. Monitorea de cerca.`,
      metric: 'Consecutive Losses',
      value: metrics.consecutiveLosses.toString()
    })
  }

  // Risk/Reward Ratio
  if (metrics.riskRewardRatio && metrics.riskRewardRatio < 1.0) {
    alerts.push({
      id: 'poor-rr',
      level: 'warning',
      title: 'Risk/Reward Desfavorable',
      message: 'Ratio riesgo/recompensa menor a 1:1. Las pérdidas promedian más que las ganancias.',
      metric: 'Risk/Reward',
      value: `1:${metrics.riskRewardRatio.toFixed(2)}`
    })
  } else if (metrics.riskRewardRatio && metrics.riskRewardRatio > 2.0) {
    alerts.push({
      id: 'excellent-rr',
      level: 'success',
      title: 'Excelente Risk/Reward',
      message: 'Ratio riesgo/recompensa superior a 2:1. Buena gestión de riesgo!',
      metric: 'Risk/Reward',
      value: `1:${metrics.riskRewardRatio.toFixed(2)}`
    })
  }

  // Positive Results Alert
  if (alerts.length === 0 || alerts.every(a => a.level === 'success')) {
    alerts.push({
      id: 'healthy-strategy',
      level: 'success',
      title: 'Estrategia Saludable',
      message: 'Todas las métricas de riesgo están dentro de rangos aceptables.',
    })
  }

  const getAlertIcon = (level: RiskAlert['level']) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'info':
        return <Activity className="w-5 h-5 text-blue-400" />
    }
  }

  const getAlertStyle = (level: RiskAlert['level']) => {
    switch (level) {
      case 'critical':
        return 'bg-red-900/20 border-red-500/30'
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-500/30'
      case 'success':
        return 'bg-green-900/20 border-green-500/30'
      case 'info':
        return 'bg-blue-900/20 border-blue-500/30'
    }
  }

  const getAlertTextColor = (level: RiskAlert['level']) => {
    switch (level) {
      case 'critical':
        return 'text-red-300'
      case 'warning':
        return 'text-yellow-300'
      case 'success':
        return 'text-green-300'
      case 'info':
        return 'text-blue-300'
    }
  }

  // Sort alerts by severity
  const sortedAlerts = [...alerts].sort((a, b) => {
    const order = { critical: 0, warning: 1, success: 2, info: 3 }
    return order[a.level] - order[b.level]
  })

  return (
    <Card className="border-orange-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          Risk Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border ${getAlertStyle(alert.level)}`}
          >
            <div className="flex items-start gap-3">
              {getAlertIcon(alert.level)}
              <div className="flex-1">
                <h4 className={`font-semibold mb-1 ${getAlertTextColor(alert.level)}`}>
                  {alert.title}
                </h4>
                <p className="text-sm text-gray-400">{alert.message}</p>
                {alert.metric && alert.value && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">{alert.metric}:</span>
                    <span className="text-sm font-mono font-semibold text-white">
                      {alert.value}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
