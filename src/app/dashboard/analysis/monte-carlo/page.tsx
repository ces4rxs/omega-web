"use client"

import { useState } from "react"
import { ProFeature } from "@/components/pro-feature"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { api } from "@/lib/api"
import type { MonteCarloResult } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MetricCard } from "@/components/metric-card"

export default function MonteCarloPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MonteCarloResult | null>(null)
  const [simulations, setSimulations] = useState(300) // MAX 300
  const [backtestId, setBacktestId] = useState('')

  const handleRun = async () => {
    if (!backtestId) {
      alert('Please enter a backtest ID')
      return
    }

    setLoading(true)
    try {
      const data = await api.get<MonteCarloResult>(
        `/ai/montecarlo?backtestId=${backtestId}&simulations=${Math.min(simulations, 300)}`
      )
      setResult(data)
    } catch (err: any) {
      alert(err.message || 'Failed to run Monte Carlo simulation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProFeature feature="Monte Carlo Analysis">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Monte Carlo Simulation</h1>
          <p className="text-gray-400">
            Analyze probability distributions of backtest results
          </p>
        </div>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Simulation Configuration</CardTitle>
            <CardDescription>
              Run Monte Carlo simulations to assess strategy robustness (Max: 300 simulations)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backtestId">Backtest ID</Label>
              <Input
                id="backtestId"
                value={backtestId}
                onChange={(e) => setBacktestId(e.target.value)}
                placeholder="Enter backtest ID"
              />
            </div>

            <div className="space-y-2">
              <Label>Number of Simulations: {simulations}</Label>
              <Slider
                min={50}
                max={300}
                step={50}
                value={simulations}
                onValueChange={setSimulations}
              />
              <p className="text-xs text-gray-400">Maximum: 300 simulations</p>
            </div>

            <Button onClick={handleRun} disabled={loading} className="w-full">
              {loading ? 'Running...' : 'Run Monte Carlo Simulation'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
              <MetricCard
                title="Mean Return"
                value={result.statistics.mean}
                formatAsPercent
              />
              <MetricCard
                title="Median Return"
                value={result.statistics.median}
                formatAsPercent
              />
              <MetricCard
                title="Std Deviation"
                value={result.statistics.stdDev}
                formatAsPercent
              />
              <MetricCard
                title="5th Percentile"
                value={result.statistics.percentile5}
                formatAsPercent
              />
              <MetricCard
                title="95th Percentile"
                value={result.statistics.percentile95}
                formatAsPercent
              />
            </div>

            {/* Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Return Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={createHistogram(result.simulations.map(s => s.finalEquity))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="range"
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProFeature>
  )
}

// Helper to create histogram data
function createHistogram(values: number[], bins = 20) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const binSize = (max - min) / bins

  const histogram = Array.from({ length: bins }, (_, i) => {
    const rangeStart = min + i * binSize
    const rangeEnd = rangeStart + binSize
    const count = values.filter(v => v >= rangeStart && v < rangeEnd).length

    return {
      range: `${rangeStart.toFixed(0)}-${rangeEnd.toFixed(0)}`,
      count
    }
  })

  return histogram
}
