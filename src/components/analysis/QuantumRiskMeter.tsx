"use client";

import { motion } from "framer-motion";

interface QuantumRiskMeterProps {
  value: number;
}

export function QuantumRiskMeter({ value }: QuantumRiskMeterProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const rotation = (clampedValue / 100) * 240 - 120; // -120 to 120 degrees for gauge sweep
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (240 / 360) * circumference;
  const dashArray = `${arcLength} ${circumference}`;
  const dashOffset = circumference - arcLength;

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
    <div className="flex h-full flex-col justify-between rounded-2xl border border-[#1f2937] bg-gradient-to-b from-[#141824]/80 via-[#0f1524]/90 to-[#0a0e1a] p-6">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-[#6b7280]">
        <span>Quantum Risk Meter</span>
        <span className="rounded-full border border-[#1f2937] bg-[#0a0e1a]/80 px-2 py-0.5 text-[10px] text-[#9ca3af]">
          optimizer_v5
        </span>
      </div>

      <div className="relative mx-auto h-52 w-52">
        <div className="absolute inset-0 rounded-full bg-[#0a0e1a]" />
        <svg viewBox="0 0 220 220" className="absolute inset-0">
          <defs>
            <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform="translate(110 110)">
            <circle
              r={radius}
              fill="none"
              stroke="#111827"
              strokeWidth="18"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform="rotate(-120)"
              strokeLinecap="round"
            />
            <circle
              r={radius}
              fill="none"
              stroke="url(#riskGradient)"
              strokeWidth="14"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform="rotate(-120)"
              strokeLinecap="round"
              filter="url(#glow)"
            />

            <motion.g
              initial={{ rotate: -120 }}
              animate={{ rotate: rotation }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              <line x1="0" y1="0" x2="0" y2={-radius + 12} stroke={getStatusColor()} strokeWidth="4" strokeLinecap="round" />
              <polygon
                points="0,-68 -6,-50 6,-50"
                fill={getStatusColor()}
                opacity={0.9}
              />
              <circle r="8" fill="#0a0e1a" stroke={getStatusColor()} strokeWidth="3" />
            </motion.g>
          </g>
        </svg>

        <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-[#0f1422]/80">
          <span className="text-4xl font-bold text-[#00d4ff]">{clampedValue}</span>
          <span className="text-[11px] uppercase tracking-[0.4em] text-[#6b7280]">Risk Index</span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-center text-sm font-semibold uppercase tracking-wide" style={{ color: getStatusColor() }}>
          {getStatusText()}
        </p>
        <div className="flex items-center justify-between rounded-xl border border-[#1f2937] bg-[#0f1422]/60 px-3 py-2 text-[11px] text-[#9ca3af]">
          <span>Sesgo Cuántico</span>
          <span className="text-[#00d4ff]">Análisis dinámico</span>
        </div>
      </div>
    </div>
  );
}
