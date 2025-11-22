/**
 * Grid de métricas en tiempo real
 * Trades, Win Rate, Max Drawdown, Racha actual
 */

import React from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Target,
  TrendingDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import type { StreakInfo, Trade } from '@/types/backtest'

interface RealtimeMetricsGridProps {
  completedTrades: Trade[]
  winRate: number
  maxDrawdown: number
  streak: StreakInfo
}

export const RealtimeMetricsGrid = React.memo(function RealtimeMetricsGrid({
  completedTrades,
  winRate,
  maxDrawdown,
  streak
}: RealtimeMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Trades Completados */}
      <motion.div
        key={completedTrades.length}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-lg p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-400">Trades</span>
        </div>
        <div className="text-3xl font-bold text-white">
          {completedTrades.length}
        </div>
      </motion.div>

      {/* Win Rate */}
      <motion.div
        key={winRate}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-green-400" />
          <span className="text-sm text-gray-400">Win Rate</span>
        </div>
        <div className="text-3xl font-bold text-green-400">
          {winRate.toFixed(1)}%
        </div>
      </motion.div>

      {/* Max Drawdown */}
      <motion.div
        key={maxDrawdown}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-lg p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-4 h-4 text-orange-400" />
          <span className="text-sm text-gray-400">Max DD</span>
        </div>
        <div className="text-3xl font-bold text-orange-400">
          -{maxDrawdown.toFixed(2)}%
        </div>
      </motion.div>

      {/* Racha Actual */}
      <motion.div
        key={streak.count}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className={`bg-gradient-to-br ${
          streak.type === 'win'
            ? 'from-purple-900/30 to-pink-900/30 border-purple-500/30'
            : 'from-gray-900/30 to-slate-900/30 border-gray-500/30'
        } border rounded-lg p-4`}
      >
        <div className="flex items-center gap-2 mb-2">
          {streak.type === 'win' ? (
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm text-gray-400">Racha</span>
        </div>
        <div
          className={`text-3xl font-bold ${
            streak.type === 'win' ? 'text-purple-400' : 'text-gray-400'
          }`}
        >
          {streak.count > 0
            ? `${streak.count} ${streak.type === 'win' ? 'W' : 'L'}`
            : '-'}
        </div>
      </motion.div>
    </div>
  )
})
