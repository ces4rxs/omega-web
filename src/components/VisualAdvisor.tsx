// src/components/VisualAdvisor.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { fetchManifest } from "@/lib/omega";

type Metrics = { sharpe: number; winRate: number; mddPct: number };

function quantumGrade({ sharpe, winRate }: Metrics) {
  if (sharpe >= 1.5 && winRate >= 0.6)
    return {
      tag: "Quantum Grade A",
      color: "text-emerald-400",
      ring: "from-emerald-600/40 to-sky-500/30",
      pulse: "bg-emerald-400/40",
    };
  if (sharpe >= 1.0)
    return {
      tag: "Strategic Grade B",
      color: "text-amber-300",
      ring: "from-amber-500/40 to-orange-500/30",
      pulse: "bg-amber-400/40",
    };
  return {
    tag: "Experimental Grade C",
    color: "text-rose-300",
    ring: "from-rose-500/40 to-fuchsia-500/30",
    pulse: "bg-rose-400/40",
  };
}

function makeSpark(seed = 0) {
  return Array.from({ length: 24 }, (_, i) => ({
    t: i,
    v: 100 + Math.sin(i / 2 + seed) * 4 + Math.random() * 1.2,
  }));
}

export default function VisualAdvisor() {
  const [ts, setTs] = useState<string>("");
  const [btc, setBtc] = useState<number | null>(null);

  const metrics: Metrics = useMemo(
    () => ({ sharpe: 1.42, winRate: 0.61, mddPct: 0.08 }),
    []
  );
  const grade = useMemo(() => quantumGrade(metrics), [metrics]);

  useEffect(() => {
    (async () => {
      const m = await fetchManifest();
      setTs(m?.timestamp ?? new Date().toISOString());
      setBtc(
        typeof m?.marketData?.BTCUSD === "number" ? m.marketData.BTCUSD : null
      );
    })();
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden mt-6 rounded-2xl border border-[#1E293B] p-5 shadow-lg shadow-black/30`}
    >
      {/* 🔮 Fondo dinámico */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${grade.ring} blur-2xl opacity-40 animate-pulse`}
      />
      <div className="relative z-10">
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-sky-300 flex items-center gap-2">
            🧭 Visual Advisor v11.1{" "}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full border border-white/10 ${grade.color}`}
            >
              {grade.tag}
            </motion.span>
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <motion.span
              className={`inline-flex h-2 w-2 rounded-full ${grade.pulse}`}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span>{btc ? "Datos conectados" : "Modo educativo"}</span>
            <span className="opacity-60">·</span>
            <span>
              ts: {ts ? new Date(ts).toLocaleTimeString("es-CO") : "—"}
            </span>
          </div>
        </header>

        {/* 🔹 Panel métrico + gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 150 }}
            className={`rounded-xl border border-[#1E293B] p-4 backdrop-blur-sm bg-[#0B1220]/70`}
          >
            <div className="text-sm text-slate-400 mb-1">Clasificación</div>
            <div className={`text-lg font-semibold ${grade.color}`}>
              {grade.tag}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <Metric label="Sharpe" value={metrics.sharpe.toFixed(2)} />
              <Metric
                label="Winrate"
                value={(metrics.winRate * 100).toFixed(1) + "%"}
              />
              <Metric
                label="MDD %"
                value={(metrics.mddPct * 100).toFixed(1) + "%"}
              />
            </div>
          </motion.div>

          <Card title="Mini-tendencia BTC (demo)">
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={makeSpark(0.7)}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <Hint
              text={
                btc
                  ? `BTC spot ~ $${btc.toLocaleString()}`
                  : "Sin spot: usando demo"
              }
            />
          </Card>

          <Card title="Mini-tendencia Riesgo (demo)">
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={makeSpark(2.1)}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <Hint text="Señal estable con leve compresión de volatilidad" />
          </Card>
        </div>

        {/* ✨ Narrativa final */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-5 text-sm text-slate-300 leading-relaxed"
        >
          📌 <b>Lectura instantánea:</b> El perfil actual muestra{" "}
          <b>rendimiento ajustado al riesgo</b> saludable y estabilidad táctica.
          Mantén posición y revisa coberturas si la MDD supera el 12 %.
        </motion.p>
      </div>
    </motion.section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-xl border border-[#1E293B] p-4 bg-[#0B1220]/70 backdrop-blur-sm"
    >
      <div className="text-sm text-slate-400 mb-1">{title}</div>
      {children}
    </motion.div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="bg-[#0F172A]/70 rounded-lg p-3 border border-[#1E293B] shadow-inner"
    >
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className="text-base font-semibold text-cyan-300">{value}</div>
    </motion.div>
  );
}

function Hint({ text }: { text: string }) {
  return (
    <div className="mt-2 text-[11px] text-slate-500 italic">
      {text}
    </div>
  );
}
