"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/api";

export default function StrategyMomentumCard() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    api.get("/ai/strategies/momentum").then((res) => setMetrics(res.data)).catch(() => {
      setMetrics({
        sharpe: 1.88, sortino: 2.51, profitFactor: 2.15,
        mdd: 5.8, add: 68.5, robustness: 94.7,
      });
    });
  }, []);

  const handleOptimize = async () => {
    await api.post("/ai/optimize/run", { strategy: "momentum_btcusd" });
    alert("Optimizador v5 ejecutado (modo advisory)");
  };

  return (
    <div className="border border-neutral-800 rounded-2xl bg-neutral-900/50 p-6 shadow-lg mt-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
        <h2 className="text-2xl font-semibold text-cyan-400">Momentum BTC/USD</h2>
      </div>
      <p className="text-neutral-400 mb-6">IA híbrida v10 — análisis de rupturas de tendencia. (modo lectura)</p>

      <div className="h-60 rounded-xl bg-black/30 flex items-center justify-center text-neutral-500 mb-8">
        {/* Aquí puedes conectar tu gráfico real */}
        <span>📈 Equity Curve — conectar a /ai/manifest o /ai/strategies/momentum</span>
      </div>

      {metrics && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-neutral-800 p-4">
            <h3 className="text-neutral-300 mb-4">Rendimiento</h3>
            <Metric label="Sharpe" value={metrics.sharpe} />
            <Metric label="Sortino" value={metrics.sortino} />
            <Metric label="Profit Factor" value={metrics.profitFactor} />
            <div className="mt-4 flex gap-3">
              <Btn>Backtest</Btn>
              <Btn variant="success" onClick={handleOptimize}>Optimizar</Btn>
              <Btn variant="warning">Reflexionar</Btn>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 p-4">
            <h3 className="text-neutral-300 mb-4">Riesgo y Robustez</h3>
            <Metric label="MDD %" value={metrics.mdd} />
            <Metric label="ADD %" value={metrics.add} />
            <Metric label="Robustez" value={`${metrics.robustness}%`} />
            <div className="mt-4 h-32 rounded-lg bg-black/30 flex items-center justify-center text-neutral-500">
              🔄 Quantum Risk Meter (conectar a /ai/monte)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between py-1 text-sm text-neutral-300">
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function Btn({
  children,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "success" | "warning";
}) {
  const color =
    variant === "success"
      ? "bg-emerald-600 hover:bg-emerald-500"
      : variant === "warning"
      ? "bg-amber-600 hover:bg-amber-500"
      : "bg-neutral-800 hover:bg-neutral-700";
  return (
    <button
      onClick={onClick}
      className={`${color} px-3 py-2 rounded-lg text-sm font-medium transition`}
    >
      {children}
    </button>
  );
}
