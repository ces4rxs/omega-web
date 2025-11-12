'use client';

import { useUIStore, type ToolType } from '../state/ui';
import {
  MousePointer2,
  Crosshair,
  TrendingUp,
  Minus,
  Square,
  Type,
  Eraser,
} from 'lucide-react';

const TOOLS: Array<{ type: ToolType; icon: React.ElementType; label: string; hotkey: string }> = [
  { type: 'cursor', icon: MousePointer2, label: 'Cursor', hotkey: 'C' },
  { type: 'crosshair', icon: Crosshair, label: 'Crosshair', hotkey: 'X' },
  { type: 'line', icon: TrendingUp, label: 'Trend Line', hotkey: 'L' },
  { type: 'fibo', icon: Minus, label: 'Fibonacci', hotkey: 'F' },
  { type: 'rectangle', icon: Square, label: 'Rectangle', hotkey: 'R' },
  { type: 'text', icon: Type, label: 'Text', hotkey: 'T' },
  { type: 'eraser', icon: Eraser, label: 'Eraser', hotkey: 'E' },
];

export default function LeftTools() {
  const { activeTool, setActiveTool } = useUIStore();

  return (
    <div className="w-14 bg-[#1e222d] border-r border-[#2a2e39] flex flex-col items-center py-4 gap-2">
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.type;

        return (
          <button
            key={tool.type}
            onClick={() => setActiveTool(tool.type)}
            title={`${tool.label} (${tool.hotkey})`}
            className={`
              w-10 h-10 flex items-center justify-center rounded-lg transition-all
              ${
                isActive
                  ? 'bg-[#2962ff] text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-[#2a2e39]'
              }
            `}
          >
            <Icon className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
}
