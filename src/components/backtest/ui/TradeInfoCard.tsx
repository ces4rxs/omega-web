/**
 * Card informativa del último trade completado
 * Muestra detalles del trade más reciente
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import type { Trade } from '@/types/backtest'

interface TradeInfoCardProps {
  lastTrade: Trade | null
}

export const TradeInfoCard = React.memo(function TradeInfoCard({
  lastTrade
}: TradeInfoCardProps) {
  if (!lastTrade) return null

  const isWin = lastTrade.pnl >= 0

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={lastTrade.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`border-2 rounded-lg p-4 ${
          isWin
            ? 'bg-green-900/20 border-green-500/50'
            : 'bg-red-900/20 border-red-500/50'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            {isWin ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Último Trade: ¡Ganancia!
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-400" />
                Último Trade: Pérdida
              </>
            )}
          </h4>
          <span
            className={`text-lg font-bold ${
              isWin ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {isWin ? '+' : ''}${lastTrade.pnl.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-gray-400">Entrada:</span>{' '}
            <span className="text-white font-semibold">
              ${lastTrade.entryPrice.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Salida:</span>{' '}
            <span className="text-white font-semibold">
              ${lastTrade.exitPrice.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-400">P&L:</span>{' '}
            <span
              className={`font-semibold ${
                isWin ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {lastTrade.pnlPercent >= 0 ? '+' : ''}
              {lastTrade.pnlPercent.toFixed(2)}%
            </span>
          </div>
          <div>
            <span className="text-gray-400">Duración:</span>{' '}
            <span className="text-white font-semibold">
              {lastTrade.duration} días
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
})
