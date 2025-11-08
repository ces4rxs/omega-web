"use client"

import { useEffect, useRef, useState } from "react"
import {
  createChart,
  createSeriesMarkers,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
  CandlestickData,
  LineData,
  CandlestickSeries,
  LineSeries
} from "lightweight-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Trade } from "@/lib/types"
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react"

interface CandlestickChartProps {
  data: Array<{ date: string; equity: number }>
  trades: Trade[]
  symbol: string
  parameters?: {
    fastPeriod?: number
    slowPeriod?: number
  }
}

export function CandlestickChart({ data, trades, symbol, parameters }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chart = useRef<IChartApi | null>(null)
  const candlestickSeries = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const smaFastSeries = useRef<ISeriesApi<"Line"> | null>(null)
  const smaSlowSeries = useRef<ISeriesApi<"Line"> | null>(null)
  const [timeframe, setTimeframe] = useState<'1D' | '1H' | '4H'>('1D')

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Crear el gráfico principal
    chart.current = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0a0a0a' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#1f1f1f' },
        horzLines: { color: '#1f1f1f' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: '#758696',
          style: 3,
        },
        horzLine: {
          width: 1,
          color: '#758696',
          style: 3,
        },
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
      },
    })

    // Crear serie de candlesticks
    candlestickSeries.current = chart.current.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    // Crear series de SMA
    smaFastSeries.current = chart.current.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      title: `SMA ${parameters?.fastPeriod || 10}`,
    })

    smaSlowSeries.current = chart.current.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 2,
      title: `SMA ${parameters?.slowPeriod || 20}`,
    })

    // Generar datos de candlestick a partir de equityCurve
    const candleData = generateCandlestickData(data, timeframe)
    candlestickSeries.current.setData(candleData)

    // Calcular y mostrar SMAs
    const smaFastData = calculateSMA(candleData, parameters?.fastPeriod || 10)
    const smaSlowData = calculateSMA(candleData, parameters?.slowPeriod || 20)
    smaFastSeries.current.setData(smaFastData)
    smaSlowSeries.current.setData(smaSlowData)

    // Añadir marcadores de trades
    const markers = getTradeMarkers(trades)
    if (markers.length > 0) {
      createSeriesMarkers(candlestickSeries.current, markers)
    }

    // Ajustar vista
    chart.current.timeScale().fitContent()

    // Manejar resize
    const handleResize = () => {
      if (chart.current && chartContainerRef.current) {
        chart.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.current?.remove()
    }
  }, [data, trades, timeframe, parameters])

  const handleZoomIn = () => {
    if (chart.current) {
      const timeScale = chart.current.timeScale()
      const visibleRange = timeScale.getVisibleRange()
      if (visibleRange && visibleRange.from !== null && visibleRange.to !== null) {
        const from = visibleRange.from as number
        const to = visibleRange.to as number
        const range = to - from
        const newRange = range * 0.8
        const center = (from + to) / 2
        timeScale.setVisibleRange({
          from: (center - newRange / 2) as UTCTimestamp,
          to: (center + newRange / 2) as UTCTimestamp,
        })
      }
    }
  }

  const handleZoomOut = () => {
    if (chart.current) {
      const timeScale = chart.current.timeScale()
      const visibleRange = timeScale.getVisibleRange()
      if (visibleRange && visibleRange.from !== null && visibleRange.to !== null) {
        const from = visibleRange.from as number
        const to = visibleRange.to as number
        const range = to - from
        const newRange = range * 1.2
        const center = (from + to) / 2
        timeScale.setVisibleRange({
          from: (center - newRange / 2) as UTCTimestamp,
          to: (center + newRange / 2) as UTCTimestamp,
        })
      }
    }
  }

  const handleFitContent = () => {
    if (chart.current) {
      chart.current.timeScale().fitContent()
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{symbol} Price Chart</CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              Candlestick chart with SMA indicators and trade markers
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Timeframe selector */}
            <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1">
              {(['1H', '4H', '1D'] as const).map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeframe(tf)}
                  className="h-7 px-3 text-xs"
                >
                  {tf}
                </Button>
              ))}
            </div>

            {/* Zoom controls */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                className="h-8 w-8"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                className="h-8 w-8"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleFitContent}
                className="h-8 w-8"
                title="Fit Content"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartContainerRef} className="w-full" />

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm" />
            <span className="text-gray-400">SMA {parameters?.fastPeriod || 10}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-sm" />
            <span className="text-gray-400">SMA {parameters?.slowPeriod || 20}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-green-500" />
            <span className="text-gray-400">Long Entry</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-500" />
            <span className="text-gray-400">Exit</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Genera datos de candlestick a partir de equity curve
 * En producción, estos datos vendrían del backend con OHLC real
 */
function generateCandlestickData(
  equityData: Array<{ date: string; equity: number }>,
  timeframe: string
): CandlestickData[] {
  if (!equityData || equityData.length === 0) return []

  // Simular OHLC basándose en equity
  // TODO: Reemplazar con datos OHLC reales del backend
  return equityData.map((point, index) => {
    const timestamp = new Date(point.date).getTime() / 1000 as UTCTimestamp
    const equity = point.equity

    // Simular volatilidad para visualización
    const volatility = equity * 0.02
    const open = index > 0 ? equityData[index - 1].equity : equity
    const close = equity
    const high = Math.max(open, close) + Math.random() * volatility
    const low = Math.min(open, close) - Math.random() * volatility

    return {
      time: timestamp,
      open,
      high,
      close,
      low,
    }
  })
}

/**
 * Calcula Simple Moving Average
 */
function calculateSMA(candleData: CandlestickData[], period: number): LineData[] {
  if (candleData.length < period) return []

  const smaData: LineData[] = []

  for (let i = period - 1; i < candleData.length; i++) {
    const slice = candleData.slice(i - period + 1, i + 1)
    const sum = slice.reduce((acc, candle) => acc + candle.close, 0)
    const sma = sum / period

    smaData.push({
      time: candleData[i].time,
      value: sma,
    })
  }

  return smaData
}

/**
 * Genera marcadores de trades para el gráfico
 */
function getTradeMarkers(trades: Trade[]) {
  return trades.flatMap((trade) => {
    const entryTime = new Date(trade.entryDate).getTime() / 1000 as UTCTimestamp
    const exitTime = new Date(trade.exitDate).getTime() / 1000 as UTCTimestamp

    return [
      {
        time: entryTime,
        position: 'belowBar' as const,
        color: trade.side === 'long' ? '#22c55e' : '#ef4444',
        shape: 'arrowUp' as const,
        text: `Entry ${trade.side.toUpperCase()}`,
      },
      {
        time: exitTime,
        position: 'aboveBar' as const,
        color: trade.pnl >= 0 ? '#22c55e' : '#ef4444',
        shape: 'arrowDown' as const,
        text: `Exit (${trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)})`,
      },
    ]
  })
}
