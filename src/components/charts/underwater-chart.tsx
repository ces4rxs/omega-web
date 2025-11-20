"use client"

import { useEffect, useRef } from "react"
import { createChart, ColorType, IChartApi, ISeriesApi, AreaSeries } from "lightweight-charts"

interface UnderwaterChartProps {
  data: Array<{ time: number; drawdown: number }>
}

export function UnderwaterChart({ data }: UnderwaterChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0a' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#374151',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
    })

    // Add underwater area series
    const series = chart.addSeries(AreaSeries, {
      topColor: 'rgba(239, 68, 68, 0.4)',
      bottomColor: 'rgba(239, 68, 68, 0.0)',
      lineColor: 'rgba(239, 68, 68, 0.8)',
      lineWidth: 2,
      priceFormat: {
        type: 'percent',
      },
    })

    seriesRef.current = series

    // Convert data to lightweight-charts format
    const chartData = data.map(point => ({
      time: Math.floor(point.time / 1000) as any,
      value: -Math.abs(point.drawdown * 100) // Negative values for underwater effect
    }))

    series.setData(chartData)

    // Add zero line marker
    series.createPriceLine({
      price: 0,
      color: '#10b981',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      axisLabelVisible: true,
      title: 'Zero',
    })

    // Fit content
    chart.timeScale().fitContent()

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-900/50 rounded-lg">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div ref={chartContainerRef} className="w-full rounded-lg overflow-hidden" />
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500/40 border border-red-500" />
          <span>Underwater (% below peak)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-green-500 border-dashed border border-green-500" />
          <span>Zero line (at peak)</span>
        </div>
      </div>
    </div>
  )
}
