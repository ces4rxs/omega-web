"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

interface RiskTooltipProps {
  title: string
  description: string
  example?: string
  recommended?: string
}

export function RiskTooltip({ title, description, example, recommended }: RiskTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <HelpCircle className="w-3 h-3 text-gray-400" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs bg-gray-800 border-gray-700 p-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-white text-sm">{title}</h4>
            <p className="text-xs text-gray-300 leading-relaxed">{description}</p>
            {example && (
              <div className="mt-2 p-2 bg-gray-900/50 rounded border border-gray-700">
                <p className="text-xs text-gray-400">
                  <span className="text-blue-400 font-mono">Ejemplo:</span> {example}
                </p>
              </div>
            )}
            {recommended && (
              <div className="mt-2 p-2 bg-green-900/20 rounded border border-green-700/30">
                <p className="text-xs text-green-300">
                  <span className="font-semibold">💡 Recomendado:</span> {recommended}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Tooltips predefinidos para cada control de riesgo
export const RISK_TOOLTIPS = {
  commission: {
    title: "Comisión por Trade",
    description: "Costo fijo que cobra tu broker por cada operación (entrada/salida). Se deduce del P&L final.",
    example: "Si pagas $0.50 por trade y haces 100 operaciones, pagarás $50 en comisiones totales.",
    recommended: "$0.50 - $2.00 para brokers estándar. $0 para comisión cero."
  },
  slippage: {
    title: "Slippage",
    description: "Diferencia entre el precio esperado y el precio real de ejecución. Simula condiciones de mercado reales donde no siempre obtienes el precio exacto.",
    example: "Con 0.05% de slippage, una compra a $100 se ejecutaría a $100.05.",
    recommended: "0.05% - 0.10% para acciones líquidas. 0.20% - 0.50% para activos menos líquidos."
  },
  stopLoss: {
    title: "Stop Loss",
    description: "Cierra automáticamente la posición cuando la pérdida alcanza este porcentaje. Protege tu capital de pérdidas grandes.",
    example: "Con Stop Loss de 2%, una compra a $100 se cerrará si cae a $98.",
    recommended: "2% - 5% para swing trading. 1% - 2% para day trading."
  },
  takeProfit: {
    title: "Take Profit",
    description: "Cierra automáticamente la posición cuando la ganancia alcanza este porcentaje. Asegura beneficios.",
    example: "Con Take Profit de 5%, una compra a $100 se cerrará si sube a $105.",
    recommended: "Risk/Reward ratio 1:2 o mejor. Si SL=2%, TP debería ser ≥4%."
  },
  trailingStop: {
    title: "Trailing Stop",
    description: "Stop Loss dinámico que se mueve con el precio a favor. Protege ganancias mientras deja correr trades ganadores.",
    example: "Con Trailing Stop de 1.5%, si el precio sube de $100 a $110, el stop se ajusta a $108.35.",
    recommended: "1.0% - 2.0% para capturar tendencias sin salir prematuramente."
  },
  dailyLossLimit: {
    title: "Daily Loss Limit",
    description: "Detiene el trading si las pérdidas diarias superan este porcentaje. Previene pérdidas emocionales en rachas malas.",
    example: "Con límite de 5% y capital de $10,000, se detendrá tras perder $500 en un día.",
    recommended: "3% - 5% del capital total. Regla profesional: nunca arriesgar más del 5% diario."
  },
  maxDrawdownLimit: {
    title: "Max Drawdown Limit",
    description: "Detiene el trading si el drawdown (caída desde el pico) supera este límite. Protege de estrategias que pierden consistentemente.",
    example: "Con límite de 15%, si el equity cae de $12,000 a $10,200, se detendrá (15% de caída).",
    recommended: "15% - 20% para estrategias conservadoras. 25% - 30% para agresivas."
  },
  riskPerTrade: {
    title: "Risk Per Trade",
    description: "Porcentaje máximo de capital a arriesgar en cada trade. Fundamental para gestión de capital profesional.",
    example: "Con 2% de riesgo y $10,000 de capital, arriesgas $200 por trade.",
    recommended: "1% - 2% para traders conservadores. Nunca exceder 5% (regla de oro)."
  },
  volatilitySizing: {
    title: "Volatility-Based Sizing (ATR)",
    description: "Ajusta el tamaño de posición según la volatilidad del activo (ATR). Más volátil = posición más pequeña.",
    example: "Un activo con ATR alto recibe menos acciones que uno con ATR bajo, balanceando el riesgo.",
    recommended: "ATR Period: 14 días. Multiplier: 2.0 para posiciones conservadoras."
  },
  positionSize: {
    title: "Position Sizing",
    description: "Porcentaje del capital disponible a usar por trade. Controla la exposición total al mercado.",
    example: "Con 100% de position size, usas todo el capital disponible. Con 50%, solo la mitad.",
    recommended: "100% para una posición única. 25% - 33% si quieres diversificar en múltiples posiciones."
  }
}
