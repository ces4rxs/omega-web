// src/lib/types.ts — Tipos TypeScript para Backtester Pro

// ===== AUTH =====
export interface User {
  id: string
  email: string
  name?: string
  subscription?: Subscription
}

export interface Subscription {
  planId: 'free' | 'professional' | 'enterprise'
  status: 'active' | 'canceled' | 'expired'
  currentPeriodEnd?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  user: User
}

// ===== BACKTEST =====
export interface BacktestParams {
  strategy: string
  symbol: string
  timeframe: '1min' | '5min' | '15min' | '1h' | '1d'
  startDate: string
  endDate: string
  initialCapital?: number
  parameters?: Record<string, any>
}

export interface BacktestResult {
  backtest: {
    id: string
    performance: PerformanceMetrics
    trades: Trade[]
    equityCurve: EquityPoint[]
    createdAt: string
  }
}

export interface PerformanceMetrics {
  totalReturn: number
  cagr: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  profitFactor: number
  totalTrades: number
  avgWin: number
  avgLoss: number
  expectancy: number
}

export interface Trade {
  id: string
  entryDate: string
  exitDate: string
  symbol: string
  side: 'long' | 'short'
  entryPrice: number
  exitPrice: number
  quantity: number
  pnl: number
  pnlPercent: number
  duration: number
}

export interface EquityPoint {
  date: string
  equity: number
  drawdown?: number
}

// ===== STRATEGIES =====
export interface Strategy {
  id: string
  name: string
  description?: string
  code: string
  parameters: StrategyParameter[]
  userId: string
  createdAt: string
  updatedAt: string
}

export interface StrategyParameter {
  name: string
  type: 'number' | 'string' | 'boolean'
  defaultValue: any
  min?: number
  max?: number
  step?: number
}

export interface BuiltInStrategy {
  id: string
  name: string
  description: string
  parameters: StrategyParameter[]
}

// ===== ANALYSIS (PRO) =====
export interface MonteCarloParams {
  backtestId: string
  simulations: number // MAX 300
  confidenceLevel?: number
}

export interface MonteCarloResult {
  simulations: MonteCarloSimulation[]
  statistics: {
    mean: number
    median: number
    stdDev: number
    percentile5: number
    percentile95: number
  }
}

export interface MonteCarloSimulation {
  id: number
  finalEquity: number
  maxDrawdown: number
  sharpeRatio: number
}

export interface WalkForwardParams {
  strategy: string
  symbol: string
  timeframe: string
  startDate: string
  endDate: string
  inSampleRatio: number
  stepSize: number
}

export interface WalkForwardResult {
  windows: WalkForwardWindow[]
  overallMetrics: PerformanceMetrics
}

export interface WalkForwardWindow {
  id: number
  inSamplePeriod: { start: string; end: string }
  outOfSamplePeriod: { start: string; end: string }
  inSampleMetrics: PerformanceMetrics
  outOfSampleMetrics: PerformanceMetrics
}

export interface RiskMetrics {
  var95: number // Value at Risk 95%
  cvar95: number // Conditional VaR
  volatility: number
  beta?: number
  alpha?: number
  sortinoRatio: number
  calmarRatio: number
}

export interface CorrelationAnalysis {
  correlations: CorrelationPair[]
  heatmap: number[][]
  symbols: string[]
}

export interface CorrelationPair {
  symbol1: string
  symbol2: string
  correlation: number
}

// ===== OPTIMIZER (PRO) =====
export interface OptimizerParams {
  strategy: string
  symbol: string
  timeframe: string
  startDate: string
  endDate: string
  parameters: OptimizationParameter[]
  metric: 'sharpeRatio' | 'totalReturn' | 'profitFactor'
}

export interface OptimizationParameter {
  name: string
  min: number
  max: number
  step: number
}

export interface OptimizerResult {
  bestParams: Record<string, number>
  bestMetrics: PerformanceMetrics
  allResults: OptimizationResult[]
}

export interface OptimizationResult {
  parameters: Record<string, number>
  metrics: PerformanceMetrics
  score: number
}

// ===== BILLING =====
export interface CheckoutSession {
  sessionId: string
  url: string
}

export interface BillingPortalSession {
  url: string
}

// ===== API RESPONSES =====
export interface ApiError {
  error: string
  details?: any
}

export interface StrategiesResponse {
  strategies: string[]
}

export interface MyStrategiesResponse {
  strategies: Strategy[]
}
