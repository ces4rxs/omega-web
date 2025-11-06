"use client";

import { Home } from "lucide-react";
import { useState } from "react";

interface AssetSelectorProps {
  selectedAsset: string;
  onSelectAsset: (asset: string) => void;
}

const ASSETS = [
  { value: "BTCUSD", label: "BTC/USD" },
  { value: "ETHUSD", label: "ETH/USD" },
  { value: "SOLUSD", label: "SOL/USD" },
  { value: "ADAUSD", label: "ADA/USD" },
];

export function AssetSelector({ selectedAsset, onSelectAsset }: AssetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentAsset = ASSETS.find((a) => a.value === selectedAsset) || ASSETS[0];

  return (
    <div className="absolute left-4 top-16 z-40">
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
    </div>
  );
}
