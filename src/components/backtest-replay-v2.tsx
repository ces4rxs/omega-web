/**
 * Backtest Replay Component - Versión Refactorizada
 * Componente principal limpio y modular usando hooks y subcomponentes
 *
 * ANTES: 1,510 líneas monolíticas
 * DESPUÉS: ~200 líneas limpias y modulares
 */

"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Calendar, Camera, Maximize2, Minimize2, BarChart3, LineChart, Flame } from 'lucide-react'
import type { BacktestReplayData } from '@/types/backtest'

// Hooks
import {
  useBacktestReplay,
  useBacktestMetrics,
  useEquityCanvas,
  usePriceCanvas,
  useKeyboardControls
} from '@/hooks/backtest'

// Components
import {
  PlaybackControls,
  ViewToggles,
  AdvancedMetricsPanel,
  RealtimeMetricsGrid,
  PerformanceHeatmap,
  TradeInfoCard,
  ProgressBar,
  KeyboardShortcutsHelp
} from '@/components/backtest'

export function BacktestReplayV2(data: BacktestReplayData) {
  const { equityCurve, trades, initialCapital, priceData, benchmarkData } = data

  // ============================================================================
  // HOOKS
  // ============================================================================

  // Main replay state and controls
  const {
    replayState,
    viewOptions,
    visibleData,
    currentDate,
    controls,
    viewToggles,
    toggleFullscreen,
    takeScreenshot,
    containerRef
  } = useBacktestReplay(data)

  // Calculate metrics in real-time
  const metrics = useBacktestMetrics({
    visibleData,
    trades,
    initialCapital,
    currentDate
  })

  // Canvas rendering
  const equityCanvasRef = useEquityCanvas({
    visibleData,
    initialCapital,
    currentReturn: metrics.currentReturn,
    completedTrades: metrics.completedTrades,
    drawdownZones: metrics.drawdownZones,
    benchmarkData,
    currentStep: replayState.currentStep,
    showTradeMarkers: viewOptions.showTradeMarkers,
    showDrawdownZones: viewOptions.showDrawdownZones,
    showBenchmark: viewOptions.showBenchmark
  })

  const priceCanvasRef = usePriceCanvas({
    priceData,
    currentStep: replayState.currentStep,
    completedTrades: metrics.completedTrades,
    showTradeMarkers: viewOptions.showTradeMarkers,
    showSMAs: viewOptions.showSMAs
  })

  // Keyboard shortcuts
  useKeyboardControls(controls)

  // ============================================================================
  // DERIVED DATA
  // ============================================================================

  const lastTrade = metrics.completedTrades[metrics.completedTrades.length - 1] || null
  const hasPriceData = !!priceData && priceData.length > 0
  const hasBenchmarkData = !!benchmarkData && benchmarkData.length > 0

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      ref={containerRef}
      className={viewOptions.isFullscreen ? 'bg-slate-950 p-6' : ''}
    >
      <Card className="overflow-hidden border-blue-500/30 bg-gradient-to-br from-slate-900 to-slate-950">
        {/* HEADER */}
        <CardHeader className="bg-gradient-to-r from-blue-600/10 via-cyan-600/10 to-purple-600/10 border-b border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <div className="relative">
                  <Zap className="w-6 h-6 text-blue-400 animate-pulse" />
                  <div className="absolute inset-0 blur-lg bg-blue-500/50"></div>
                </div>
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent font-bold">
                  Replay Profesional
                </span>
                <span className="text-xs px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300">
                  PRO
                </span>
              </CardTitle>
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {currentDate
                  ? new Date(currentDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short'
                    })
                  : 'Inicio del backtest'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Progreso
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {replayState.progress.toFixed(1)}%
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => takeScreenshot(equityCanvasRef)}
                  className="bg-slate-800/50 border-slate-700 hover:bg-slate-700 hover:border-blue-500/50"
                  title="Capturar Screenshot"
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="bg-slate-800/50 border-slate-700 hover:bg-slate-700 hover:border-blue-500/50"
                  title={
                    viewOptions.isFullscreen
                      ? 'Salir de pantalla completa'
                      : 'Pantalla completa'
                  }
                >
                  {viewOptions.isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="space-y-6 p-6">
          {/* PRICE CHART (if available) */}
          {hasPriceData && (
            <div className="relative">
              <div className="absolute top-2 left-2 z-10 flex gap-2">
                <div className="text-xs px-2 py-1 bg-black/70 backdrop-blur-sm rounded border border-green-500/30 text-green-300 flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  Precio (OHLC)
                </div>
              </div>

              <canvas
                ref={priceCanvasRef}
                className="w-full rounded-lg bg-gradient-to-br from-slate-950 to-slate-900 border border-green-500/20"
                style={{ width: '100%', height: '300px' }}
              />

              {/* Current price indicator */}
              {priceData && replayState.currentStep < priceData.length && (
                <motion.div
                  key={replayState.currentStep}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-4 right-4 bg-black/90 backdrop-blur-md rounded-xl p-3 border border-green-500/30 shadow-2xl shadow-green-500/20"
                >
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Precio Actual
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      priceData[replayState.currentStep].close >= priceData[0].open
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    ${priceData[replayState.currentStep].close.toFixed(2)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    <div>
                      <span className="text-gray-500">H:</span>{' '}
                      <span className="text-green-400">
                        ${priceData[replayState.currentStep].high.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">L:</span>{' '}
                      <span className="text-red-400">
                        ${priceData[replayState.currentStep].low.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* EQUITY CHART */}
          <div className="relative">
            <div className="absolute top-2 left-2 z-10 flex gap-2">
              <div className="text-xs px-2 py-1 bg-black/70 backdrop-blur-sm rounded border border-blue-500/30 text-blue-300 flex items-center gap-1">
                <LineChart className="w-3 h-3" />
                Equity Curve
              </div>
              {viewOptions.showDrawdownZones && (
                <div className="text-xs px-2 py-1 bg-red-500/20 backdrop-blur-sm rounded border border-red-500/30 text-red-300 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Drawdown Zones
                </div>
              )}
              {viewOptions.showBenchmark && hasBenchmarkData && (
                <div className="text-xs px-2 py-1 bg-gray-500/20 backdrop-blur-sm rounded border border-gray-500/30 text-gray-300 flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  Benchmark
                </div>
              )}
            </div>

            <canvas
              ref={equityCanvasRef}
              className="w-full rounded-lg bg-gradient-to-br from-slate-950 to-slate-900 border border-blue-500/20"
              style={{ width: '100%', height: '400px' }}
            />

            {/* Floating current value */}
            <motion.div
              key={metrics.currentEquity}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-4 right-4 bg-black/90 backdrop-blur-md rounded-xl p-4 border border-blue-500/30 shadow-2xl shadow-blue-500/20"
            >
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                Equity Actual
              </div>
              <div
                className={`text-3xl font-bold mb-1 ${
                  metrics.currentReturn >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                $
                {metrics.currentEquity.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-lg font-semibold ${
                    metrics.currentReturn >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {metrics.currentReturn >= 0 ? '+' : ''}
                  {metrics.currentReturn.toFixed(2)}%
                </span>
              </div>
            </motion.div>
          </div>

          {/* ADVANCED METRICS */}
          <AdvancedMetricsPanel metrics={metrics.advancedMetrics} />

          {/* PERFORMANCE HEATMAP */}
          {viewOptions.showHeatmap && hasPriceData && (
            <PerformanceHeatmap
              hourlyPerformance={metrics.hourlyPerformance}
              bestHour={metrics.bestHour}
              worstHour={metrics.worstHour}
              completedTradesCount={metrics.completedTrades.length}
            />
          )}

          {/* REALTIME METRICS GRID */}
          <RealtimeMetricsGrid
            completedTrades={metrics.completedTrades}
            winRate={metrics.winRate}
            maxDrawdown={metrics.maxDrawdown}
            streak={metrics.streak}
          />

          {/* PROGRESS BAR */}
          <ProgressBar
            currentStep={replayState.currentStep}
            maxSteps={replayState.maxSteps}
            progress={replayState.progress}
          />

          {/* PLAYBACK CONTROLS */}
          <PlaybackControls replayState={replayState} controls={controls} />

          {/* VIEW TOGGLES */}
          <ViewToggles
            viewOptions={viewOptions}
            viewToggles={viewToggles}
            hasPriceData={hasPriceData}
            hasBenchmarkData={hasBenchmarkData}
          />

          {/* LAST TRADE INFO */}
          <TradeInfoCard lastTrade={lastTrade} />

          {/* KEYBOARD SHORTCUTS HELP */}
          <KeyboardShortcutsHelp />
        </CardContent>
      </Card>
    </div>
  )
}
