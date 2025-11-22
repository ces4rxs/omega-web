/**
 * Helper de atajos de teclado
 * Muestra información de los shortcuts disponibles
 */

import React from 'react'

export const KeyboardShortcutsHelp = React.memo(function KeyboardShortcutsHelp() {
  return (
    <div className="bg-gradient-to-r from-slate-800/30 via-blue-800/20 to-slate-800/30 rounded-lg p-3 border border-blue-500/10">
      <div className="text-xs text-gray-400 text-center">
        <span className="font-semibold text-blue-300">⌨️ Atajos de Teclado:</span>{' '}
        <span className="bg-slate-700/50 px-2 py-0.5 rounded mx-1">Espacio</span> Play/Pause •{' '}
        <span className="bg-slate-700/50 px-2 py-0.5 rounded mx-1">←</span>
        <span className="bg-slate-700/50 px-2 py-0.5 rounded mx-1">→</span> Navegar •{' '}
        <span className="bg-slate-700/50 px-2 py-0.5 rounded mx-1">R</span> Reiniciar •{' '}
        <span className="bg-slate-700/50 px-2 py-0.5 rounded mx-1">Home</span>
        <span className="bg-slate-700/50 px-2 py-0.5 rounded mx-1">End</span> Inicio/Fin
      </div>
    </div>
  )
})
