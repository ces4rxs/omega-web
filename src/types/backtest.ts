/**
 * Tipos TypeScript para el sistema de Backtesting
 * Contiene todos los tipos necesarios para replay, métricas y visualización
 */

import type { Trade } from './types'

// ============================================================================
// DATOS DE ENTRADA
// ============================================================================

export interface EquityPoint {
  date: string
  equity: number
}

export interface PriceCandle {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface BenchmarkPoint {
  date: string
  value: number
}

export interface BacktestReplayData {
  equityCurve: EquityPoint[]
  trades: Trade[]
  initialCapital: number
  priceData?: PriceCandle[]
  benchmarkData?: BenchmarkPoint[]
}

// ============================================================================
// MÉTRICAS CALCULADAS
// ============================================================================

export interface AdvancedMetrics {
  sharpe: number
  sortino: number
  profitFactor: number
  expectancy: number
  calmar: number
  avgReturn: number
  stdDev: number
}

export interface DrawdownZone {
  start: number
  end: number
  depth: number // Porcentaje de drawdown
}

export interface HourlyPerformance {
  [hour: number]: {
    profit: number
    trades: number
  }
}

export interface StreakInfo {
  type: 'win' | 'loss' | 'none'
  count: number
}

export interface BacktestMetrics {
  currentEquity: number
  currentReturn: number
  maxDrawdown: number
  winRate: number
  completedTrades: Trade[]
  streak: StreakInfo
  advancedMetrics: AdvancedMetrics | null
  drawdownZones: DrawdownZone[]
  hourlyPerformance: HourlyPerformance
  bestHour: string
  worstHour: string
  underwaterData: number[]
}

// ============================================================================
// ESTADO DEL REPLAY
// ============================================================================

export interface ReplayState {
  isPlaying: boolean
  currentStep: number
  speed: number
  maxSteps: number
  progress: number
}

export interface ReplayControls {
  handlePlayPause: () => void
  handleReset: () => void
  handleStepBack: () => void
  handleStepForward: () => void
  handleSkipToStart: () => void
  handleSkipToEnd: () => void
  setSpeed: (speed: number) => void
  setCurrentStep: (step: number) => void
}

// ============================================================================
// OPCIONES DE VISUALIZACIÓN
// ============================================================================

export interface ViewOptions {
  showTradeMarkers: boolean
  showBenchmark: boolean
  showDrawdownZones: boolean
  showVolume: boolean
  showSMAs: boolean
  showMinimap: boolean
  showHeatmap: boolean
  soundEnabled: boolean
  isFullscreen: boolean
  viewMode: 'single' | 'dual'
}

export interface ViewToggleHandlers {
  setShowTradeMarkers: (show: boolean) => void
  setShowBenchmark: (show: boolean) => void
  setShowDrawdownZones: (show: boolean) => void
  setShowVolume: (show: boolean) => void
  setShowSMAs: (show: boolean) => void
  setShowMinimap: (show: boolean) => void
  setShowHeatmap: (show: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
  setIsFullscreen: (fullscreen: boolean) => void
  setViewMode: (mode: 'single' | 'dual') => void
}

// ============================================================================
// CANVAS RENDERING
// ============================================================================

export interface CanvasRenderConfig {
  width: number
  height: number
  padding: number
  backgroundColor: string
  gridColor: string
  devicePixelRatio: number
}

export interface ChartScale {
  xScale: number
  yScale: number
  minValue: number
  maxValue: number
  range: number
}

export interface TradeMarker {
  x: number
  y: number
  type: 'entry' | 'exit'
  isWin?: boolean
  price: number
  date: string
}

// ============================================================================
// AUDIO
// ============================================================================

export type SoundType = 'win' | 'loss'

export interface AudioConfig {
  frequency: number
  type: OscillatorType
  duration: number
  gain: number
}

// ============================================================================
// EXPORTS DE UTILIDAD
// ============================================================================

export type { Trade } from './types'
