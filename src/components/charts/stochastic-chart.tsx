"use client"

import { useEffect, useRef } from "react"
import { createChart, IChartApi, ISeriesApi, UTCTimestamp, LineData, CandlestickData, LineSeries } from "lightweight-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StochasticChartProps {
  data: CandlestickData[]
  kPeriod?: number
  dPeriod?: number
}

export function StochasticChart({ data, kPeriod = 14, dPeriod = 3 }: StochasticChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chart = useRef<IChartApi | null>(null)
  const kLineSeries = useRef<ISeriesApi<"Line"> | null>(null)
  const dLineSeries = useRef<ISeriesApi<"Line"> | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Crear el gráfico Stochastic
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
    })

    // Remove watermark
    chart.current.applyOptions({
      watermark: {
        visible: false,
      },
    })

    // Crear series
    kLineSeries.current = chart.current.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      title: '%K',
    })

    dLineSeries.current = chart.current.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 2,
      title: '%D',
    })

    // Añadir líneas de sobrecompra (80) y sobreventa (20)
    const overboughtLine = chart.current.addSeries(LineSeries, {
      color: '#ef4444',
      lineWidth: 1,
      lineStyle: 2, // dashed
      title: 'Overbought (80)',
    })

    const oversoldLine = chart.current.addSeries(LineSeries, {
      color: '#22c55e',
      lineWidth: 1,
      lineStyle: 2, // dashed
      title: 'Oversold (20)',
    })

    // Calcular Stochastic
    const stochData = calculateStochastic(data, kPeriod, dPeriod)

    kLineSeries.current.setData(stochData.k)
    dLineSeries.current.setData(stochData.d)

    // Líneas horizontales
    if (stochData.k.length > 0) {
      const horizontalDataOverbought = stochData.k.map(point => ({
        time: point.time,
        value: 80,
      }))
      overboughtLine.setData(horizontalDataOverbought)

      const horizontalDataOversold = stochData.k.map(point => ({
        time: point.time,
        value: 20,
      }))
      oversoldLine.setData(horizontalDataOversold)
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
  }, [data, kPeriod, dPeriod])

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Stochastic Oscillator ({kPeriod}, {dPeriod})</CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div ref={chartContainerRef} className="w-full" />
        <div className="flex items-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm" />
            <span className="text-gray-400">%K Line</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-sm" />
            <span className="text-gray-400">%D Signal</span>
          </div>
          <span className="text-red-400">Overbought: 80</span>
          <span className="text-green-400">Oversold: 20</span>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Calcula Stochastic Oscillator
 */
function calculateStochastic(
  data: CandlestickData[],
  kPeriod: number,
  dPeriod: number
): { k: LineData[]; d: LineData[] } {
  const kData: LineData[] = []
  const kValues: number[] = []

  if (data.length < kPeriod) return { k: [], d: [] }

  // Calcular %K
  for (let i = kPeriod - 1; i < data.length; i++) {
    const slice = data.slice(i - kPeriod + 1, i + 1)

    const high = Math.max(...slice.map(d => d.high))
    const low = Math.min(...slice.map(d => d.low))
    const close = data[i].close

    const k = low !== high ? ((close - low) / (high - low)) * 100 : 50

    kValues.push(k)
    kData.push({
      time: data[i].time,
      value: k,
    })
  }

  // Calcular %D (SMA de %K)
  const dData: LineData[] = []

  for (let i = dPeriod - 1; i < kValues.length; i++) {
    const slice = kValues.slice(i - dPeriod + 1, i + 1)
    const d = slice.reduce((sum, val) => sum + val, 0) / dPeriod

    dData.push({
      time: kData[i].time,
      value: d,
    })
  }

  return { k: kData, d: dData }
}
