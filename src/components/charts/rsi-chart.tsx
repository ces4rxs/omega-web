"use client"

import { useEffect, useRef } from "react"
import { createChart, IChartApi, ISeriesApi, UTCTimestamp, LineData, LineSeries } from "lightweight-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RSIChartProps {
  data: Array<{ date: string; equity: number }>
  period?: number
}

export function RSIChart({ data, period = 14 }: RSIChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chart = useRef<IChartApi | null>(null)
  const rsiSeries = useRef<ISeriesApi<"Line"> | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Crear el gráfico RSI
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

    // Crear serie RSI
    rsiSeries.current = chart.current.addSeries(LineSeries, {
      color: '#8b5cf6',
      lineWidth: 2,
      title: `RSI ${period}`,
    })

    // Calcular RSI
    const rsiData = calculateRSI(data, period)
    rsiSeries.current.setData(rsiData)

    // Añadir líneas de sobrecompra (70) y sobreventa (30)
    const overboughtLine = chart.current.addSeries(LineSeries, {
      color: '#ef4444',
      lineWidth: 1,
      lineStyle: 2, // dashed
      title: 'Overbought (70)',
    })

    const oversoldLine = chart.current.addSeries(LineSeries, {
      color: '#22c55e',
      lineWidth: 1,
      lineStyle: 2, // dashed
      title: 'Oversold (30)',
    })

    // Datos para las líneas horizontales
    if (rsiData.length > 0) {
      const horizontalData = rsiData.map(point => ({
        time: point.time,
        value: 70,
      }))
      overboughtLine.setData(horizontalData)

      const horizontalDataOversold = rsiData.map(point => ({
        time: point.time,
        value: 30,
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
  }, [data, period])

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm">RSI (Relative Strength Index)</CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div ref={chartContainerRef} className="w-full" />
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <span>RSI {period}</span>
          <span className="text-red-400">Overbought: 70</span>
          <span className="text-green-400">Oversold: 30</span>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Calcula el RSI (Relative Strength Index)
 */
function calculateRSI(
  equityData: Array<{ date: string; equity: number }>,
  period: number
): LineData[] {
  if (equityData.length < period + 1) return []

  const rsiData: LineData[] = []
  const prices = equityData.map(d => d.equity)

  // Calcular cambios de precio
  const changes: number[] = []
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1])
  }

  // Calcular promedios de ganancias y pérdidas
  for (let i = period; i < changes.length; i++) {
    const slice = changes.slice(i - period, i)

    const gains = slice.filter(c => c > 0).reduce((sum, c) => sum + c, 0) / period
    const losses = Math.abs(slice.filter(c => c < 0).reduce((sum, c) => sum + c, 0)) / period

    let rsi = 50 // valor por defecto
    if (losses === 0) {
      rsi = 100
    } else if (gains === 0) {
      rsi = 0
    } else {
      const rs = gains / losses
      rsi = 100 - (100 / (1 + rs))
    }

    const timestamp = new Date(equityData[i + 1].date).getTime() / 1000 as UTCTimestamp
    rsiData.push({
      time: timestamp,
      value: rsi,
    })
  }

  return rsiData
}
