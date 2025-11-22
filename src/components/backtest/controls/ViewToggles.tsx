/**
 * Toggles de visualización para el backtest replay
 * Trade markers, Drawdowns, SMAs, Heatmap, Benchmark, Sound
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Target,
  Flame,
  LineChart,
  BarChart3,
  Zap
} from 'lucide-react'
import type { ViewOptions, ViewToggleHandlers } from '@/types/backtest'

interface ViewTogglesProps {
  viewOptions: ViewOptions
  viewToggles: ViewToggleHandlers
  hasPriceData?: boolean
  hasBenchmarkData?: boolean
}

export const ViewToggles = React.memo(function ViewToggles({
  viewOptions,
  viewToggles,
  hasPriceData = false,
  hasBenchmarkData = false
}: ViewTogglesProps) {
  const {
    showTradeMarkers,
    showDrawdownZones,
    showSMAs,
    showHeatmap,
    showBenchmark,
    soundEnabled
  } = viewOptions

  const {
    setShowTradeMarkers,
    setShowDrawdownZones,
    setShowSMAs,
    setShowHeatmap,
    setShowBenchmark,
    setSoundEnabled
  } = viewToggles

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-400 mr-2">Vista:</span>

      {/* Trade Markers */}
      <Button
        variant={showTradeMarkers ? 'default' : 'outline'}
        size="sm"
        onClick={() => setShowTradeMarkers(!showTradeMarkers)}
        className={
          showTradeMarkers
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-slate-800/50 border-slate-700'
        }
      >
        <Target className="w-3 h-3 mr-1" />
        Trades
      </Button>

      {/* Drawdown Zones */}
      <Button
        variant={showDrawdownZones ? 'default' : 'outline'}
        size="sm"
        onClick={() => setShowDrawdownZones(!showDrawdownZones)}
        className={
          showDrawdownZones
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-slate-800/50 border-slate-700'
        }
      >
        <Flame className="w-3 h-3 mr-1" />
        Drawdowns
      </Button>

      {/* SMAs (only if price data) */}
      {hasPriceData && (
        <>
          <Button
            variant={showSMAs ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowSMAs(!showSMAs)}
            className={
              showSMAs
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-slate-800/50 border-slate-700'
            }
          >
            <LineChart className="w-3 h-3 mr-1" />
            SMAs
          </Button>

          <Button
            variant={showHeatmap ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={
              showHeatmap
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-slate-800/50 border-slate-700'
            }
          >
            <Flame className="w-3 h-3 mr-1" />
            Heatmap
          </Button>
        </>
      )}

      {/* Benchmark (only if benchmark data) */}
      {hasBenchmarkData && (
        <Button
          variant={showBenchmark ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowBenchmark(!showBenchmark)}
          className={
            showBenchmark
              ? 'bg-gray-600 hover:bg-gray-700'
              : 'bg-slate-800/50 border-slate-700'
          }
        >
          <BarChart3 className="w-3 h-3 mr-1" />
          Benchmark
        </Button>
      )}

      {/* Sound */}
      <Button
        variant={soundEnabled ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSoundEnabled(!soundEnabled)}
        className={
          soundEnabled
            ? 'bg-pink-600 hover:bg-pink-700'
            : 'bg-slate-800/50 border-slate-700'
        }
        title="Sound FX en trades"
      >
        <Zap className="w-3 h-3 mr-1" />
        Sound
      </Button>
    </div>
  )
})
