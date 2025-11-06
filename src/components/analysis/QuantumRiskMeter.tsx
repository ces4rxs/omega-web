"use client";

import { motion } from "framer-motion";

interface QuantumRiskMeterProps {
  value: number;
}

export function QuantumRiskMeter({ value }: QuantumRiskMeterProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const rotation = (clampedValue / 100) * 180 - 90; // -90 to 90 degrees for semicircle

  const getStatusText = () => {
    if (clampedValue < 30) return "VERDE: Riesgo Controlado";
    if (clampedValue < 70) return "AMARILLO: Variación Elevada";
    return "ROJO: Riesgo Alto";
  };

  const getStatusColor = () => {
    if (clampedValue < 30) return "#10b981";
    if (clampedValue < 70) return "#fbbf24";
    return "#ef4444";
  };

  return (
    <div className="flex h-full flex-col items-center justify-between rounded-2xl border border-[#9ca3af]/20 bg-[#1a1f2e] p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f9fafb]">
        Quantum Risk Meter
      </h3>

      <div className="relative flex items-center justify-center">
        {/* Semicircle gauge background */}
        <svg width="200" height="120" viewBox="0 0 200 120" className="overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "#fbbf24", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#ef4444", stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#141824"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Colored arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Needle */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: rotation }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ transformOrigin: "100px 100px" }}
          >
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="35"
              stroke={getStatusColor()}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="8" fill={getStatusColor()} />
          </motion.g>

          {/* Center circle */}
          <circle cx="100" cy="100" r="5" fill="#1a1f2e" />
        </svg>

        {/* Value display */}
        <div className="absolute bottom-0 flex flex-col items-center">
          <span className="text-3xl font-bold text-[#00d4ff]">{clampedValue}</span>
          <span className="text-xs text-[#9ca3af]">Risk Index</span>
        </div>
      </div>

      <div className="w-full space-y-2">
        <p
          className="text-center text-sm font-semibold uppercase tracking-wide"
          style={{ color: getStatusColor() }}
        >
          {getStatusText()}
        </p>
        <p className="text-center text-xs text-[#9ca3af]">
          Optimizar optimizer_v5
        </p>
      </div>
    </div>
  );
}
