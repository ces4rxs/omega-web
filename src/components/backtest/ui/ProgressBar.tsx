/**
 * Barra de progreso animada para el replay
 * Muestra el progreso del backtest con animación
 */

import React from 'react'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  currentStep: number
  maxSteps: number
  progress: number
}

export const ProgressBar = React.memo(function ProgressBar({
  currentStep,
  maxSteps,
  progress
}: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-400">
        <span>
          Paso {currentStep + 1} de {maxSteps}
        </span>
        <span>{progress.toFixed(1)}%</span>
      </div>
      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-cyan-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>
    </div>
  )
})
