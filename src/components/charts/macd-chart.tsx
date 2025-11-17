"use client"

import { useEffect, useRef } from "react"
import { createChart, IChartApi, ISeriesApi, UTCTimestamp, LineData, HistogramData, LineSeries, HistogramSeries } from "lightweight-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MACDChartProps {
  data: Array<{ date: string; equity: number }>
  fastPeriod?: number
  slowPeriod?: number
  signalPeriod?: number
}

export function MACDChart({
  data,
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
}: MACDChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chart = useRef<IChartApi | null>(null)
  const macdLineSeries = useRef<ISeriesApi<"Line"> | null>(null)
  const signalLineSeries = useRef<ISeriesApi<"Line"> | null>(null)
  const histogramSeries = useRef<ISeriesApi<"Histogram"> | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Crear el gráfico MACD
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
      height: 150,
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
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      watermark: {
        visible: false,
      },
    })

    // Crear series
    histogramSeries.current = chart.current.addSeries(HistogramSeries, {
      color: '#3b82f6',
      priceScaleId: 'right',
    })

    macdLineSeries.current = chart.current.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      title: 'MACD',
    })

    signalLineSeries.current = chart.current.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 2,
      title: 'Signal',
    })

    // Calcular MACD
    const macdData = calculateMACD(data, fastPeriod, slowPeriod, signalPeriod)

    if (macdData.macdLine.length > 0) {
      macdLineSeries.current.setData(macdData.macdLine)
      signalLineSeries.current.setData(macdData.signalLine)
      histogramSeries.current.setData(macdData.histogram)
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
  }, [data, fastPeriod, slowPeriod, signalPeriod])

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm">
          MACD ({fastPeriod}, {slowPeriod}, {signalPeriod})
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div ref={chartContainerRef} className="w-full" />
        <div className="flex items-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm" />
            <span className="text-gray-400">MACD Line</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-sm" />
            <span className="text-gray-400">Signal Line</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-sm opacity-60" />
            <span className="text-gray-400">Histogram</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Calcula MACD (Moving Average Convergence Divergence)
 */
function calculateMACD(
  equityData: Array<{ date: string; equity: number }>,
  fastPeriod: number,
  slowPeriod: number,
  signalPeriod: number
) {
  const prices = equityData.map(d => d.equity)

  // Calcular EMAs
  const fastEMA = calculateEMA(prices, fastPeriod)
  const slowEMA = calculateEMA(prices, slowPeriod)

  // Calcular línea MACD
  const macdValues: number[] = []
  const macdLine: LineData[] = []

  for (let i = 0; i < Math.min(fastEMA.length, slowEMA.length); i++) {
    const macdValue = fastEMA[i] - slowEMA[i]
    macdValues.push(macdValue)

    const timestamp = new Date(equityData[slowPeriod - 1 + i].date).getTime() / 1000 as UTCTimestamp
    macdLine.push({
      time: timestamp,
      value: macdValue,
    })
  }

  // Calcular línea de señal (EMA de MACD)
  const signalEMA = calculateEMA(macdValues, signalPeriod)
  const signalLine: LineData[] = []
  const histogram: HistogramData[] = []

  for (let i = 0; i < signalEMA.length; i++) {
    const timestamp = new Date(
      equityData[slowPeriod - 1 + signalPeriod - 1 + i].date
    ).getTime() / 1000 as UTCTimestamp

    signalLine.push({
      time: timestamp,
      value: signalEMA[i],
    })

    // Histograma = MACD - Signal
    const histValue = macdValues[signalPeriod - 1 + i] - signalEMA[i]
    histogram.push({
      time: timestamp,
      value: histValue,
      color: histValue >= 0 ? '#22c55e' : '#ef4444',
    })
  }

  return { macdLine, signalLine, histogram }
}

/**
 * Calcula EMA (Exponential Moving Average)
 */
function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period) return []

  const ema: number[] = []
  const multiplier = 2 / (period + 1)

  // Primera EMA es una SMA
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += prices[i]
  }
  ema.push(sum / period)

  // Calcular EMAs subsecuentes
  for (let i = period; i < prices.length; i++) {
    const currentEMA = (prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]
    ema.push(currentEMA)
  }

  return ema
}
