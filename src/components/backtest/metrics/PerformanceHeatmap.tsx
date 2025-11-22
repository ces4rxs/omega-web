/**
 * Heatmap de performance por hora del día
 * Muestra ganancias/pérdidas por cada hora (0-23)
 */

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import type { HourlyPerformance } from '@/types/backtest'

interface PerformanceHeatmapProps {
  hourlyPerformance: HourlyPerformance
  bestHour: string
  worstHour: string
  completedTradesCount: number
}

export const PerformanceHeatmap = React.memo(function PerformanceHeatmap({
  hourlyPerformance,
  bestHour,
  worstHour,
  completedTradesCount
}: PerformanceHeatmapProps) {
  if (completedTradesCount === 0) return null

  // Calculate min/max for color scaling
  const { minProfit, maxProfit } = useMemo(() => {
    const profits = Object.values(hourlyPerformance).map(h => h.profit)
    return {
      minProfit: Math.min(...profits),
      maxProfit: Math.max(...profits)
    }
  }, [hourlyPerformance])

  const range = maxProfit - minProfit || 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-purple-400" />
            Performance Heatmap por Hora
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Mejor hora: {parseInt(bestHour)}:00 • Peor hora: {parseInt(worstHour)}:00
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-1">
        {Array.from({ length: 24 }, (_, hour) => {
          const data = hourlyPerformance[hour]
          const intensity = Math.abs((data.profit - minProfit) / range)

          // Determine color based on profit
          let bgColor = 'bg-slate-800/50'
          let textColor = 'text-gray-400'
          let borderColor = 'border-slate-700'

          if (data.trades > 0) {
            if (data.profit > 0) {
              // Verde para ganancias
              if (intensity > 0.7) {
                bgColor = 'bg-green-500/40'
                textColor = 'text-green-200'
                borderColor = 'border-green-400/50'
              } else if (intensity > 0.4) {
                bgColor = 'bg-green-600/30'
                textColor = 'text-green-300'
                borderColor = 'border-green-500/40'
              } else {
                bgColor = 'bg-green-700/20'
                textColor = 'text-green-400'
                borderColor = 'border-green-600/30'
              }
            } else if (data.profit < 0) {
              // Rojo para pérdidas
              if (intensity > 0.7) {
                bgColor = 'bg-red-500/40'
                textColor = 'text-red-200'
                borderColor = 'border-red-400/50'
              } else if (intensity > 0.4) {
                bgColor = 'bg-red-600/30'
                textColor = 'text-red-300'
                borderColor = 'border-red-500/40'
              } else {
                bgColor = 'bg-red-700/20'
                textColor = 'text-red-400'
                borderColor = 'border-red-600/30'
              }
            }
          }

          return (
            <motion.div
              key={hour}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: hour * 0.02 }}
              className={`${bgColor} ${borderColor} border rounded-lg p-2 aspect-square flex flex-col items-center justify-center hover:scale-110 transition-transform cursor-pointer group relative`}
              title={`${hour}:00 - ${data.trades} trades - $${data.profit.toFixed(0)}`}
            >
              <div className={`text-[10px] font-bold ${textColor}`}>
                {hour}h
              </div>
              {data.trades > 0 && (
                <>
                  <div className="text-[8px] text-gray-400">
                    {data.trades}t
                  </div>
                  <div
                    className={`absolute inset-0 ${bgColor} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}
                  >
                    <div className="text-[10px] font-bold text-white">
                      ${data.profit > 0 ? '+' : ''}
                      {data.profit.toFixed(0)}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500/40 border border-green-400/50 rounded"></div>
          <span className="text-gray-400">Alta ganancia</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500/40 border border-red-400/50 rounded"></div>
          <span className="text-gray-400">Alta pérdida</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-800/50 border border-slate-700 rounded"></div>
          <span className="text-gray-400">Sin trades</span>
        </div>
      </div>
    </motion.div>
  )
})
