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
import { UnderwaterChart } from "@/components/charts/underwater-chart"
import { CandlestickChart } from "@/components/charts/candlestick-chart"
import { RSIChart } from "@/components/charts/rsi-chart"
import { MACDChart } from "@/components/charts/macd-chart"
import { BollingerBandsChart } from "@/components/charts/bollinger-bands-chart"
import { ATRChart } from "@/components/charts/atr-chart"
import { StochasticChart } from "@/components/charts/stochastic-chart"
import { BacktestReplay } from "@/components/backtest-replay"
import { PerformanceHeatmap, MonthlyPerformanceHeatmap } from "@/components/performance-heatmap"
import { MetricCard } from "@/components/metric-card"
import { TradeTable } from "@/components/trade-table"
import { RiskAlerts } from "@/components/risk-alerts"
import { RiskTooltip, RISK_TOOLTIPS } from "@/components/risk-tooltip"
import { RiskCalculator } from "@/components/risk-calculator"
import { RiskAIAdvisor } from "@/components/risk-ai-advisor"
import { AIInsights } from "@/components/ai/ai-insights"
import { QuantumRisk } from "@/components/ai/quantum-risk"
import { AIOptimizer } from "@/components/ai/ai-optimizer"
import { PredictiveScore } from "@/components/ai/predictive-score"
import { Activity, TrendingUp, TrendingDown, Target, Percent, DollarSign, Play, Download, Sparkles, FileText, Crown, Brain, Shield, ChevronDown, ChevronUp } from "lucide-react"
import { transformBacktestResponse } from "@/lib/transformBacktest"
import { polygonService } from "@/lib/polygon"
import { exportBacktestToPDF } from "@/lib/pdf-export"
import type { CandlestickData } from "lightweight-charts"
import { useTier } from "@/hooks/use-tier"
import { SymbolLogo } from "@/components/symbol-logo"

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
  const { canUseAI, canUsePredictiveAI, isProfessional, isEnterprise } = useTier()
  const [strategies, setStrategies] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingStrategies, setLoadingStrategies] = useState(true)
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([])
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

  // Risk Management state
  const [showRiskManagement, setShowRiskManagement] = useState(false)
  const [riskManagement, setRiskManagement] = useState({
    enableCommission: true,
    commission: 0.50,
    enableSlippage: true,
    slippage: 0.05,
    enableStopLoss: false,
    stopLoss: 2.0,
    enableTakeProfit: false,
    takeProfit: 5.0,
    enablePositionSizing: false,
    positionSize: 100,
    maxPositions: 1,
    // Advanced risk controls
    enableTrailingStop: false,
    trailingStopDistance: 1.5,
    enableDailyLossLimit: false,
    dailyLossLimit: 5.0,
    enableMaxDrawdownLimit: false,
    maxDrawdownLimit: 15.0,
    enableRiskPerTrade: false,
    riskPerTrade: 2.0,
    enableVolatilitySizing: false,
    atrPeriod: 14,
    atrMultiplier: 2.0
  })

  // Date preset helper function
  const setDatePreset = (preset: 'lastMonth' | 'last3Months' | 'last6Months' | 'lastYear' | 'ytd') => {
    const today = new Date()
    const endDate = today.toISOString().split('T')[0]
    let startDate = ''

    switch (preset) {
      case 'lastMonth':
        startDate = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0]
        break
      case 'last3Months':
        startDate = new Date(today.setMonth(today.getMonth() - 3)).toISOString().split('T')[0]
        break
      case 'last6Months':
        startDate = new Date(today.setMonth(today.getMonth() - 6)).toISOString().split('T')[0]
        break
      case 'lastYear':
        startDate = new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split('T')[0]
        break
      case 'ytd':
        startDate = `${new Date().getFullYear()}-01-01`
        break
    }

    setFormData({ ...formData, startDate, endDate })
  }

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
        } else {
          setStrategies(['smaCrossover', 'rsiMeanRevert', 'trend'])
        }
      } catch (err) {
        console.error('Error loading strategies:', err)
        setStrategies(['smaCrossover', 'rsiMeanRevert', 'trend'])
      } finally {
        setLoadingStrategies(false)
      }
    }
    loadStrategies()
  }, [])

  // Cargar datos de candlestick cuando haya resultados
  useEffect(() => {
    const loadCandlestickData = async () => {
      if (!result) {
        setCandlestickData([])
        return
      }

      try {
        const ohlcData = await polygonService.getOHLC(
          formData.symbol,
          formData.timeframe,
          formData.startDate,
          formData.endDate
        )

        // Convertir a formato de lightweight-charts
        const candleData: CandlestickData[] = ohlcData.map(bar => ({
          time: (bar.time / 1000) as any,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
        }))

        setCandlestickData(candleData)
      } catch (error) {
        console.error('Error cargando candlestick data:', error)
      }
    }

    loadCandlestickData()
  }, [result, formData.symbol, formData.timeframe, formData.startDate, formData.endDate])

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

      // Build risk management parameters
      const riskManagementParams: any = {}
      if (riskManagement.enableCommission) {
        riskManagementParams.commission = riskManagement.commission
      }
      if (riskManagement.enableSlippage) {
        riskManagementParams.slippage = riskManagement.slippage
      }
      if (riskManagement.enableStopLoss) {
        riskManagementParams.stopLoss = riskManagement.stopLoss
      }
      if (riskManagement.enableTakeProfit) {
        riskManagementParams.takeProfit = riskManagement.takeProfit
      }
      if (riskManagement.enablePositionSizing) {
        riskManagementParams.positionSize = riskManagement.positionSize
        riskManagementParams.maxPositions = riskManagement.maxPositions
      }

      const rawBacktestData = await api.post<any>('/api/backtest', {
        ...formData,
        timeframe: backendTimeframe,
        parameters,
        riskManagement: Object.keys(riskManagementParams).length > 0 ? riskManagementParams : undefined
      })

      // Transformar trades raw del backend al formato esperado
      const backtestData = transformBacktestResponse(rawBacktestData, formData.symbol)

      setResult(backtestData as BacktestResult)

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
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Backtest Strategy
              </h1>
              {(isProfessional || isEnterprise) && (
                <span className="text-xs px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  AI Powered
                </span>
              )}
            </div>
            <p className="text-gray-400">
              {canUseAI
                ? 'Prueba tus estrategias con análisis de IA avanzado'
                : 'Prueba tus estrategias con datos históricos reales'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Predictive Score - ENTERPRISE ONLY (Before Backtest) */}
      {canUsePredictiveAI && !result && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <PredictiveScore
            strategy={formData.strategy}
            symbol={formData.symbol}
            timeframe={formData.timeframe}
            parameters={
              formData.strategy === 'smaCrossover'
                ? { fastPeriod: strategyParams.fastPeriod, slowPeriod: strategyParams.slowPeriod }
                : { rsiPeriod: strategyParams.rsiPeriod, overbought: strategyParams.rsiOverbought, oversold: strategyParams.rsiOversold }
            }
          />
        </motion.div>
      )}

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
                  <div className="flex items-center gap-3">
                    {formData.symbol && formData.symbol.length >= 1 && (
                      <SymbolLogo symbol={formData.symbol} size="lg" />
                    )}
                    <Input
                      id="symbol"
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                      placeholder="AAPL, TSLA, BTC..."
                      className="uppercase flex-1"
                    />
                  </div>
                  {/* Quick Symbol Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'NVDA', 'META', 'AMZN'].map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => setFormData({ ...formData, symbol: sym })}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                          formData.symbol === sym
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
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

              {/* Date Presets */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-400 self-center mr-2">Períodos rápidos:</span>
                {[
                  { label: '1 Mes', value: 'lastMonth' as const },
                  { label: '3 Meses', value: 'last3Months' as const },
                  { label: '6 Meses', value: 'last6Months' as const },
                  { label: '1 Año', value: 'lastYear' as const },
                  { label: 'YTD', value: 'ytd' as const },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setDatePreset(preset.value)}
                    className="px-3 py-1 rounded-md text-xs font-medium bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Risk Management Section */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowRiskManagement(!showRiskManagement)}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/30 hover:border-orange-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        Risk Management
                        <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">
                          Profesional
                        </span>
                      </h4>
                      <p className="text-xs text-gray-400">
                        Comisiones, Slippage, Stop Loss, Take Profit
                      </p>
                    </div>
                  </div>
                  {showRiskManagement ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  )}
                </button>

                {showRiskManagement && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 p-4 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-lg border border-orange-500/20"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Commission */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Label className="text-sm text-gray-300">Comisión por Trade</Label>
                            <RiskTooltip {...RISK_TOOLTIPS.commission} />
                          </div>
                          <button
                            type="button"
                            onClick={() => setRiskManagement({ ...riskManagement, enableCommission: !riskManagement.enableCommission })}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                              riskManagement.enableCommission
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {riskManagement.enableCommission ? 'ON' : 'OFF'}
                          </button>
                        </div>
                        {riskManagement.enableCommission && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={riskManagement.commission}
                              onChange={(e) => setRiskManagement({ ...riskManagement, commission: Number(e.target.value) })}
                              className="flex-1"
                            />
                            <span className="text-xs text-gray-500">por trade</span>
                          </div>
                        )}
                      </div>

                      {/* Slippage */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Label className="text-sm text-gray-300">Slippage</Label>
                            <RiskTooltip {...RISK_TOOLTIPS.slippage} />
                          </div>
                          <button
                            type="button"
                            onClick={() => setRiskManagement({ ...riskManagement, enableSlippage: !riskManagement.enableSlippage })}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                              riskManagement.enableSlippage
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {riskManagement.enableSlippage ? 'ON' : 'OFF'}
                          </button>
                        </div>
                        {riskManagement.enableSlippage && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={riskManagement.slippage}
                              onChange={(e) => setRiskManagement({ ...riskManagement, slippage: Number(e.target.value) })}
                              className="flex-1"
                            />
                            <span className="text-xs text-gray-500">%</span>
                          </div>
                        )}
                      </div>

                      {/* Stop Loss */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Label className="text-sm text-gray-300">Stop Loss</Label>
                            <RiskTooltip {...RISK_TOOLTIPS.stopLoss} />
                          </div>
                          <button
                            type="button"
                            onClick={() => setRiskManagement({ ...riskManagement, enableStopLoss: !riskManagement.enableStopLoss })}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                              riskManagement.enableStopLoss
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {riskManagement.enableStopLoss ? 'ON' : 'OFF'}
                          </button>
                        </div>
                        {riskManagement.enableStopLoss && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.1"
                              value={riskManagement.stopLoss}
                              onChange={(e) => setRiskManagement({ ...riskManagement, stopLoss: Number(e.target.value) })}
                              className="flex-1"
                            />
                            <span className="text-xs text-gray-500">%</span>
                          </div>
                        )}
                      </div>

                      {/* Take Profit */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Label className="text-sm text-gray-300">Take Profit</Label>
                            <RiskTooltip {...RISK_TOOLTIPS.takeProfit} />
                          </div>
                          <button
                            type="button"
                            onClick={() => setRiskManagement({ ...riskManagement, enableTakeProfit: !riskManagement.enableTakeProfit })}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                              riskManagement.enableTakeProfit
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {riskManagement.enableTakeProfit ? 'ON' : 'OFF'}
                          </button>
                        </div>
                        {riskManagement.enableTakeProfit && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.1"
                              value={riskManagement.takeProfit}
                              onChange={(e) => setRiskManagement({ ...riskManagement, takeProfit: Number(e.target.value) })}
                              className="flex-1"
                            />
                            <span className="text-xs text-gray-500">%</span>
                          </div>
                        )}
                      </div>

                      {/* Position Sizing */}
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm text-gray-300">Position Sizing</Label>
                          <button
                            type="button"
                            onClick={() => setRiskManagement({ ...riskManagement, enablePositionSizing: !riskManagement.enablePositionSizing })}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                              riskManagement.enablePositionSizing
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {riskManagement.enablePositionSizing ? 'ON' : 'OFF'}
                          </button>
                        </div>
                        {riskManagement.enablePositionSizing && (
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-400">Porcentaje del capital por trade</span>
                                <span className="text-sm font-semibold text-white">{riskManagement.positionSize}%</span>
                              </div>
                              <Slider
                                min={1}
                                max={100}
                                step={1}
                                value={riskManagement.positionSize}
                                onValueChange={(val) => setRiskManagement({ ...riskManagement, positionSize: val })}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-gray-400 whitespace-nowrap">Posiciones máximas:</Label>
                              <Input
                                type="number"
                                min={1}
                                value={riskManagement.maxPositions}
                                onChange={(e) => setRiskManagement({ ...riskManagement, maxPositions: Number(e.target.value) })}
                                className="w-20"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Advanced Risk Controls */}
                      <div className="md:col-span-2 mt-4 p-4 bg-gradient-to-br from-purple-900/10 to-blue-900/10 rounded-lg border border-purple-500/20">
                        <h5 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Controles Avanzados
                        </h5>

                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Trailing Stop */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Label className="text-sm text-gray-300">Trailing Stop</Label>
                                <RiskTooltip {...RISK_TOOLTIPS.trailingStop} />
                              </div>
                              <button
                                type="button"
                                onClick={() => setRiskManagement({ ...riskManagement, enableTrailingStop: !riskManagement.enableTrailingStop })}
                                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                                  riskManagement.enableTrailingStop
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}
                              >
                                {riskManagement.enableTrailingStop ? 'ON' : 'OFF'}
                              </button>
                            </div>
                            {riskManagement.enableTrailingStop && (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={riskManagement.trailingStopDistance}
                                  onChange={(e) => setRiskManagement({ ...riskManagement, trailingStopDistance: Number(e.target.value) })}
                                  className="flex-1"
                                />
                                <span className="text-xs text-gray-500">%</span>
                              </div>
                            )}
                          </div>

                          {/* Daily Loss Limit */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Label className="text-sm text-gray-300">Daily Loss Limit</Label>
                                <RiskTooltip {...RISK_TOOLTIPS.dailyLossLimit} />
                              </div>
                              <button
                                type="button"
                                onClick={() => setRiskManagement({ ...riskManagement, enableDailyLossLimit: !riskManagement.enableDailyLossLimit })}
                                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                                  riskManagement.enableDailyLossLimit
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}
                              >
                                {riskManagement.enableDailyLossLimit ? 'ON' : 'OFF'}
                              </button>
                            </div>
                            {riskManagement.enableDailyLossLimit && (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  step="0.5"
                                  value={riskManagement.dailyLossLimit}
                                  onChange={(e) => setRiskManagement({ ...riskManagement, dailyLossLimit: Number(e.target.value) })}
                                  className="flex-1"
                                />
                                <span className="text-xs text-gray-500">%</span>
                              </div>
                            )}
                          </div>

                          {/* Max Drawdown Limit */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Label className="text-sm text-gray-300">Max Drawdown Limit</Label>
                                <RiskTooltip {...RISK_TOOLTIPS.maxDrawdownLimit} />
                              </div>
                              <button
                                type="button"
                                onClick={() => setRiskManagement({ ...riskManagement, enableMaxDrawdownLimit: !riskManagement.enableMaxDrawdownLimit })}
                                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                                  riskManagement.enableMaxDrawdownLimit
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}
                              >
                                {riskManagement.enableMaxDrawdownLimit ? 'ON' : 'OFF'}
                              </button>
                            </div>
                            {riskManagement.enableMaxDrawdownLimit && (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  step="1"
                                  value={riskManagement.maxDrawdownLimit}
                                  onChange={(e) => setRiskManagement({ ...riskManagement, maxDrawdownLimit: Number(e.target.value) })}
                                  className="flex-1"
                                />
                                <span className="text-xs text-gray-500">%</span>
                              </div>
                            )}
                          </div>

                          {/* Risk Per Trade */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Label className="text-sm text-gray-300">Risk Per Trade</Label>
                                <RiskTooltip {...RISK_TOOLTIPS.riskPerTrade} />
                              </div>
                              <button
                                type="button"
                                onClick={() => setRiskManagement({ ...riskManagement, enableRiskPerTrade: !riskManagement.enableRiskPerTrade })}
                                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                                  riskManagement.enableRiskPerTrade
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}
                              >
                                {riskManagement.enableRiskPerTrade ? 'ON' : 'OFF'}
                              </button>
                            </div>
                            {riskManagement.enableRiskPerTrade && (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  step="0.5"
                                  value={riskManagement.riskPerTrade}
                                  onChange={(e) => setRiskManagement({ ...riskManagement, riskPerTrade: Number(e.target.value) })}
                                  className="flex-1"
                                />
                                <span className="text-xs text-gray-500">% capital</span>
                              </div>
                            )}
                          </div>

                          {/* Volatility-Based Sizing */}
                          <div className="space-y-2 md:col-span-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Label className="text-sm text-gray-300">Volatility-Based Sizing (ATR)</Label>
                                <RiskTooltip {...RISK_TOOLTIPS.volatilitySizing} />
                              </div>
                              <button
                                type="button"
                                onClick={() => setRiskManagement({ ...riskManagement, enableVolatilitySizing: !riskManagement.enableVolatilitySizing })}
                                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                                  riskManagement.enableVolatilitySizing
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}
                              >
                                {riskManagement.enableVolatilitySizing ? 'ON' : 'OFF'}
                              </button>
                            </div>
                            {riskManagement.enableVolatilitySizing && (
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs text-gray-400">ATR Period:</Label>
                                  <Input
                                    type="number"
                                    min={1}
                                    value={riskManagement.atrPeriod}
                                    onChange={(e) => setRiskManagement({ ...riskManagement, atrPeriod: Number(e.target.value) })}
                                    className="w-20"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs text-gray-400">Multiplier:</Label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={riskManagement.atrMultiplier}
                                    onChange={(e) => setRiskManagement({ ...riskManagement, atrMultiplier: Number(e.target.value) })}
                                    className="w-20"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Risk Calculator - Dynamic Impact */}
                    <RiskCalculator
                      capital={formData.initialCapital || 10000}
                      riskManagement={riskManagement}
                    />
                  </motion.div>
                )}

                {/* AI Risk Advisor - Professional & Enterprise Only */}
                {showRiskManagement && (
                  <RiskAIAdvisor
                    riskManagement={riskManagement}
                    capital={formData.initialCapital || 10000}
                  />
                )}
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

      {/* AI Optimizer - PROFESSIONAL (Before Results) */}
      {canUseAI && !result && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AIOptimizer
            strategy={formData.strategy}
            symbol={formData.symbol}
            timeframe={formData.timeframe}
            dateRange={{
              startDate: formData.startDate,
              endDate: formData.endDate
            }}
            currentParameters={
              formData.strategy === 'smaCrossover'
                ? [
                    { name: 'fastPeriod', currentValue: strategyParams.fastPeriod, min: 5, max: 50, step: 1 },
                    { name: 'slowPeriod', currentValue: strategyParams.slowPeriod, min: 20, max: 200, step: 5 }
                  ]
                : [
                    { name: 'rsiPeriod', currentValue: strategyParams.rsiPeriod, min: 7, max: 28, step: 1 },
                    { name: 'overbought', currentValue: strategyParams.rsiOverbought, min: 60, max: 90, step: 5 },
                    { name: 'oversold', currentValue: strategyParams.rsiOversold, min: 10, max: 40, step: 5 }
                  ]
            }
            onOptimized={(params) => {
              // Apply optimized parameters
              if (formData.strategy === 'smaCrossover') {
                setStrategyParams({
                  ...strategyParams,
                  fastPeriod: params.fastPeriod,
                  slowPeriod: params.slowPeriod
                })
              } else {
                setStrategyParams({
                  ...strategyParams,
                  rsiPeriod: params.rsiPeriod,
                  rsiOverbought: params.overbought,
                  rsiOversold: params.oversold
                })
              }
            }}
          />
        </motion.div>
      )}

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
            <div className="flex items-center gap-3">
              <SymbolLogo symbol={formData.symbol} size="lg" />
              <div>
                <h2 className="text-2xl font-bold text-white">Resultados del Backtest</h2>
                <p className="text-sm text-gray-400">{formData.symbol} · {formData.strategy}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportBacktestToPDF(result, formData.symbol, formData.strategy)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Exportar PDF
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

          {/* Advanced Risk Metrics */}
          {(result.backtest.performance.sortinoRatio !== undefined || result.backtest.performance.riskRewardRatio !== undefined) && (
            <motion.div variants={itemVariants} className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-white">Métricas Avanzadas de Riesgo</h3>
              </div>
              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                {result.backtest.performance.sortinoRatio !== undefined && (
                  <MetricCard
                    title="Sortino Ratio"
                    value={result.backtest.performance.sortinoRatio}
                    icon={<Target className="w-4 h-4" />}
                  />
                )}
                {result.backtest.performance.calmarRatio !== undefined && (
                  <MetricCard
                    title="Calmar Ratio"
                    value={result.backtest.performance.calmarRatio}
                    icon={<TrendingUp className="w-4 h-4" />}
                  />
                )}
                {result.backtest.performance.recoveryFactor !== undefined && (
                  <MetricCard
                    title="Recovery Factor"
                    value={result.backtest.performance.recoveryFactor}
                    icon={<Activity className="w-4 h-4" />}
                  />
                )}
                {result.backtest.performance.riskRewardRatio !== undefined && (
                  <MetricCard
                    title="Risk/Reward"
                    value={result.backtest.performance.riskRewardRatio}
                    icon={<Target className="w-4 h-4" />}
                  />
                )}
                {result.backtest.performance.avgWin !== undefined && (
                  <MetricCard
                    title="Avg Win"
                    value={result.backtest.performance.avgWin}
                    formatAsCurrency
                    trend="up"
                    icon={<TrendingUp className="w-4 h-4" />}
                  />
                )}
                {result.backtest.performance.avgLoss !== undefined && (
                  <MetricCard
                    title="Avg Loss"
                    value={result.backtest.performance.avgLoss}
                    formatAsCurrency
                    trend="down"
                    icon={<TrendingDown className="w-4 h-4" />}
                  />
                )}
                {result.backtest.performance.largestWin !== undefined && (
                  <MetricCard
                    title="Largest Win"
                    value={result.backtest.performance.largestWin}
                    formatAsCurrency
                    trend="up"
                    icon={<TrendingUp className="w-4 h-4" />}
                  />
                )}
                {result.backtest.performance.largestLoss !== undefined && (
                  <MetricCard
                    title="Largest Loss"
                    value={result.backtest.performance.largestLoss}
                    formatAsCurrency
                    trend="down"
                    icon={<TrendingDown className="w-4 h-4" />}
                  />
                )}
                {result.backtest.performance.consecutiveWins !== undefined && (
                  <MetricCard
                    title="Consecutive Wins"
                    value={result.backtest.performance.consecutiveWins}
                    icon={<Activity className="w-4 h-4" />}
                  />
                )}
                {result.backtest.performance.consecutiveLosses !== undefined && (
                  <MetricCard
                    title="Consecutive Losses"
                    value={result.backtest.performance.consecutiveLosses}
                    icon={<Activity className="w-4 h-4" />}
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* Risk Alerts */}
          <motion.div variants={itemVariants} className="mt-6">
            <RiskAlerts metrics={result.backtest.performance} />
          </motion.div>

          {/* AI Analysis Section - PROFESSIONAL & ENTERPRISE */}
          {canUseAI && (
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Análisis de IA</h3>
                <span className="text-xs px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full">
                  {isEnterprise ? 'ENTERPRISE' : 'PROFESSIONAL'}
                </span>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* AI Insights */}
                <AIInsights
                  backtestId={result.backtest.id}
                  strategyName={formData.strategy}
                  performanceMetrics={{
                    sharpeRatio: result.backtest.performance.sharpeRatio,
                    maxDrawdown: result.backtest.performance.maxDrawdown,
                    winRate: result.backtest.performance.winRate,
                    totalTrades: result.backtest.performance.totalTrades
                  }}
                />

                {/* Quantum Risk */}
                <QuantumRisk
                  backtestId={result.backtest.id}
                  performanceMetrics={{
                    sharpeRatio: result.backtest.performance.sharpeRatio,
                    maxDrawdown: result.backtest.performance.maxDrawdown,
                    totalTrades: result.backtest.performance.totalTrades
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Charts Row 1 - Equity Curve */}
          <motion.div variants={itemVariants}>
            <EquityCurve data={result.backtest.equityCurve} />
          </motion.div>

          {/* Professional Trading Charts */}
          <motion.div variants={itemVariants}>
            <CandlestickChart
              data={result.backtest.equityCurve}
              trades={result.backtest.trades}
              symbol={formData.symbol}
              startDate={formData.startDate}
              endDate={formData.endDate}
              timeframe={formData.timeframe}
              parameters={{
                fastPeriod: strategyParams.fastPeriod,
                slowPeriod: strategyParams.slowPeriod
              }}
            />
          </motion.div>

          {/* Technical Indicators - Basic */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
            <RSIChart data={result.backtest.equityCurve} period={strategyParams.rsiPeriod} />
            <MACDChart data={result.backtest.equityCurve} />
          </motion.div>

          {/* Advanced Indicators - Using Real OHLC Data */}
          {candlestickData.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Indicadores Técnicos Avanzados</h3>

              {/* Bollinger Bands */}
              <BollingerBandsChart data={candlestickData} period={20} stdDev={2} />

              {/* ATR & Stochastic */}
              <div className="grid md:grid-cols-2 gap-6">
                <ATRChart data={candlestickData} period={14} />
                <StochasticChart data={candlestickData} kPeriod={14} dPeriod={3} />
              </div>
            </motion.div>
          )}

          {/* Charts Row 2 - Drawdown & Distribution */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
            <DrawdownChart data={result.backtest.equityCurve} />
            <ReturnsDistribution trades={result.backtest.trades} />
          </motion.div>

          {/* Underwater Chart - Shows time underwater (below peak) */}
          <motion.div variants={itemVariants}>
            <Card className="border-red-500/30">
              <CardHeader>
                <CardTitle>Underwater Chart</CardTitle>
                <CardDescription>
                  Tiempo bajo el pico de equity (drawdown en el tiempo)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnderwaterChart data={
                  result.backtest.equityCurve.map((point, index) => {
                    // Calculate running peak
                    const runningPeak = result.backtest.equityCurve
                      .slice(0, index + 1)
                      .reduce((max, p) => Math.max(max, p.equity), 0)

                    // Calculate drawdown from peak
                    const drawdown = runningPeak > 0
                      ? (point.equity - runningPeak) / runningPeak
                      : 0

                    return {
                      time: new Date(point.date).getTime(),
                      drawdown: drawdown
                    }
                  })
                } />
              </CardContent>
            </Card>
          </motion.div>

          {/* Backtest Replay */}
          <motion.div variants={itemVariants}>
            <BacktestReplay
              equityCurve={result.backtest.equityCurve}
              trades={result.backtest.trades}
              initialCapital={formData.initialCapital || 10000}
              priceData={candlestickData && candlestickData.length > 0 ? candlestickData.map(candle => ({
                date: new Date((candle.time as number) * 1000).toISOString().split('T')[0],
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: 0 // Polygon no devuelve volumen en este endpoint, podemos agregarlo después
              })) : undefined}
            />
          </motion.div>

          {/* Performance Heatmaps */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Análisis de Rendimiento</h3>
            <PerformanceHeatmap trades={result.backtest.trades} />
            <MonthlyPerformanceHeatmap trades={result.backtest.trades} />
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
