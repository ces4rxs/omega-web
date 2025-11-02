// src/components/VisualAdvisor.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { fetchManifest } from "@/lib/omega"; // seguro: ya existe y tiene fallback

type Metrics = { sharpe: number; winRate: number; mddPct: number };

function quantumGrade({ sharpe, winRate }: Metrics) {
  if (sharpe >= 1.5 && winRate >= 0.6) return { tag: "Quantum Grade A", color: "text-emerald-400", ring: "ring-emerald-500/30" };
  if (sharpe >= 1.0) return { tag: "Strategic Grade B", color: "text-amber-300", ring: "ring-amber-500/30" };
  return { tag: "Experimental Grade C", color: "text-rose-300", ring: "ring-rose-500/30" };
}

function makeSpark(seed = 0) {
  // pequeña serie sintética estable para no depender de nada externo
  return Array.from({ length: 24 }, (_, i) => ({
    t: i,
    v: 100 + Math.sin(i / 2 + seed) * 4 + Math.random() * 1.2,
  }));
}

export default function VisualAdvisor() {
  const [ts, setTs] = useState<string>("");
  const [btc, setBtc] = useState<number | null>(null);

  // Métricas demo (no tocan backend). Más adelante las podrás alimentar reales.
  const metrics: Metrics = useMemo(
    () => ({ sharpe: 1.42, winRate: 0.61, mddPct: 0.08 }),
    []
  );
  const grade = useMemo(() => quantumGrade(metrics), [metrics]);

  useEffect(() => {
    // Usamos fetchManifest (tiene fallback offline) SOLO para mostrar sello “online”
    (async () => {
      const m = await fetchManifest();
      setTs(m?.timestamp ?? new Date().toISOString());
      setBtc(typeof m?.marketData?.BTCUSD === "number" ? m.marketData.BTCUSD : null);
    })();
  }, []);

  return (
    <section className="mt-6 bg-[#0B1220] border border-[#1E293B] rounded-2xl p-5 ring-1 ring-sky-500/10">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-sky-300">🧭 Visual Advisor v11</h3>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          <span>{btc ? "Datos conectados" : "Modo educativo"}</span>
          <span className="opacity-60">·</span>
          <span>ts: {ts ? new Date(ts).toLocaleTimeString("es-CO") : "—"}</span>
        </div>
      </header>

      {/* Tarjeta principal con calificación */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`grid grid-cols-1 lg:grid-cols-3 gap-4`}
      >
        <div className={`rounded-xl border border-[#1E293B] p-4 ring-2 ${grade.ring}`}>
          <div className="text-sm text-slate-400 mb-1">Clasificación</div>
          <div className={`text-lg font-semibold ${grade.color}`}>{grade.tag}</div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <Metric label="Sharpe" value={metrics.sharpe.toFixed(2)} />
            <Metric label="Winrate" value={(metrics.winRate * 100).toFixed(1) + "%"} />
            <Metric label="MDD %" value={(metrics.mddPct * 100).toFixed(1) + "%"} />
          </div>
        </div>

        {/* Sparkline 1 */}
        <Card title="Mini-tendencia BTC (demo)">
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={makeSpark(0.7)}>
              <Line type="monotone" dataKey="v" stroke="#22d3ee" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <Hint text={btc ? `BTC spot ~ $${btc.toLocaleString()}` : "Sin spot: usando demo"} />
        </Card>

        {/* Sparkline 2 */}
        <Card title="Mini-tendencia Riesgo (demo)">
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={makeSpark(2.1)}>
              <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <Hint text="Señal estable con leve compresión de volatilidad" />
        </Card>
      </motion.div>

      {/* Narrativa breve */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 text-sm text-slate-300 leading-relaxed"
      >
        📌 <b>Lectura instantánea:</b> el perfil actual presenta <b>rendimiento ajustado al riesgo</b> saludable y una
        probabilidad de acierto consistente. Mantén posición y revisa coberturas si la MDD supera 12%.
      </motion.p>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#1E293B] p-4">
      <div className="text-sm text-slate-400 mb-1">{title}</div>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0F172A] rounded-lg p-3 border border-[#1E293B]">
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className="text-base font-semibold text-cyan-300">{value}</div>
    </div>
  );
}

function Hint({ text }: { text: string }) {
  return <div className="mt-2 text-[11px] text-slate-500">{text}</div>;
}
