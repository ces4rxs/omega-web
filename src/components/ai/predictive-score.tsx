"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CrystalBall,
  Lock,
  Sparkles,
  TrendingUp,
  Target,
  AlertCircle,
  Crown
} from "lucide-react"
import { useTier } from "@/hooks/use-tier"
import { useRouter } from "next/navigation"

interface PredictiveScoreResponse {
  predictions: {
    sharpeRatio: number
    maxDrawdown: number
    cagr: number
    winRate: number
  }
  confidence: number // 0-100
  recommendation: 'HIGHLY_RECOMMENDED' | 'RECOMMENDED' | 'NEUTRAL' | 'NOT_RECOMMENDED'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  insights: string[]
}

interface PredictiveScoreProps {
  strategy: string
  symbol: string
  timeframe: string
  parameters: Record<string, any>
}

// Icono personalizado de crystal ball (bola de cristal)
const CrystalBall = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="11" r="7" />
    <path d="M12 18v3" />
    <path d="M8 21h8" />
    <circle cx="12" cy="11" r="3" opacity="0.5" />
  </svg>
)

export function PredictiveScore({
  strategy,
  symbol,
  timeframe,
  parameters
}: PredictiveScoreProps) {
  const { canUsePredictiveAI, isEnterprise } = useTier()
  const router = useRouter()
  const [prediction, setPrediction] = useState<PredictiveScoreResponse | null>(null)
  const [predicting, setPredicting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generatePrediction = async () => {
    setPredicting(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy,
          symbol,
          timeframe,
          parameters,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al generar predicción')
      }

      const data = await response.json()
      setPrediction(data)
    } catch (err) {
      console.error('Error predicting:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setPredicting(false)
    }
  }

  if (!canUsePredictiveAI) {
    return (
      <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center mb-4 relative">
              <Lock className="w-8 h-8 text-purple-400" />
              <Crown className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Predictive Score Bloqueado
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Predice el desempeño de tu estrategia ANTES de ejecutar el backtest.
              Usa Machine Learning (Predictor v4) para ahorrar tiempo.
            </p>
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-300">
                ✨ Exclusivo de <span className="font-bold">ENTERPRISE</span>
              </p>
            </div>
            <Button
              onClick={() => router.push('/pricing')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade a Enterprise $159.99/mes
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'HIGHLY_RECOMMENDED':
        return 'text-green-400'
      case 'RECOMMENDED':
        return 'text-blue-400'
      case 'NEUTRAL':
        return 'text-yellow-400'
      case 'NOT_RECOMMENDED':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getRecommendationLabel = (rec: string) => {
    switch (rec) {
      case 'HIGHLY_RECOMMENDED':
        return 'Altamente Recomendado'
      case 'RECOMMENDED':
        return 'Recomendado'
      case 'NEUTRAL':
        return 'Neutral'
      case 'NOT_RECOMMENDED':
        return 'No Recomendado'
      default:
        return rec
    }
  }

  return (
    <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/10 to-pink-900/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <CrystalBall className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Predictive Score ML
                <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  ENTERPRISE
                </span>
              </CardTitle>
              <p className="text-sm text-gray-400">
                Predicción usando Machine Learning v4
              </p>
            </div>
          </div>

          {prediction && (
            <div className="text-right">
              <div className={`text-2xl font-bold ${getRecommendationColor(prediction.recommendation)}`}>
                {prediction.confidence}%
              </div>
              <div className="text-xs text-gray-500">Confianza</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Predict Button */}
        {!prediction && !predicting && (
          <Button
            onClick={generatePrediction}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            <CrystalBall className="w-5 h-5 mr-2" />
            Generar Predicción (Sin ejecutar backtest)
          </Button>
        )}

        {/* Loading */}
        {predicting && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <CrystalBall className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-gray-400 mt-4">Analizando con ML...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-400">Error en predicción</p>
                <p className="text-sm text-gray-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Prediction Results */}
        {prediction && !predicting && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Recommendation Banner */}
            <div className={`border rounded-lg p-4 ${
              prediction.recommendation === 'HIGHLY_RECOMMENDED'
                ? 'bg-green-900/20 border-green-500/30'
                : prediction.recommendation === 'RECOMMENDED'
                ? 'bg-blue-900/20 border-blue-500/30'
                : prediction.recommendation === 'NEUTRAL'
                ? 'bg-yellow-900/20 border-yellow-500/30'
                : 'bg-red-900/20 border-red-500/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-bold ${getRecommendationColor(prediction.recommendation)}`}>
                  {getRecommendationLabel(prediction.recommendation)}
                </h4>
                <span className={`text-sm ${getRecommendationColor(prediction.recommendation)}`}>
                  Riesgo: {prediction.riskLevel}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    prediction.confidence >= 80
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : prediction.confidence >= 60
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  }`}
                  style={{ width: `${prediction.confidence}%` }}
                />
              </div>
            </div>

            {/* Predicted Metrics */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                Métricas Predichas
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-400">Sharpe Ratio</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {prediction.predictions.sharpeRatio.toFixed(2)}
                  </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-400">CAGR</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {prediction.predictions.cagr.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-gray-400">Max Drawdown</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {prediction.predictions.maxDrawdown.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-400">Win Rate</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {prediction.predictions.winRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                Insights del Predictor ML
              </h4>
              <ul className="space-y-2">
                {prediction.insights.map((insight, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-2 text-sm text-gray-300 bg-gray-800/30 p-3 rounded-lg"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-300">
                    Esta predicción se basa en patrones históricos y análisis ML.
                    Los resultados reales pueden variar. Ejecuta el backtest para confirmar.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={generatePrediction}
                variant="outline"
                className="flex-1"
              >
                Regenerar Predicción
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  // TODO: Navigate to backtest execution
                }}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Ejecutar Backtest Real
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
