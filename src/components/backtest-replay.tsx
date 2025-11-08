"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, FastForward, Rewind } from "lucide-react"
import type { Trade } from "@/lib/types"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface BacktestReplayProps {
  equityCurve: Array<{ date: string; equity: number }>
  trades: Trade[]
  initialCapital: number
}

export function BacktestReplay({ equityCurve, trades, initialCapital }: BacktestReplayProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [speed, setSpeed] = useState(1)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const maxSteps = equityCurve.length
  const visibleData = equityCurve.slice(0, currentStep + 1)
  const completedTrades = trades.filter((trade) => {
    const tradeEndDate = new Date(trade.exitDate).getTime()
    const currentDate = new Date(equityCurve[currentStep]?.date || 0).getTime()
    return tradeEndDate <= currentDate
  })

  // Controlar reproducción
  useEffect(() => {
    if (isPlaying && currentStep < maxSteps - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= maxSteps - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 100 / speed)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, currentStep, maxSteps, speed])

  const handlePlayPause = () => {
    if (currentStep >= maxSteps - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const handleStepBack = () => {
    setIsPlaying(false)
    setCurrentStep((prev) => Math.max(0, prev - 10))
  }

  const handleStepForward = () => {
    setIsPlaying(false)
    setCurrentStep((prev) => Math.min(maxSteps - 1, prev + 10))
  }

  // Datos del gráfico
  const chartData = {
    labels: visibleData.map((d) => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Equity',
        data: visibleData.map((d) => d.equity),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        label: 'Capital Inicial',
        data: visibleData.map(() => initialCapital),
        borderColor: '#6b7280',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#9ca3af',
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        ticks: {
          maxTicksLimit: 8,
          color: '#6b7280',
        },
        grid: {
          color: '#1f2937',
        },
      },
      y: {
        display: true,
        ticks: {
          color: '#6b7280',
          callback: (value: any) => `$${value.toLocaleString()}`,
        },
        grid: {
          color: '#1f2937',
        },
      },
    },
  }

  const currentEquity = visibleData[visibleData.length - 1]?.equity || initialCapital
  const currentReturn = ((currentEquity - initialCapital) / initialCapital) * 100
  const progress = (currentStep / (maxSteps - 1)) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Replay del Backtest</span>
          <span className="text-sm font-normal text-gray-400">
            Paso {currentStep + 1} de {maxSteps}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gráfico */}
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Estadísticas actuales */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/30 p-4 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Equity Actual</p>
            <p className="text-2xl font-bold text-white">
              ${currentEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gray-800/30 p-4 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Retorno</p>
            <p
              className={`text-2xl font-bold ${
                currentReturn >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {currentReturn >= 0 ? '+' : ''}
              {currentReturn.toFixed(2)}%
            </p>
          </div>
          <div className="bg-gray-800/30 p-4 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Trades Completados</p>
            <p className="text-2xl font-bold text-white">{completedTrades.length}</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              disabled={currentStep === 0}
              className="h-10 w-10"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleStepBack}
              disabled={currentStep === 0}
              className="h-10 w-10"
            >
              <Rewind className="w-5 h-5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={handlePlayPause}
              className="h-12 w-12 bg-blue-600 hover:bg-blue-700"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleStepForward}
              disabled={currentStep >= maxSteps - 1}
              className="h-10 w-10"
            >
              <FastForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Control de velocidad */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <span className="text-sm text-gray-400 whitespace-nowrap">Velocidad: {speed}x</span>
            <Slider
              min={0.5}
              max={5}
              step={0.5}
              value={speed}
              onValueChange={setSpeed}
              className="flex-1"
            />
          </div>
        </div>

        {/* Último trade ejecutado */}
        {completedTrades.length > 0 && (
          <div className="bg-gray-800/30 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Último Trade Ejecutado</h4>
            {(() => {
              const lastTrade = completedTrades[completedTrades.length - 1]
              return (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Entrada:</span>{' '}
                    <span className="text-white">
                      ${lastTrade.entryPrice.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Salida:</span>{' '}
                    <span className="text-white">
                      ${lastTrade.exitPrice.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">P&L:</span>{' '}
                    <span
                      className={lastTrade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}
                    >
                      ${lastTrade.pnl.toFixed(2)} ({lastTrade.pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Duración:</span>{' '}
                    <span className="text-white">{lastTrade.duration} días</span>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
