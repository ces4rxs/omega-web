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
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  TrendingUp,
  MousePointer2,
  TrendingUp as TrendLine,
  Minus,
  GitBranch,
  Square,
  Type,
  MoveUpRight
} from "lucide-react"
import { polygonService, type OHLCData } from "@/lib/polygon"

type DrawingTool = 'cursor' | 'trendline' | 'horizontal' | 'fibonacci' | 'rectangle' | 'text' | 'arrow'

interface CandlestickChartProps {
  data: Array<{ date: string; equity: number }>
  trades: Trade[]
  symbol: string
  startDate?: string
  endDate?: string
  timeframe?: string
  parameters?: {
    fastPeriod?: number
    slowPeriod?: number
  }
}

export function CandlestickChart({
  data,
  trades,
  symbol,
  startDate,
  endDate,
  timeframe: initialTimeframe = '1d',
  parameters
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chart = useRef<IChartApi | null>(null)
  const candlestickSeries = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const smaFastSeries = useRef<ISeriesApi<"Line"> | null>(null)
  const smaSlowSeries = useRef<ISeriesApi<"Line"> | null>(null)
  const [timeframe, setTimeframe] = useState<'1H' | '4H' | '1D'>('1D')
  const [ohlcData, setOhlcData] = useState<OHLCData[]>([])
  const [loading, setLoading] = useState(true)
  const [usingRealData, setUsingRealData] = useState(false)
  const [activeTool, setActiveTool] = useState<DrawingTool>('cursor')

  // Cargar datos OHLC de Polygon
  useEffect(() => {
    const loadOHLCData = async () => {
      if (!startDate || !endDate) {
        // Si no hay fechas, usar datos simulados de equity curve
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const timeframeMap: Record<string, string> = {
          '1H': '1h',
          '4H': '4h',
          '1D': '1d',
        }

        const polygonTimeframe = timeframeMap[timeframe] || '1d'
        const data = await polygonService.getOHLC(symbol, polygonTimeframe, startDate, endDate)

        setOhlcData(data)
        setUsingRealData(data.length > 0 && data[0].time !== undefined)
      } catch (error) {
        console.error('Error cargando datos OHLC:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOHLCData()
  }, [symbol, startDate, endDate, timeframe])

  // Crear y actualizar el gráfico
  useEffect(() => {
    if (!chartContainerRef.current || loading) return

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

    // Usar datos OHLC reales de Polygon o generar desde equity curve
    const candleData = ohlcData.length > 0
      ? convertOHLCToCandlestick(ohlcData)
      : generateCandlestickData(data, timeframe)

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
  }, [data, trades, timeframe, parameters, ohlcData, loading])

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

  if (loading) {
    return (
      <Card>
        <CardContent className="h-[600px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Cargando datos de mercado...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>{symbol} Price Chart</CardTitle>
              {usingRealData && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                  <TrendingUp className="w-3 h-3" />
                  Datos Reales (Polygon)
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {usingRealData
                ? 'Datos OHLC en tiempo real con indicadores técnicos'
                : 'Candlestick chart con SMA y marcadores de trades'}
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
        <div className="relative">
          {/* Drawing Tools Toolbar - Vertical Bar */}
          <div className="absolute left-0 top-0 z-10 flex flex-col gap-1 bg-gray-900/90 backdrop-blur-sm rounded-r-lg p-2 border border-gray-700/50 shadow-xl">
            {/* Cursor Tool */}
            <Button
              variant={activeTool === 'cursor' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setActiveTool('cursor')}
              className={`h-9 w-9 ${activeTool === 'cursor' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-800'}`}
              title="Cursor (Arrastrar gráfico)"
            >
              <MousePointer2 className="h-4 w-4" />
            </Button>

            {/* Separator */}
            <div className="w-full h-px bg-gray-700/50 my-1" />

            {/* Trend Line Tool */}
            <Button
              variant={activeTool === 'trendline' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setActiveTool('trendline')}
              className={`h-9 w-9 ${activeTool === 'trendline' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-800'}`}
              title="Línea de Tendencia"
            >
              <TrendLine className="h-4 w-4" />
            </Button>

            {/* Horizontal Line Tool */}
            <Button
              variant={activeTool === 'horizontal' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setActiveTool('horizontal')}
              className={`h-9 w-9 ${activeTool === 'horizontal' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-800'}`}
              title="Línea Horizontal (Soporte/Resistencia)"
            >
              <Minus className="h-4 w-4" />
            </Button>

            {/* Fibonacci Tool */}
            <Button
              variant={activeTool === 'fibonacci' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setActiveTool('fibonacci')}
              className={`h-9 w-9 ${activeTool === 'fibonacci' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-800'}`}
              title="Retroceso de Fibonacci"
            >
              <GitBranch className="h-4 w-4" />
            </Button>

            {/* Rectangle Tool */}
            <Button
              variant={activeTool === 'rectangle' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setActiveTool('rectangle')}
              className={`h-9 w-9 ${activeTool === 'rectangle' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-800'}`}
              title="Rectángulo (Zona de S/R)"
            >
              <Square className="h-4 w-4" />
            </Button>

            {/* Separator */}
            <div className="w-full h-px bg-gray-700/50 my-1" />

            {/* Text Tool */}
            <Button
              variant={activeTool === 'text' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setActiveTool('text')}
              className={`h-9 w-9 ${activeTool === 'text' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-800'}`}
              title="Texto (Anotaciones)"
            >
              <Type className="h-4 w-4" />
            </Button>

            {/* Arrow Tool */}
            <Button
              variant={activeTool === 'arrow' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setActiveTool('arrow')}
              className={`h-9 w-9 ${activeTool === 'arrow' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-800'}`}
              title="Flecha (Señalar)"
            >
              <MoveUpRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Chart Container */}
          <div ref={chartContainerRef} className="w-full" />
        </div>

        {/* Legend and Active Tool Indicator */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-4">
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

          {/* Active Tool Indicator */}
          {activeTool !== 'cursor' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-md">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-blue-400 font-medium text-xs uppercase">
                {activeTool === 'trendline' && 'Línea de Tendencia'}
                {activeTool === 'horizontal' && 'Línea Horizontal'}
                {activeTool === 'fibonacci' && 'Fibonacci'}
                {activeTool === 'rectangle' && 'Rectángulo'}
                {activeTool === 'text' && 'Texto'}
                {activeTool === 'arrow' && 'Flecha'}
              </span>
              <span className="text-gray-500 text-xs">● Click en el gráfico para dibujar</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Convierte datos OHLC de Polygon al formato de lightweight-charts
 */
function convertOHLCToCandlestick(ohlcData: OHLCData[]): CandlestickData[] {
  return ohlcData.map(bar => ({
    time: (bar.time / 1000) as UTCTimestamp, // Polygon usa milisegundos, lightweight-charts usa segundos
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
  }))
}

/**
 * Genera datos de candlestick a partir de equity curve (fallback)
 * Usado cuando no hay datos OHLC reales disponibles
 */
function generateCandlestickData(
  equityData: Array<{ date: string; equity: number }>,
  timeframe: string
): CandlestickData[] {
  if (!equityData || equityData.length === 0) return []

  // Simular OHLC basándose en equity
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
