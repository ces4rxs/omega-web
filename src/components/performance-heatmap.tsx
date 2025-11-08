"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Trade } from "@/lib/types"

interface PerformanceHeatmapProps {
  trades: Trade[]
}

export function PerformanceHeatmap({ trades }: PerformanceHeatmapProps) {
  // Calcular matriz de rendimiento por hora y día de la semana
  const heatmapData = useMemo(() => {
    const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
    const counts: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))

    trades.forEach((trade) => {
      const exitDate = new Date(trade.exitDate)
      const dayOfWeek = exitDate.getDay() // 0 = Domingo, 6 = Sábado
      const hour = exitDate.getHours()

      matrix[dayOfWeek][hour] += trade.pnl
      counts[dayOfWeek][hour] += 1
    })

    // Calcular promedios
    const avgMatrix = matrix.map((row, dayIdx) =>
      row.map((sum, hourIdx) => (counts[dayIdx][hourIdx] > 0 ? sum / counts[dayIdx][hourIdx] : 0))
    )

    return { matrix: avgMatrix, counts }
  }, [trades])

  // Calcular min y max para normalizar colores
  const { min, max } = useMemo(() => {
    const allValues = heatmapData.matrix.flat()
    return {
      min: Math.min(...allValues),
      max: Math.max(...allValues),
    }
  }, [heatmapData])

  // Función para obtener color basado en valor
  const getColor = (value: number): string => {
    if (value === 0) return 'rgb(31, 41, 55)' // gray-800

    const normalized = (value - min) / (max - min || 1)

    if (value > 0) {
      // Verde para ganancias
      const intensity = Math.floor(normalized * 255)
      return `rgb(${255 - intensity}, ${200 + intensity * 0.2}, ${100})`
    } else {
      // Rojo para pérdidas
      const intensity = Math.floor(Math.abs(normalized) * 255)
      return `rgb(${200 + intensity * 0.2}, ${255 - intensity}, ${100})`
    }
  }

  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Heatmap de Rendimiento (por Hora y Día)</CardTitle>
        <p className="text-sm text-gray-400">
          P&L promedio por hora del día y día de la semana
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Tabla de heatmap */}
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-xs text-gray-400 text-left sticky left-0 bg-black z-10">
                    Día/Hora
                  </th>
                  {hours.map((hour) => (
                    <th key={hour} className="p-2 text-xs text-gray-400 text-center min-w-[40px]">
                      {hour}h
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day, dayIdx) => (
                  <tr key={day}>
                    <td className="p-2 text-sm font-medium text-white sticky left-0 bg-black z-10">
                      {day}
                    </td>
                    {heatmapData.matrix[dayIdx].map((value, hourIdx) => {
                      const count = heatmapData.counts[dayIdx][hourIdx]
                      return (
                        <td
                          key={hourIdx}
                          className="p-1 text-center relative group cursor-pointer transition-transform hover:scale-110"
                          style={{
                            backgroundColor: getColor(value),
                          }}
                        >
                          <div className="text-xs font-mono text-white drop-shadow-lg">
                            {value !== 0 && (
                              <span>{value > 0 ? '+' : ''}{value.toFixed(0)}</span>
                            )}
                          </div>

                          {/* Tooltip */}
                          {count > 0 && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                              <div className="text-xs">
                                <div className="font-semibold text-white mb-1">
                                  {day} {hourIdx}:00
                                </div>
                                <div className="text-gray-300">
                                  P&L Promedio:{' '}
                                  <span className={value >= 0 ? 'text-green-400' : 'text-red-400'}>
                                    ${value.toFixed(2)}
                                  </span>
                                </div>
                                <div className="text-gray-400">Trades: {count}</div>
                              </div>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Leyenda */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <span className="text-sm text-gray-400">Pérdida</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 10 }, (_, i) => {
                  const value = min + (i / 9) * (max - min)
                  return (
                    <div
                      key={i}
                      className="w-8 h-6 rounded"
                      style={{ backgroundColor: getColor(value) }}
                    />
                  )
                })}
              </div>
              <span className="text-sm text-gray-400">Ganancia</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente adicional: Heatmap por Mes
export function MonthlyPerformanceHeatmap({ trades }: PerformanceHeatmapProps) {
  const monthlyData = useMemo(() => {
    const matrix: number[][] = Array.from({ length: 12 }, () => [])

    trades.forEach((trade) => {
      const exitDate = new Date(trade.exitDate)
      const month = exitDate.getMonth()
      const year = exitDate.getFullYear()

      if (!matrix[month][year]) {
        matrix[month][year] = 0
      }
      matrix[month][year] += trade.pnl
    })

    return matrix
  }, [trades])

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  // Obtener años únicos
  const years = useMemo(() => {
    const yearSet = new Set<number>()
    trades.forEach((trade) => {
      const year = new Date(trade.exitDate).getFullYear()
      yearSet.add(year)
    })
    return Array.from(yearSet).sort()
  }, [trades])

  const { min, max } = useMemo(() => {
    const allValues: number[] = []
    monthlyData.forEach((month) => {
      Object.values(month).forEach((val) => {
        if (typeof val === 'number') allValues.push(val)
      })
    })
    return {
      min: Math.min(...allValues, 0),
      max: Math.max(...allValues, 0),
    }
  }, [monthlyData])

  const getColor = (value: number | undefined): string => {
    if (!value || value === 0) return 'rgb(31, 41, 55)'

    const normalized = (value - min) / (max - min || 1)

    if (value > 0) {
      const intensity = Math.floor(normalized * 200)
      return `rgb(${100 - intensity * 0.3}, ${150 + intensity * 0.5}, ${100})`
    } else {
      const intensity = Math.floor(Math.abs(normalized) * 200)
      return `rgb(${150 + intensity * 0.5}, ${100 - intensity * 0.3}, ${100})`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento Mensual</CardTitle>
        <p className="text-sm text-gray-400">P&L total por mes y año</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-xs text-gray-400 text-left">Mes</th>
                {years.map((year) => (
                  <th key={year} className="p-2 text-xs text-gray-400 text-center min-w-[80px]">
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map((month, monthIdx) => (
                <tr key={month}>
                  <td className="p-2 text-sm font-medium text-white">{month}</td>
                  {years.map((year) => {
                    const value = monthlyData[monthIdx][year]
                    return (
                      <td
                        key={year}
                        className="p-2 text-center group cursor-pointer transition-transform hover:scale-105"
                        style={{
                          backgroundColor: getColor(value),
                        }}
                      >
                        {value && (
                          <div
                            className={`text-sm font-mono font-semibold ${
                              value >= 0 ? 'text-green-100' : 'text-red-100'
                            }`}
                          >
                            {value >= 0 ? '+' : ''}${value.toFixed(0)}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
