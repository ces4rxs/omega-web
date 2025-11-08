"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Target, Activity, Plus, X } from "lucide-react"
import type { BacktestResult } from "@/lib/types"

interface StrategyComparisonProps {
  results: BacktestResult[]
  onRemove?: (index: number) => void
}

export function StrategyComparison({ results, onRemove }: StrategyComparisonProps) {
  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Plus className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Comparación de Estrategias
              </h3>
              <p className="text-gray-400">
                Ejecuta múltiples backtests para comparar estrategias lado a lado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Comparación de Estrategias ({results.length})
        </h2>
      </div>

      {/* Tabla comparativa */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas Comparativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                    Métrica
                  </th>
                  {results.map((result, idx) => (
                    <th key={idx} className="text-right py-3 px-4 text-sm font-medium text-white">
                      <div className="flex items-center justify-end gap-2">
                        <span>Estrategia {idx + 1}</span>
                        {onRemove && (
                          <button
                            onClick={() => onRemove(idx)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Total Return */}
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4 text-sm text-gray-300">Retorno Total</td>
                  {results.map((result, idx) => {
                    const value = result.backtest.performance.totalReturn
                    const best = Math.max(...results.map(r => r.backtest.performance.totalReturn))
                    const isBest = value === best
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 text-sm text-right font-mono ${
                          isBest ? 'text-green-400 font-bold' : 'text-white'
                        }`}
                      >
                        {(value * 100).toFixed(2)}%
                      </td>
                    )
                  })}
                </tr>

                {/* CAGR */}
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4 text-sm text-gray-300">CAGR</td>
                  {results.map((result, idx) => {
                    const value = result.backtest.performance.cagr
                    const best = Math.max(...results.map(r => r.backtest.performance.cagr))
                    const isBest = value === best
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 text-sm text-right font-mono ${
                          isBest ? 'text-green-400 font-bold' : 'text-white'
                        }`}
                      >
                        {(value * 100).toFixed(2)}%
                      </td>
                    )
                  })}
                </tr>

                {/* Sharpe Ratio */}
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4 text-sm text-gray-300">Sharpe Ratio</td>
                  {results.map((result, idx) => {
                    const value = result.backtest.performance.sharpeRatio
                    const best = Math.max(...results.map(r => r.backtest.performance.sharpeRatio))
                    const isBest = value === best
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 text-sm text-right font-mono ${
                          isBest ? 'text-green-400 font-bold' : 'text-white'
                        }`}
                      >
                        {value.toFixed(2)}
                      </td>
                    )
                  })}
                </tr>

                {/* Max Drawdown */}
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4 text-sm text-gray-300">Max Drawdown</td>
                  {results.map((result, idx) => {
                    const value = Math.abs(result.backtest.performance.maxDrawdown)
                    const best = Math.min(...results.map(r => Math.abs(r.backtest.performance.maxDrawdown)))
                    const isBest = value === best
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 text-sm text-right font-mono ${
                          isBest ? 'text-green-400 font-bold' : 'text-white'
                        }`}
                      >
                        -{(value * 100).toFixed(2)}%
                      </td>
                    )
                  })}
                </tr>

                {/* Win Rate */}
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4 text-sm text-gray-300">Win Rate</td>
                  {results.map((result, idx) => {
                    const value = result.backtest.performance.winRate
                    const best = Math.max(...results.map(r => r.backtest.performance.winRate))
                    const isBest = value === best
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 text-sm text-right font-mono ${
                          isBest ? 'text-green-400 font-bold' : 'text-white'
                        }`}
                      >
                        {(value * 100).toFixed(2)}%
                      </td>
                    )
                  })}
                </tr>

                {/* Profit Factor */}
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4 text-sm text-gray-300">Profit Factor</td>
                  {results.map((result, idx) => {
                    const value = result.backtest.performance.profitFactor
                    const best = Math.max(...results.map(r => r.backtest.performance.profitFactor))
                    const isBest = value === best
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 text-sm text-right font-mono ${
                          isBest ? 'text-green-400 font-bold' : 'text-white'
                        }`}
                      >
                        {value.toFixed(2)}
                      </td>
                    )
                  })}
                </tr>

                {/* Total Trades */}
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4 text-sm text-gray-300">Total Trades</td>
                  {results.map((result, idx) => (
                    <td key={idx} className="py-3 px-4 text-sm text-right font-mono text-white">
                      {result.backtest.performance.totalTrades}
                    </td>
                  ))}
                </tr>

                {/* Expectancy */}
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-300">Expectancy</td>
                  {results.map((result, idx) => {
                    const value = result.backtest.performance.expectancy
                    const best = Math.max(...results.map(r => r.backtest.performance.expectancy))
                    const isBest = value === best
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 text-sm text-right font-mono ${
                          isBest ? 'text-green-400 font-bold' : 'text-white'
                        }`}
                      >
                        ${value.toFixed(2)}
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking por Sharpe Ratio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results
              .map((result, idx) => ({
                result,
                originalIndex: idx,
                sharpe: result.backtest.performance.sharpeRatio,
              }))
              .sort((a, b) => b.sharpe - a.sharpe)
              .map(({ result, originalIndex, sharpe }, rankIdx) => (
                <motion.div
                  key={originalIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rankIdx * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      rankIdx === 0
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : rankIdx === 1
                        ? 'bg-gray-400/20 text-gray-300'
                        : rankIdx === 2
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-gray-700/50 text-gray-400'
                    }`}
                  >
                    {rankIdx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">
                        Estrategia {originalIndex + 1}
                      </span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">
                          Sharpe: <span className="text-white font-mono">{sharpe.toFixed(2)}</span>
                        </span>
                        <span className="text-gray-400">
                          Return:{' '}
                          <span className="text-green-400 font-mono">
                            {(result.backtest.performance.totalReturn * 100).toFixed(2)}%
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
