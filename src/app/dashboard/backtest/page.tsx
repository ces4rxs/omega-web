"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { CardSkeleton, ChartSkeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import { api } from "@/lib/api"
import type { BacktestParams, BacktestResult } from "@/lib/types"
import { EquityCurve } from "@/components/charts/equity-curve"
import { DrawdownChart } from "@/components/charts/drawdown-chart"
import { ReturnsDistribution } from "@/components/charts/returns-distribution"
import { MetricCard } from "@/components/metric-card"
import { TradeTable } from "@/components/trade-table"
import { Activity, TrendingUp, TrendingDown, Target, Percent, DollarSign, Play, Download, Sparkles } from "lucide-react"

// Mapeo de timeframes del frontend al backend
const timeframeMap: Record<string, string> = {
  '1min': 'minute',
  '5min': 'minute',
  '15min': 'minute',
  '1h': 'hour',
  '4h': 'hour',
  '1d': 'day',
  '1w': 'week',
  '1M': 'month'
}

export default function BacktestPage() {
  const [strategies, setStrategies] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingStrategies, setLoadingStrategies] = useState(true)
  const [result, setResult] = useState<BacktestResult | null>(null)
  const { addToast } = useToast()

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

  // Strategy parameters
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
      setLoadingStrategies(true)
      try {
        const response = await api.get<{ strategies: any }>('/api/backtest/strategies')
        if (Array.isArray(response.strategies)) {
          const strategyNames = response.strategies.map((s: any) =>
            typeof s === 'string' ? s : (s.id || s.name || s)
          )
          setStrategies(strategyNames)
          addToast({
            title: "Estrategias cargadas",
            description: `${strategyNames.length} estrategias disponibles`,
            type: "success",
            duration: 2000
          })
        } else {
          setStrategies(['smaCrossover', 'rsiMeanRevert', 'trend'])
        }
      } catch (err) {
        console.error('Error loading strategies:', err)
        setStrategies(['smaCrossover', 'rsiMeanRevert', 'trend'])
        addToast({
          title: "Error al cargar estrategias",
          description: "Usando estrategias predeterminadas",
          type: "warning",
          duration: 3000
        })
      } finally {
        setLoadingStrategies(false)
      }
    }
    loadStrategies()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    addToast({
      title: "Iniciando backtest",
      description: `Probando estrategia ${formData.strategy} en ${formData.symbol}`,
      type: "info",
      duration: 2000
    })

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

      // Convertir timeframe al formato del backend
      const backendTimeframe = timeframeMap[formData.timeframe] || formData.timeframe

      const backtestData = await api.post<BacktestResult>('/api/backtest', {
        ...formData,
        timeframe: backendTimeframe,
        parameters
      })

      setResult(backtestData)

      const totalReturn = backtestData.backtest.performance.totalReturn
      addToast({
        title: "¡Backtest completado!",
        description: `Retorno total: ${(totalReturn * 100).toFixed(2)}%`,
        type: totalReturn >= 0 ? "success" : "warning",
        duration: 4000
      })
    } catch (err: any) {
      addToast({
        title: "Error en backtest",
        description: err.message || 'No se pudo ejecutar el backtest',
        type: "error",
        duration: 5000
      })
      console.error('Backtest error:', err)
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            Backtest Strategy
          </h1>
        </div>
        <p className="text-gray-400">Prueba tus estrategias con datos históricos reales</p>
      </motion.div>

      {/* Configuration Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Backtest</CardTitle>
            <CardDescription>Configura los parámetros de tu backtest</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strategy Selection */}
                <div className="space-y-2">
                  <Label htmlFor="strategy">Estrategia</Label>
                  {loadingStrategies ? (
                    <div className="h-10 bg-white/10 rounded-md animate-skeleton-pulse" />
                  ) : (
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
                  )}
                </div>

                {/* Symbol */}
                <div className="space-y-2">
                  <Label htmlFor="symbol">Símbolo</Label>
                  <Input
                    id="symbol"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    placeholder="AAPL, TSLA, BTC..."
                    className="uppercase"
                  />
                </div>

                {/* Timeframe */}
                <div className="space-y-2">
                  <Label htmlFor="timeframe">Temporalidad</Label>
                  <Select
                    id="timeframe"
                    value={formData.timeframe}
                    onChange={(e) => setFormData({ ...formData, timeframe: e.target.value as any })}
                  >
                    <option value="1min">1 Minuto</option>
                    <option value="5min">5 Minutos</option>
                    <option value="15min">15 Minutos</option>
                    <option value="1h">1 Hora</option>
                    <option value="1d">1 Día</option>
                  </Select>
                </div>

                {/* Initial Capital */}
                <div className="space-y-2">
                  <Label htmlFor="capital">Capital Inicial</Label>
                  <Input
                    id="capital"
                    type="number"
                    value={formData.initialCapital}
                    onChange={(e) => setFormData({ ...formData, initialCapital: Number(e.target.value) })}
                  />
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha Inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha Fin</Label>
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
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20"
                >
                  <h4 className="font-semibold text-sm text-blue-300 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Parámetros SMA Crossover
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <Label>Período Rápido: {strategyParams.fastPeriod}</Label>
                      <Slider
                        min={5}
                        max={50}
                        step={1}
                        value={strategyParams.fastPeriod}
                        onValueChange={(val) => setStrategyParams({ ...strategyParams, fastPeriod: val })}
                      />
                    </div>
                    <div>
                      <Label>Período Lento: {strategyParams.slowPeriod}</Label>
                      <Slider
                        min={20}
                        max={200}
                        step={5}
                        value={strategyParams.slowPeriod}
                        onValueChange={(val) => setStrategyParams({ ...strategyParams, slowPeriod: val })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {formData.strategy === 'rsiMeanRevert' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20"
                >
                  <h4 className="font-semibold text-sm text-purple-300 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Parámetros RSI Mean Reversion
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <Label>Período RSI: {strategyParams.rsiPeriod}</Label>
                      <Slider
                        min={7}
                        max={28}
                        step={1}
                        value={strategyParams.rsiPeriod}
                        onValueChange={(val) => setStrategyParams({ ...strategyParams, rsiPeriod: val })}
                      />
                    </div>
                    <div>
                      <Label>Sobrecompra: {strategyParams.rsiOverbought}</Label>
                      <Slider
                        min={60}
                        max={90}
                        step={5}
                        value={strategyParams.rsiOverbought}
                        onValueChange={(val) => setStrategyParams({ ...strategyParams, rsiOverbought: val })}
                      />
                    </div>
                    <div>
                      <Label>Sobreventa: {strategyParams.rsiOversold}</Label>
                      <Slider
                        min={10}
                        max={40}
                        step={5}
                        value={strategyParams.rsiOversold}
                        onValueChange={(val) => setStrategyParams({ ...strategyParams, rsiOversold: val })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || loadingStrategies}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all"
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Ejecutando Backtest...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Ejecutar Backtest
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          <ChartSkeleton />
          <ChartSkeleton />
        </motion.div>
      )}

      {/* Results */}
      {result && !loading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Action Bar */}
          <motion.div variants={itemVariants} className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Resultados del Backtest</h2>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar Reporte
            </Button>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Retorno Total"
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
          </motion.div>

          {/* Charts Row 1 */}
          <motion.div variants={itemVariants}>
            <EquityCurve data={result.backtest.equityCurve} />
          </motion.div>

          {/* Charts Row 2 */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
            <DrawdownChart data={result.backtest.equityCurve} />
            <ReturnsDistribution trades={result.backtest.trades} />
          </motion.div>

          {/* Trade History */}
          <motion.div variants={itemVariants}>
            <TradeTable trades={result.backtest.trades} maxRows={20} />
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
