"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { api } from "@/lib/api"
import type { BacktestParams, BacktestResult, BuiltInStrategy } from "@/lib/types"
import { EquityCurve } from "@/components/charts/equity-curve"
import { MetricCard } from "@/components/metric-card"
import { TradeTable } from "@/components/trade-table"
import { Activity, TrendingUp, TrendingDown, Target, Percent, DollarSign } from "lucide-react"

export default function BacktestPage() {
  const [strategies, setStrategies] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<BacktestParams>({
    strategy: 'smaCrossover',
    symbol: 'AAPL',
    timeframe: '1d',
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    initialCapital: 10000,
    parameters: {}
  })

  // Strategy parameters (simplified - you can expand this)
  const [strategyParams, setStrategyParams] = useState({
    fastPeriod: 10,
    slowPeriod: 30,
    rsiPeriod: 14,
    rsiOverbought: 70,
    rsiOversold: 30
  })

  // Load available strategies
  useEffect(() => {
    const loadStrategies = async () => {
      try {
        const response = await api.get<{ strategies: any }>('/api/backtest/strategies')
        // Handle both string[] and object[] responses
        if (Array.isArray(response.strategies)) {
          const strategyNames = response.strategies.map((s: any) =>
            typeof s === 'string' ? s : (s.id || s.name || s)
          )
          setStrategies(strategyNames)
        } else {
          setStrategies(['smaCrossover', 'rsiMeanRevert', 'trend'])
        }
      } catch (err) {
        console.error('Error loading strategies:', err)
        setStrategies(['smaCrossover', 'rsiMeanRevert', 'trend'])
      }
    }
    loadStrategies()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Build parameters based on strategy
      let parameters: Record<string, any> = {}
      if (formData.strategy === 'smaCrossover') {
        parameters = {
          fastPeriod: strategyParams.fastPeriod,
          slowPeriod: strategyParams.slowPeriod
        }
      } else if (formData.strategy === 'rsiMeanRevert') {
        parameters = {
          rsiPeriod: strategyParams.rsiPeriod,
          overbought: strategyParams.rsiOverbought,
          oversold: strategyParams.rsiOversold
        }
      }

      const backtestData = await api.post<BacktestResult>('/api/backtest', {
        ...formData,
        parameters
      })

      setResult(backtestData)
    } catch (err: any) {
      setError(err.message || 'Failed to run backtest')
      console.error('Backtest error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Backtest Strategy</h1>
        <p className="text-gray-400">Test your trading strategies with real historical data</p>
      </div>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Backtest Configuration</CardTitle>
          <CardDescription>Configure your backtest parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strategy Selection */}
              <div className="space-y-2">
                <Label htmlFor="strategy">Strategy</Label>
                <Select
                  id="strategy"
                  value={formData.strategy}
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                >
                  {strategies.map((s, idx) => (
                    <option key={`${s}-${idx}`} value={s}>
                      {typeof s === 'string' ? s : JSON.stringify(s)}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Symbol */}
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  placeholder="AAPL, TSLA, BTC..."
                />
              </div>

              {/* Timeframe */}
              <div className="space-y-2">
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select
                  id="timeframe"
                  value={formData.timeframe}
                  onChange={(e) => setFormData({ ...formData, timeframe: e.target.value as any })}
                >
                  <option value="1min">1 Minute</option>
                  <option value="5min">5 Minutes</option>
                  <option value="15min">15 Minutes</option>
                  <option value="1h">1 Hour</option>
                  <option value="1d">1 Day</option>
                </Select>
              </div>

              {/* Initial Capital */}
              <div className="space-y-2">
                <Label htmlFor="capital">Initial Capital</Label>
                <Input
                  id="capital"
                  type="number"
                  value={formData.initialCapital}
                  onChange={(e) => setFormData({ ...formData, initialCapital: Number(e.target.value) })}
                />
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Strategy Parameters */}
            {formData.strategy === 'smaCrossover' && (
              <div className="space-y-4 p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-300">SMA Crossover Parameters</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Fast Period: {strategyParams.fastPeriod}</Label>
                    <Slider
                      min={5}
                      max={50}
                      step={1}
                      value={strategyParams.fastPeriod}
                      onValueChange={(val) => setStrategyParams({ ...strategyParams, fastPeriod: val })}
                    />
                  </div>
                  <div>
                    <Label>Slow Period: {strategyParams.slowPeriod}</Label>
                    <Slider
                      min={20}
                      max={200}
                      step={5}
                      value={strategyParams.slowPeriod}
                      onValueChange={(val) => setStrategyParams({ ...strategyParams, slowPeriod: val })}
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.strategy === 'rsiMeanRevert' && (
              <div className="space-y-4 p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-300">RSI Mean Reversion Parameters</h4>
                <div className="space-y-4">
                  <div>
                    <Label>RSI Period: {strategyParams.rsiPeriod}</Label>
                    <Slider
                      min={7}
                      max={28}
                      step={1}
                      value={strategyParams.rsiPeriod}
                      onValueChange={(val) => setStrategyParams({ ...strategyParams, rsiPeriod: val })}
                    />
                  </div>
                  <div>
                    <Label>Overbought: {strategyParams.rsiOverbought}</Label>
                    <Slider
                      min={60}
                      max={90}
                      step={5}
                      value={strategyParams.rsiOverbought}
                      onValueChange={(val) => setStrategyParams({ ...strategyParams, rsiOverbought: val })}
                    />
                  </div>
                  <div>
                    <Label>Oversold: {strategyParams.rsiOversold}</Label>
                    <Slider
                      min={10}
                      max={40}
                      step={5}
                      value={strategyParams.rsiOversold}
                      onValueChange={(val) => setStrategyParams({ ...strategyParams, rsiOversold: val })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Running Backtest...' : 'Run Backtest'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500/50">
          <CardContent className="pt-6">
            <p className="text-red-400">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Return"
              value={result.backtest.performance.totalReturn}
              formatAsPercent
              trend={result.backtest.performance.totalReturn >= 0 ? 'up' : 'down'}
              icon={<Percent className="w-4 h-4" />}
            />
            <MetricCard
              title="CAGR"
              value={result.backtest.performance.cagr}
              formatAsPercent
              trend={result.backtest.performance.cagr >= 0 ? 'up' : 'down'}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <MetricCard
              title="Sharpe Ratio"
              value={result.backtest.performance.sharpeRatio}
              icon={<Target className="w-4 h-4" />}
            />
            <MetricCard
              title="Max Drawdown"
              value={result.backtest.performance.maxDrawdown}
              formatAsPercent
              trend="down"
              icon={<TrendingDown className="w-4 h-4" />}
            />
            <MetricCard
              title="Win Rate"
              value={result.backtest.performance.winRate}
              formatAsPercent
              icon={<Activity className="w-4 h-4" />}
            />
            <MetricCard
              title="Profit Factor"
              value={result.backtest.performance.profitFactor}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <MetricCard
              title="Total Trades"
              value={result.backtest.performance.totalTrades}
              icon={<Activity className="w-4 h-4" />}
            />
            <MetricCard
              title="Expectancy"
              value={result.backtest.performance.expectancy}
              formatAsCurrency
              trend={result.backtest.performance.expectancy >= 0 ? 'up' : 'down'}
              icon={<DollarSign className="w-4 h-4" />}
            />
          </div>

          {/* Equity Curve */}
          <EquityCurve data={result.backtest.equityCurve} />

          {/* Trade History */}
          <TradeTable trades={result.backtest.trades} maxRows={20} />
        </div>
      )}
    </div>
  )
}
