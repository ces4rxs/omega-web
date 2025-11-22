/**
 * Panel de métricas avanzadas
 * Sharpe Ratio, Sortino, Profit Factor, Expectancy, Calmar, Volatilidad
 */

import React from 'react'
import { motion } from 'framer-motion'
import {
  Gauge,
  Shield,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3
} from 'lucide-react'
import type { AdvancedMetrics } from '@/types/backtest'

interface AdvancedMetricsPanelProps {
  metrics: AdvancedMetrics | null
}

export const AdvancedMetricsPanel = React.memo(function AdvancedMetricsPanel({
  metrics
}: AdvancedMetricsPanelProps) {
  if (!metrics) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
    >
      {/* Sharpe Ratio */}
      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Gauge className="w-3 h-3 text-blue-400" />
          <span className="text-xs text-gray-400">Sharpe Ratio</span>
        </div>
        <div
          className={`text-2xl font-bold ${
            metrics.sharpe > 1
              ? 'text-green-400'
              : metrics.sharpe > 0
              ? 'text-yellow-400'
              : 'text-red-400'
          }`}
        >
          {metrics.sharpe.toFixed(2)}
        </div>
      </div>

      {/* Sortino Ratio */}
      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-3 h-3 text-purple-400" />
          <span className="text-xs text-gray-400">Sortino</span>
        </div>
        <div
          className={`text-2xl font-bold ${
            metrics.sortino > 1
              ? 'text-green-400'
              : metrics.sortino > 0
              ? 'text-yellow-400'
              : 'text-red-400'
          }`}
        >
          {metrics.sortino.toFixed(2)}
        </div>
      </div>

      {/* Profit Factor */}
      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-3 h-3 text-green-400" />
          <span className="text-xs text-gray-400">Profit Factor</span>
        </div>
        <div
          className={`text-2xl font-bold ${
            metrics.profitFactor === Infinity
              ? 'text-green-400'
              : metrics.profitFactor > 2
              ? 'text-green-400'
              : metrics.profitFactor > 1
              ? 'text-yellow-400'
              : 'text-red-400'
          }`}
        >
          {metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
        </div>
      </div>

      {/* Expectancy */}
      <div className="bg-gradient-to-br from-orange-900/30 to-yellow-900/30 border border-orange-500/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-3 h-3 text-orange-400" />
          <span className="text-xs text-gray-400">Expectancy</span>
        </div>
        <div
          className={`text-2xl font-bold ${
            metrics.expectancy > 0 ? 'text-green-400' : 'text-red-400'
          }`}
        >
          ${metrics.expectancy.toFixed(0)}
        </div>
      </div>

      {/* Calmar Ratio */}
      <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span className="text-xs text-gray-400">Calmar</span>
        </div>
        <div
          className={`text-2xl font-bold ${
            metrics.calmar > 2
              ? 'text-green-400'
              : metrics.calmar > 1
              ? 'text-yellow-400'
              : 'text-red-400'
          }`}
        >
          {metrics.calmar.toFixed(2)}
        </div>
      </div>

      {/* Volatilidad */}
      <div className="bg-gradient-to-br from-pink-900/30 to-rose-900/30 border border-pink-500/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-3 h-3 text-pink-400" />
          <span className="text-xs text-gray-400">Volatilidad</span>
        </div>
        <div className="text-2xl font-bold text-pink-400">
          {metrics.stdDev.toFixed(2)}%
        </div>
      </div>
    </motion.div>
  )
})
