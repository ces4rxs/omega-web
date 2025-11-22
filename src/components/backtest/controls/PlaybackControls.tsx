/**
 * Controles de reproducción del backtest replay
 * Play/Pause, Step Forward/Back, Skip, Reset, Speed control
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack
} from 'lucide-react'
import type { ReplayState, ReplayControls } from '@/types/backtest'

interface PlaybackControlsProps {
  replayState: ReplayState
  controls: ReplayControls
}

export const PlaybackControls = React.memo(function PlaybackControls({
  replayState,
  controls
}: PlaybackControlsProps) {
  const { isPlaying, currentStep, speed, maxSteps } = replayState
  const {
    handlePlayPause,
    handleStepBack,
    handleStepForward,
    handleSkipToStart,
    handleSkipToEnd,
    setSpeed
  } = controls

  const isAtStart = currentStep === 0
  const isAtEnd = currentStep >= maxSteps - 1

  return (
    <div className="space-y-4">
      {/* Main Playback Buttons */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleSkipToStart}
          disabled={isAtStart}
          className="h-10 w-10"
          title="Inicio (Home)"
        >
          <SkipBack className="w-5 h-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleStepBack}
          disabled={isAtStart}
          className="h-10 w-10"
          title="Retroceder (←)"
        >
          <Rewind className="w-5 h-5" />
        </Button>

        <Button
          variant="default"
          size="icon"
          onClick={handlePlayPause}
          className="h-14 w-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/20"
          title="Play/Pause (Espacio)"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7" />
          ) : (
            <Play className="w-7 h-7 ml-0.5" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleStepForward}
          disabled={isAtEnd}
          className="h-10 w-10"
          title="Avanzar (→)"
        >
          <FastForward className="w-5 h-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleSkipToEnd}
          disabled={isAtEnd}
          className="h-10 w-10"
          title="Final (End)"
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      {/* Speed Control */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400 whitespace-nowrap min-w-[80px]">
          Velocidad:
        </span>
        <Slider
          min={0.5}
          max={5}
          step={0.5}
          value={[speed]}
          onValueChange={(values) => setSpeed(values[0])}
          className="flex-1"
        />
        <span className="text-sm font-mono font-semibold text-white min-w-[3rem] bg-slate-800/50 px-2 py-1 rounded border border-slate-700">
          {speed.toFixed(1)}x
        </span>
      </div>
    </div>
  )
})
