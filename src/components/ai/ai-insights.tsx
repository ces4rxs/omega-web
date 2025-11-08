"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Sparkles,
  ArrowRight
} from "lucide-react"
import { useTier } from "@/hooks/use-tier"
import { useRouter } from "next/navigation"

interface AIInsight {
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  confidence: number // 0-100
}

interface AIInsightsResponse {
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F'
  score: number // 0-100
  insights: AIInsight[]
  recommendations: string[]
  hybridAdvice: string
  neuralAdvice: string
}

interface AIInsightsProps {
  backtestId: string
  strategyName: string
  performanceMetrics: {
    sharpeRatio: number
    maxDrawdown: number
    winRate: number
    totalTrades: number
  }
}

export function AIInsights({ backtestId, strategyName, performanceMetrics }: AIInsightsProps) {
  const { canUseAI, currentTier } = useTier()
  const router = useRouter()
  const [insights, setInsights] = useState<AIInsightsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generar insights automáticamente cuando cambia el backtest
  useEffect(() => {
    if (canUseAI && backtestId) {
      generateInsights()
    }
  }, [backtestId, canUseAI])

  const generateInsights = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backtestId,
          strategyName,
          metrics: performanceMetrics,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al generar insights de IA')
      }

      const data = await response.json()
      setInsights(data)
    } catch (err) {
      console.error('Error generating AI insights:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // Si no tiene acceso, mostrar upgrade prompt
  if (!canUseAI) {
    return (
      <Card className="border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              AI Insights Bloqueado
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Obtén recomendaciones inteligentes generadas por nuestros 6 módulos de IA.
              Mejora tu estrategia con análisis avanzado.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push('/pricing')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade a Professional $89.99/mes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Insights
                <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full">
                  PRO
                </span>
              </CardTitle>
              <p className="text-sm text-gray-400">
                Análisis generado por Hybrid Advisor + Neural Advisor
              </p>
            </div>
          </div>

          {insights && (
            <div className="text-center">
              <div className={`text-4xl font-bold ${
                insights.score >= 80 ? 'text-green-400' :
                insights.score >= 60 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {insights.grade}
              </div>
              <div className="text-xs text-gray-500">
                Score: {insights.score}/100
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Analizando estrategia con IA...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-400">Error al generar insights</p>
                <p className="text-sm text-gray-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {insights && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Key Insights */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                Insights Principales
              </h4>
              <div className="space-y-2">
                {insights.insights.map((insight, idx) => {
                  const Icon =
                    insight.type === 'success' ? CheckCircle :
                    insight.type === 'warning' ? AlertTriangle :
                    insight.type === 'error' ? XCircle :
                    TrendingUp

                  const colorClass =
                    insight.type === 'success' ? 'text-green-400 bg-green-900/20 border-green-500/30' :
                    insight.type === 'warning' ? 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30' :
                    insight.type === 'error' ? 'text-red-400 bg-red-900/20 border-red-500/30' :
                    'text-blue-400 bg-blue-900/20 border-blue-500/30'

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`border rounded-lg p-3 ${colorClass}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="font-semibold text-sm text-white mb-1">
                            {insight.title}
                          </h5>
                          <p className="text-sm text-gray-300">
                            {insight.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  insight.confidence >= 80 ? 'bg-green-500' :
                                  insight.confidence >= 60 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${insight.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">
                              {insight.confidence}% confianza
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                Recomendaciones
              </h4>
              <ul className="space-y-2">
                {insights.recommendations.map((rec, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="flex items-start gap-2 text-sm text-gray-300"
                  >
                    <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* AI Advisors */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Hybrid Advisor */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <h5 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Hybrid Advisor
                </h5>
                <p className="text-sm text-gray-300">
                  {insights.hybridAdvice}
                </p>
              </div>

              {/* Neural Advisor */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <h5 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Neural Advisor
                </h5>
                <p className="text-sm text-gray-300">
                  {insights.neuralAdvice}
                </p>
              </div>
            </div>

            {/* Regenerate Button */}
            <Button
              onClick={generateInsights}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              <Brain className="w-4 h-4 mr-2" />
              Regenerar Insights
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
