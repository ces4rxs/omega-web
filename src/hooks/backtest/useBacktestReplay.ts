/**
 * Hook principal para el replay de backtesting
 * Maneja el estado del replay, controles, y visualización
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type {
  BacktestReplayData,
  ReplayState,
  ReplayControls,
  ViewOptions,
  ViewToggleHandlers,
  EquityPoint
} from '@/types/backtest'
import { calculateProgress } from '@/lib/backtest/calculations'
import { playCompletionSound } from '@/lib/backtest/soundEffects'

interface UseBacktestReplayReturn {
  // State
  replayState: ReplayState
  viewOptions: ViewOptions
  visibleData: EquityPoint[]
  currentDate: string | null

  // Controls
  controls: ReplayControls
  viewToggles: ViewToggleHandlers

  // Utility
  toggleFullscreen: () => void
  takeScreenshot: (canvasRef: React.RefObject<HTMLCanvasElement>) => void
  containerRef: React.RefObject<HTMLDivElement>
}

export function useBacktestReplay(
  data: BacktestReplayData
): UseBacktestReplayReturn {
  const { equityCurve } = data

  // ============================================================================
  // REPLAY STATE
  // ============================================================================

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [speed, setSpeed] = useState(1)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const maxSteps = equityCurve.length
  const progress = useMemo(
    () => calculateProgress(currentStep, maxSteps),
    [currentStep, maxSteps]
  )

  // ============================================================================
  // VIEW OPTIONS STATE
  // ============================================================================

  const [showTradeMarkers, setShowTradeMarkers] = useState(true)
  const [showBenchmark, setShowBenchmark] = useState(false)
  const [showDrawdownZones, setShowDrawdownZones] = useState(true)
  const [showVolume, setShowVolume] = useState(true)
  const [showSMAs, setShowSMAs] = useState(true)
  const [showMinimap, setShowMinimap] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<'single' | 'dual'>('dual')

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const visibleData = useMemo(
    () => equityCurve.slice(0, currentStep + 1),
    [equityCurve, currentStep]
  )

  const currentDate = useMemo(
    () => visibleData[visibleData.length - 1]?.date || null,
    [visibleData]
  )

  // ============================================================================
  // REPLAY CONTROLS
  // ============================================================================

  const handlePlayPause = useCallback(() => {
    if (currentStep >= maxSteps - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(!isPlaying)
  }, [currentStep, maxSteps, isPlaying])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
  }, [])

  const handleStepBack = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep((prev) => Math.max(0, prev - 10))
  }, [])

  const handleStepForward = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep((prev) => Math.min(maxSteps - 1, prev + 10))
  }, [maxSteps])

  const handleSkipToStart = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
  }, [])

  const handleSkipToEnd = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(maxSteps - 1)
  }, [maxSteps])

  // ============================================================================
  // PLAYBACK EFFECT
  // ============================================================================

  useEffect(() => {
    if (isPlaying && currentStep < maxSteps - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= maxSteps - 1) {
            setIsPlaying(false)
            playCompletionSound(soundEnabled)
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
  }, [isPlaying, currentStep, maxSteps, speed, soundEnabled])

  // ============================================================================
  // FULLSCREEN
  // ============================================================================

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Handle fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // ============================================================================
  // SCREENSHOT
  // ============================================================================

  const takeScreenshot = useCallback(
    (canvasRef: React.RefObject<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const link = document.createElement('a')
      link.download = `backtest-replay-${new Date().toISOString().slice(0, 10)}.png`
      link.href = canvas.toDataURL()
      link.click()
    },
    []
  )

  // ============================================================================
  // RETURN
  // ============================================================================

  const replayState: ReplayState = useMemo(
    () => ({
      isPlaying,
      currentStep,
      speed,
      maxSteps,
      progress
    }),
    [isPlaying, currentStep, speed, maxSteps, progress]
  )

  const controls: ReplayControls = useMemo(
    () => ({
      handlePlayPause,
      handleReset,
      handleStepBack,
      handleStepForward,
      handleSkipToStart,
      handleSkipToEnd,
      setSpeed,
      setCurrentStep
    }),
    [
      handlePlayPause,
      handleReset,
      handleStepBack,
      handleStepForward,
      handleSkipToStart,
      handleSkipToEnd
    ]
  )

  const viewOptions: ViewOptions = useMemo(
    () => ({
      showTradeMarkers,
      showBenchmark,
      showDrawdownZones,
      showVolume,
      showSMAs,
      showMinimap,
      showHeatmap,
      soundEnabled,
      isFullscreen,
      viewMode
    }),
    [
      showTradeMarkers,
      showBenchmark,
      showDrawdownZones,
      showVolume,
      showSMAs,
      showMinimap,
      showHeatmap,
      soundEnabled,
      isFullscreen,
      viewMode
    ]
  )

  const viewToggles: ViewToggleHandlers = useMemo(
    () => ({
      setShowTradeMarkers,
      setShowBenchmark,
      setShowDrawdownZones,
      setShowVolume,
      setShowSMAs,
      setShowMinimap,
      setShowHeatmap,
      setSoundEnabled,
      setIsFullscreen,
      setViewMode
    }),
    []
  )

  return {
    replayState,
    viewOptions,
    visibleData,
    currentDate,
    controls,
    viewToggles,
    toggleFullscreen,
    takeScreenshot,
    containerRef
  }
}
