// src/components/StrategyCard.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import NeuralPulse from "@/components/NeuralPulse";
import Sparkline from "@/components/Sparkline";
import { gradeFrom, gradeInfo } from "@/lib/grades";

type Props = {
  title: string;
  subtitle: string;
  sharpe: number;
  profitPct: number;
  mddPct: number;
  winRate: number;            // 0..100
  onBacktest?: () => void;
  onOptimize?: () => void;
  onReflect?: () => void;
  spark?: number[];           // serie para mini chart
  updatedAt?: string;
};

export default function StrategyCard({
  title, subtitle, sharpe, profitPct, mddPct, winRate,
  onBacktest, onOptimize, onReflect, spark = [], updatedAt,
}: Props) {
  const grade = gradeFrom(sharpe, winRate / 100);
  const info = gradeInfo(grade);

  // Detectar mejora de Sharpe para activar pulso
  const lastSharpe = useRef(sharpe);
  const [improving, setImproving] = useState(false);
  useEffect(() => {
    setImproving(sharpe > lastSharpe.current + 0.01);
    lastSharpe.current = sharpe;
  }, [sharpe]);

  const hint = useMemo(() => {
    if (grade === "A") return "📈 Estrategia con excelente ratio riesgo/beneficio.";
    if (grade === "B") return "🧪 Sólida, pero vigila drawdown y filtros adaptativos.";
    return "⚠️ Inestabilidad detectada; ajustar parámetros y riesgo.";
  }, [grade]);

  return (
    <NeuralPulse active={improving}>
      <div
        className={[
          "rounded-2xl p-4 ring-1 bg-gradient-to-br",
          info.bg,
          info.ring,
          "ring-inset backdrop-blur-sm",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-[10px] ${info.text} bg-black/30 ring-1 ring-white/10`}>
            {info.label}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-4">
          <Metric label="Sharpe" value={sharpe.toFixed(2)} />
          <Metric label="Profit %" value={`${profitPct.toFixed(1)}%`} />
          <Metric label="MDD %" value={`${mddPct.toFixed(1)}%`} />
          <Metric label="Winrate" value={`${winRate.toFixed(1)}%`} />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-[11px] text-slate-300/80" title={hint}>
            {hint}
          </div>
          <Sparkline values={spark} />
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={onBacktest} className="px-3 py-1 rounded-md bg-slate-800 text-slate-100 text-sm hover:bg-slate-700">
            Backtest
          </button>
          <button onClick={onOptimize} className="px-3 py-1 rounded-md bg-emerald-700 text-white text-sm hover:bg-emerald-600">
            Optimizar
          </button>
          <button onClick={onReflect} className="px-3 py-1 rounded-md bg-amber-700 text-white text-sm hover:bg-amber-600">
            Reflexionar
          </button>
          <div className="ml-auto text-[10px] text-slate-400">
            Actualizada: {updatedAt ?? "—"}
          </div>
        </div>
      </div>
    </NeuralPulse>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/30 ring-1 ring-white/10 p-3">
      <div className="text-[10px] text-slate-400">{label}</div>
      <div className="text-base text-slate-100">{value}</div>
    </div>
  );
}
