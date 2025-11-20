"use client"

import { useEffect, useRef } from "react"
import { createChart, IChartApi, ISeriesApi, UTCTimestamp, LineData, CandlestickData, LineSeries } from "lightweight-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ATRChartProps {
  data: CandlestickData[]
  period?: number
}

export function ATRChart({ data, period = 14 }: ATRChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chart = useRef<IChartApi | null>(null)
  const atrSeries = useRef<ISeriesApi<"Line"> | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Crear el gráfico ATR
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

    // Remove watermark - NOT SUPPORTED IN V5
    // chart.current.applyOptions({
    //   watermark: {
    //     visible: false,
    //   },
    // })

    // Crear serie ATR
    atrSeries.current = chart.current.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 2,
      title: `ATR ${period}`,
    })

    // Calcular ATR
    const atrData = calculateATR(data, period)
    atrSeries.current.setData(atrData)

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
  }, [data, period])

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm">ATR - Average True Range ({period})</CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div ref={chartContainerRef} className="w-full" />
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <span>Mide la volatilidad del mercado</span>
          <span className="text-orange-400">ATR alto = alta volatilidad</span>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Calcula ATR (Average True Range)
 */
function calculateATR(data: CandlestickData[], period: number): LineData[] {
  if (data.length < period + 1) return []

  const atrData: LineData[] = []
  const trueRanges: number[] = []

  // Calcular True Range para cada barra
  for (let i = 1; i < data.length; i++) {
    const high = data[i].high
    const low = data[i].low
    const prevClose = data[i - 1].close

    const tr1 = high - low
    const tr2 = Math.abs(high - prevClose)
    const tr3 = Math.abs(low - prevClose)

    const trueRange = Math.max(tr1, tr2, tr3)
    trueRanges.push(trueRange)
  }

  // Calcular ATR inicial (SMA de los primeros N true ranges)
  let atr = trueRanges.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period

  atrData.push({
    time: data[period].time,
    value: atr,
  })

  // Calcular ATR subsecuentes usando Wilder's smoothing
  for (let i = period; i < trueRanges.length; i++) {
    atr = ((atr * (period - 1)) + trueRanges[i]) / period

    atrData.push({
      time: data[i + 1].time,
      value: atr,
    })
  }

  return atrData
}
