"use client";

import { Home } from "lucide-react";
import { useState } from "react";

interface AssetSelectorProps {
  selectedAsset: string;
  selectedTimeframe: string;
  onSelectAsset: (asset: string) => void;
  onSelectTimeframe: (timeframe: string) => void;
  lastPrice?: number;
  changePercent?: number;
  dayRange?: {
    high: number;
    low: number;
  };
}

const ASSETS = [
  { value: "BTCUSD", label: "BTC/USD" },
  { value: "ETHUSD", label: "ETH/USD" },
  { value: "SOLUSD", label: "SOL/USD" },
  { value: "ADAUSD", label: "ADA/USD" },
];

const TIMEFRAMES = ["15m", "1h", "4h", "1d"];

export function AssetSelector({
  selectedAsset,
  selectedTimeframe,
  onSelectAsset,
  onSelectTimeframe,
  lastPrice,
  changePercent,
  dayRange,
}: AssetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentAsset = ASSETS.find((a) => a.value === selectedAsset) || ASSETS[0];
  const changeColor =
    changePercent !== undefined && changePercent !== 0
      ? changePercent > 0
        ? "text-[#10b981]"
        : "text-[#ef4444]"
      : "text-[#9ca3af]";

  const formattedPrice =
    lastPrice !== undefined
      ? lastPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "--";
  const formattedChange =
    changePercent !== undefined
      ? `${changePercent > 0 ? "+" : ""}${changePercent.toFixed(2)}%`
      : "--";

  return (
    <div className="absolute left-4 top-14 z-40 flex flex-col gap-2 text-xs text-[#9ca3af]">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-lg border border-[#9ca3af]/30 bg-[#1a1f2e]/90 px-3 py-2 text-sm text-[#f9fafb] backdrop-blur-sm transition-all hover:border-[#00d4ff]/50 hover:shadow-[0_0_15px_rgba(0,212,255,0.3)]"
        >
          <Home className="h-3 w-3 text-[#00d4ff]" />
          <span className="font-medium">{currentAsset.label}</span>
          <svg
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-2 w-full min-w-[140px] rounded-lg border border-[#9ca3af]/30 bg-[#1a1f2e]/95 py-1 backdrop-blur-sm">
            {ASSETS.map((asset) => (
              <button
                key={asset.value}
                onClick={() => {
                  onSelectAsset(asset.value);
                  setIsOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                  asset.value === selectedAsset
                    ? "bg-[#00d4ff]/20 text-[#00d4ff]"
                    : "text-[#9ca3af] hover:bg-[#00d4ff]/10 hover:text-[#f9fafb]"
                }`}
              >
                {asset.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-end gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#6b7280]">Precio Spot</span>
          <span className="text-lg font-semibold text-[#f9fafb]">{formattedPrice}</span>
        </div>
        <span className={`text-sm font-semibold ${changeColor}`}>{formattedChange}</span>
      </div>

      {dayRange && (
        <div className="flex items-center gap-2 text-[11px] text-[#6b7280]">
          <span>Rango diario:</span>
          <span className="text-[#f9fafb]">
            {dayRange.low.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <div className="h-[1px] w-6 bg-[#1f2937]">
            <div className="h-full w-full bg-gradient-to-r from-[#ef4444] via-[#fbbf24] to-[#10b981]" />
          </div>
          <span className="text-[#f9fafb]">
            {dayRange.high.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#6b7280]">
        <span>Timeframes</span>
        <div className="flex items-center gap-1 rounded-full border border-[#1f2937] bg-[#0f1422]/80 p-1">
          {TIMEFRAMES.map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => onSelectTimeframe(timeframe)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                timeframe === selectedTimeframe
                  ? "bg-[#00d4ff]/20 text-[#00d4ff] shadow-[0_0_10px_rgba(0,212,255,0.2)]"
                  : "text-[#9ca3af] hover:text-[#f9fafb]"
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
