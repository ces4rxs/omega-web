"use client"

import { useEffect, useRef } from "react"
import { createChart, IChartApi, ISeriesApi, UTCTimestamp, CandlestickData, LineData, CandlestickSeries, LineSeries } from "lightweight-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BollingerBandsChartProps {
  data: CandlestickData[]
  period?: number
  stdDev?: number
}

export function BollingerBandsChart({ data, period = 20, stdDev = 2 }: BollingerBandsChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chart = useRef<IChartApi | null>(null)
  const candlestickSeries = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const upperBandSeries = useRef<ISeriesApi<"Line"> | null>(null)
  const middleBandSeries = useRef<ISeriesApi<"Line"> | null>(null)
  const lowerBandSeries = useRef<ISeriesApi<"Line"> | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Crear el gráfico
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
      height: 300,
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

    // Crear series de Bollinger Bands
    upperBandSeries.current = chart.current.addSeries(LineSeries, {
      color: '#ef4444',
      lineWidth: 2,
      title: 'Upper Band',
    })

    middleBandSeries.current = chart.current.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      title: 'Middle Band (SMA)',
    })

    lowerBandSeries.current = chart.current.addSeries(LineSeries, {
      color: '#22c55e',
      lineWidth: 2,
      title: 'Lower Band',
    })

    // Calcular y aplicar Bollinger Bands
    candlestickSeries.current.setData(data)
    const bands = calculateBollingerBands(data, period, stdDev)

    upperBandSeries.current.setData(bands.upper)
    middleBandSeries.current.setData(bands.middle)
    lowerBandSeries.current.setData(bands.lower)

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
  }, [data, period, stdDev])

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Bollinger Bands ({period}, {stdDev}σ)</CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div ref={chartContainerRef} className="w-full" />
        <div className="flex items-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-sm" />
            <span className="text-gray-400">Upper Band (+{stdDev}σ)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm" />
            <span className="text-gray-400">Middle (SMA{period})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm" />
            <span className="text-gray-400">Lower Band (-{stdDev}σ)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Calcula Bollinger Bands
 */
function calculateBollingerBands(
  data: CandlestickData[],
  period: number,
  stdDev: number
): { upper: LineData[]; middle: LineData[]; lower: LineData[] } {
  const upper: LineData[] = []
  const middle: LineData[] = []
  const lower: LineData[] = []

  if (data.length < period) return { upper, middle, lower }

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const closes = slice.map(d => d.close)

    // Calcular SMA (Middle Band)
    const sma = closes.reduce((sum, c) => sum + c, 0) / period

    // Calcular desviación estándar
    const variance = closes.reduce((sum, c) => sum + Math.pow(c - sma, 2), 0) / period
    const standardDeviation = Math.sqrt(variance)

    // Calcular bandas
    const upperBand = sma + (stdDev * standardDeviation)
    const lowerBand = sma - (stdDev * standardDeviation)

    middle.push({
      time: data[i].time,
      value: sma,
    })

    upper.push({
      time: data[i].time,
      value: upperBand,
    })

    lower.push({
      time: data[i].time,
      value: lowerBand,
    })
  }

  return { upper, middle, lower }
}
