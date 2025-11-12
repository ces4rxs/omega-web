'use client';

import { useChartStore } from '../../store';
import type { Timeframe } from '../../types';
import { Clock, ZoomIn, ZoomOut, Maximize2, Camera } from 'lucide-react';

interface TimeframeButton {
  label: string;
  value: Timeframe;
}

const timeframes: TimeframeButton[] = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30m' },
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
];

interface ChartControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onScreenshot?: () => void;
}

export default function ChartControls({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onScreenshot,
}: ChartControlsProps) {
  const currentTimeframe = useChartStore((state) => state.currentTimeframe);
  const setCurrentTimeframe = useChartStore((state) => state.setCurrentTimeframe);

  const handleTimeframeChange = (timeframe: Timeframe) => {
    setCurrentTimeframe(timeframe);
  };

  return (
    <div className="flex items-center gap-4 p-2 bg-[#1e222d] border-b border-[#2a2e39]">
      {/* Timeframe Selector */}
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-400" />
        <div className="flex items-center gap-1 bg-[#131722] rounded-lg p-1">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => handleTimeframeChange(tf.value)}
              className={`
                px-3 py-1.5 text-sm font-medium rounded transition-all
                ${
                  currentTimeframe === tf.value
                    ? 'bg-[#2962ff] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#2a2e39]'
                }
              `}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-[#2a2e39]" />

      {/* Chart Controls */}
      <div className="flex items-center gap-1">
        {onZoomIn && (
          <button
            onClick={onZoomIn}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2e39] rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        )}

        {onZoomOut && (
          <button
            onClick={onZoomOut}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2e39] rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        )}

        {onResetZoom && (
          <button
            onClick={onResetZoom}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2e39] rounded transition-colors"
            title="Reset Zoom"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        {onScreenshot && (
          <button
            onClick={onScreenshot}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2e39] rounded transition-colors"
            title="Take Screenshot"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Additional Info */}
      <div className="text-sm text-gray-400">
        Powered by Lightweight Charts
      </div>
    </div>
  );
}
