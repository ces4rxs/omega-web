"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Settings,
  Play,
  Lock,
  Sparkles,
  TrendingUp,
  Zap,
  CheckCircle,
  ArrowRight
} from "lucide-react"
import { useTier } from "@/hooks/use-tier"
import { useRouter } from "next/navigation"

interface OptimizationParameter {
  name: string
  currentValue: number
  min: number
  max: number
  step: number
}

interface OptimizationResult {
  parameters: Record<string, number>
  metrics: {
    sharpeRatio: number
    totalReturn: number
    maxDrawdown: number
    profitFactor: number
  }
  improvement: number // % improvement vs current
}

interface AIOptimizerProps {
  strategy: string
  symbol: string
  timeframe: string
  dateRange: {
    startDate: string
    endDate: string
  }
  currentParameters: OptimizationParameter[]
  onOptimized?: (params: Record<string, number>) => void
}

export function AIOptimizer({
  strategy,
  symbol,
  timeframe,
  dateRange,
  currentParameters,
  onOptimized
}: AIOptimizerProps) {
  const { canUseAI } = useTier()
  const router = useRouter()
  const [optimizing, setOptimizing] = useState(false)
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [targetMetric, setTargetMetric] = useState<'sharpeRatio' | 'totalReturn' | 'profitFactor'>('sharpeRatio')
  const [progress, setProgress] = useState(0)

  const startOptimization = async () => {
    setOptimizing(true)
    setResult(null)
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + Math.random() * 10
      })
    }, 500)

    try {
      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy,
          symbol,
          timeframe,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          parameters: currentParameters,
          targetMetric,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al optimizar estrategia')
      }

      const data = await response.json()
      setResult(data)
      setProgress(100)

      if (onOptimized) {
        onOptimized(data.parameters)
      }
    } catch (err) {
      console.error('Error optimizing:', err)
      alert('Error al optimizar. Por favor intenta de nuevo.')
    } finally {
      clearInterval(progressInterval)
      setOptimizing(false)
    }
  }

  if (!canUseAI) {
    return (
      <Card className="border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-cyan-900/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              AI Optimizer Bloqueado
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Encuentra automáticamente los mejores parámetros para tu estrategia.
              Powered by Optimizer + Auto-Tuner.
            </p>
            <Button
              onClick={() => router.push('/pricing')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade a Professional
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-500/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              AI Optimizer
              <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full">
                PRO
              </span>
            </CardTitle>
            <p className="text-sm text-gray-400">
              Optimización automática de parámetros
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Configuration */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-gray-400 mb-2 block">
              Métrica Objetivo
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'sharpeRatio', label: 'Sharpe Ratio' },
                { value: 'totalReturn', label: 'Retorno Total' },
                { value: 'profitFactor', label: 'Profit Factor' },
              ].map((metric) => (
                <button
                  key={metric.value}
                  onClick={() => setTargetMetric(metric.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    targetMetric === metric.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                  disabled={optimizing}
                >
                  {metric.label}
                </button>
              ))}
            </div>
          </div>

          {/* Parameters to optimize */}
          <div>
            <Label className="text-sm text-gray-400 mb-2 block">
              Parámetros a Optimizar ({currentParameters.length})
            </Label>
            <div className="bg-gray-800/30 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
              {currentParameters.map((param) => (
                <div
                  key={param.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-300 font-medium">{param.name}</span>
                  <span className="text-gray-500">
                    {param.currentValue} → [{param.min} - {param.max}]
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Start Optimization Button */}
          <Button
            onClick={startOptimization}
            disabled={optimizing}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {optimizing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Optimizando... {progress.toFixed(0)}%
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Iniciar Optimización
              </>
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {optimizing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Probando combinaciones...</span>
                <span className="text-blue-400 font-mono">{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-2 bg-gradient-to-r from-blue-600 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Success Header */}
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-400 mb-1">
                      Optimización Completada
                    </h4>
                    <p className="text-sm text-gray-300">
                      Mejora de <span className="font-bold text-green-400">+{result.improvement.toFixed(2)}%</span> vs parámetros actuales
                    </p>
                  </div>
                </div>
              </div>

              {/* Optimized Parameters */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                  Parámetros Optimizados
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(result.parameters).map(([name, value]) => {
                    const original = currentParameters.find((p) => p.name === name)
                    const hasChanged = original && original.currentValue !== value

                    return (
                      <div
                        key={name}
                        className={`bg-gray-800/50 rounded-lg p-3 border ${
                          hasChanged ? 'border-blue-500/50' : 'border-gray-700'
                        }`}
                      >
                        <div className="text-xs text-gray-500 mb-1">{name}</div>
                        <div className="flex items-baseline gap-2">
                          {hasChanged && (
                            <span className="text-sm text-gray-500 line-through">
                              {original.currentValue}
                            </span>
                          )}
                          <span className="text-lg font-bold text-white">
                            {value}
                          </span>
                          {hasChanged && (
                            <ArrowRight className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                  Métricas Proyectadas
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">Sharpe Ratio</span>
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      {result.metrics.sharpeRatio.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-400">Retorno Total</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-400">
                      {result.metrics.totalReturn.toFixed(2)}%
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-400">Profit Factor</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-400">
                      {result.metrics.profitFactor.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-gray-400">Max Drawdown</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-400">
                      {result.metrics.maxDrawdown.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <Button
                onClick={() => onOptimized?.(result.parameters)}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Aplicar Parámetros Optimizados
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
