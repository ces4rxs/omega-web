"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Shield,
  AlertTriangle,
  Lock,
  Sparkles,
  TrendingDown,
  Activity,
  Zap
} from "lucide-react"
import { useTier } from "@/hooks/use-tier"
import { useRouter } from "next/navigation"

type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

interface QuantumRiskResponse {
  riskIndex: number // 0-100
  riskLevel: RiskLevel
  factors: {
    volatility: number
    tailRisk: number
    liquidityStress: number
    overfitPenalty: number
  }
  recommendations: string[]
  quantumMetrics: {
    entropyScore: number
    coherenceIndex: number
    stabilityRating: number
  }
}

interface QuantumRiskProps {
  backtestId: string
  performanceMetrics: {
    sharpeRatio: number
    maxDrawdown: number
    volatility?: number
    totalTrades: number
  }
}

export function QuantumRisk({ backtestId, performanceMetrics }: QuantumRiskProps) {
  const { canUseAI, currentTier } = useTier()
  const router = useRouter()
  const [riskData, setRiskData] = useState<QuantumRiskResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (canUseAI && backtestId) {
      analyzeRisk()
    }
  }, [backtestId, canUseAI])

  const analyzeRisk = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/quantum-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: backtestId,
          metrics: {
            sharpe: performanceMetrics.sharpeRatio,
            mdd: performanceMetrics.maxDrawdown,
            cagr: 0, // TODO: Pass CAGR from parent
            tradesCount: performanceMetrics.totalTrades,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Error al analizar riesgo cuántico')
      }

      const result = await response.json()

      // Transform backend response to frontend format
      if (result.ok && result.riskAnalysis) {
        const analysis = result.riskAnalysis

        const transformedData: QuantumRiskResponse = {
          riskIndex: analysis.riskIndex || 50,
          riskLevel: analysis.tier || 'MODERATE',
          factors: {
            volatility: analysis.factors?.volatility || 0.5,
            tailRisk: analysis.factors?.tailRisk || 0.5,
            liquidityStress: analysis.factors?.liquidityStress || 0.5,
            overfitPenalty: analysis.factors?.overfitPenalty || 0.5,
          },
          recommendations: analysis.recommendations || [],
          quantumMetrics: {
            entropyScore: analysis.quantumMetrics?.entropyScore || 0.5,
            coherenceIndex: analysis.quantumMetrics?.coherenceIndex || 0.5,
            stabilityRating: analysis.quantumMetrics?.stabilityRating || 0.5,
          },
        }

        setRiskData(transformedData)
      }
    } catch (err) {
      console.error('Error analyzing quantum risk:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (!canUseAI) {
    return (
      <Card className="border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-orange-600/20 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Quantum Risk Bloqueado
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Análisis avanzado de riesgo usando Quantum Risk v13.
              Identifica factores de riesgo ocultos antes de que se conviertan en pérdidas.
            </p>
            <Button
              onClick={() => router.push('/pricing')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade a Professional
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'LOW':
        return 'text-green-400'
      case 'MODERATE':
        return 'text-yellow-400'
      case 'HIGH':
        return 'text-orange-400'
      case 'CRITICAL':
        return 'text-red-400'
    }
  }

  const getRiskBgColor = (level: RiskLevel) => {
    switch (level) {
      case 'LOW':
        return 'from-green-600 to-emerald-600'
      case 'MODERATE':
        return 'from-yellow-600 to-orange-600'
      case 'HIGH':
        return 'from-orange-600 to-red-600'
      case 'CRITICAL':
        return 'from-red-600 to-rose-600'
    }
  }

  return (
    <Card className="border-orange-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Quantum Risk Analysis
                <span className="text-xs bg-orange-600/20 text-orange-400 px-2 py-0.5 rounded-full">
                  PRO
                </span>
              </CardTitle>
              <p className="text-sm text-gray-400">
                Análisis cuántico de factores de riesgo v13
              </p>
            </div>
          </div>

          {riskData && (
            <div className="text-right">
              <div className={`text-2xl font-bold ${getRiskColor(riskData.riskLevel)}`}>
                {riskData.riskLevel}
              </div>
              <div className="text-xs text-gray-500">
                Índice: {riskData.riskIndex}/100
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Analizando riesgo cuántico...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {riskData && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Risk Gauge */}
            <div className="relative">
              <div className="h-32 rounded-2xl bg-gray-800/50 overflow-hidden relative">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-yellow-600/20 via-orange-600/20 to-red-600/20" />

                {/* Risk indicator */}
                <motion.div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg shadow-white/50"
                  initial={{ left: '0%' }}
                  animate={{ left: `${riskData.riskIndex}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />

                {/* Value display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      className={`text-6xl font-bold ${getRiskColor(riskData.riskLevel)}`}
                    >
                      {riskData.riskIndex}
                    </motion.div>
                    <div className="text-sm text-gray-400 mt-1">Índice de Riesgo</div>
                  </div>
                </div>
              </div>

              {/* Scale markers */}
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0 (Bajo)</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100 (Crítico)</span>
              </div>
            </div>

            {/* Risk Factors */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                Factores de Riesgo
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(riskData.factors).map(([factor, value], idx) => {
                  const factorNames: Record<string, { name: string; icon: any }> = {
                    volatility: { name: 'Volatilidad', icon: Activity },
                    tailRisk: { name: 'Riesgo de Cola', icon: TrendingDown },
                    liquidityStress: { name: 'Estrés de Liquidez', icon: AlertTriangle },
                    overfitPenalty: { name: 'Penalización Overfit', icon: Zap },
                  }

                  const info = factorNames[factor]
                  const Icon = info.icon

                  return (
                    <motion.div
                      key={factor}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-gray-800/30 rounded-lg p-3 border border-gray-700"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">
                          {info.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${
                              value < 30 ? 'from-green-500 to-green-600' :
                              value < 60 ? 'from-yellow-500 to-yellow-600' :
                              'from-red-500 to-red-600'
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono font-semibold text-white w-10 text-right">
                          {value}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Quantum Metrics */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                Métricas Cuánticas
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {riskData.quantumMetrics.entropyScore.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Entropía</div>
                </div>
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {riskData.quantumMetrics.coherenceIndex.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Coherencia</div>
                </div>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {riskData.quantumMetrics.stabilityRating.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Estabilidad</div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                Recomendaciones de Mitigación
              </h4>
              <ul className="space-y-2">
                {riskData.recommendations.map((rec, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="flex items-start gap-2 text-sm text-gray-300 bg-gray-800/30 p-3 rounded-lg"
                  >
                    <Shield className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Regenerate */}
            <Button
              onClick={analyzeRisk}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              <Shield className="w-4 h-4 mr-2" />
              Reanalizar Riesgo
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
