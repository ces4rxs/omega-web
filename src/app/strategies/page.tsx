"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { motion } from "framer-motion";

type Strategy = {
  id: string;
  name: string;
  description?: string;
  metrics?: {
    sharpe?: number;
    profitPct?: number;
    mddPct?: number;
    winRate?: number;
  };
  updatedAt?: string;
};

export default function StrategiesPage() {
  const [items, setItems] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // ✅ Llamada al backend principal (Render)
        const { data } = await api.get("/api/strategies");

        // 🪶 Log temporal para ver la respuesta real del servidor
        console.log("🔍 Datos del backend:", data);

        // ✅ Usa el campo correcto "strategies" del backend
        const list: Strategy[] = Array.isArray(data?.strategies)
          ? data.strategies
          : [];

        setItems(list);
      } catch (e: any) {
        console.error("❌ Error cargando estrategias:", e);
        setErr(e?.message ?? "Error cargando estrategias");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-sky-400">
          Estrategias Inteligentes
        </h1>
        <p className="text-slate-400">
          Panel inicial (solo lectura). No modifica el backend.
        </p>
      </header>

      {loading && <p className="text-slate-400">Cargando estrategias…</p>}
      {err && <p className="text-red-400">Error: {err}</p>}

      {!loading && !err && (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((s) => (
            <motion.div
              key={s.id}
              className="bg-slate-900/80 border border-sky-500/10 rounded-xl p-4 hover:border-sky-400/40 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-lg font-semibold text-sky-300">
                {s.name ?? s.id}
              </h3>
              {s.description && (
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                  {s.description}
                </p>
              )}

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <Metric label="Sharpe" value={fmt(s.metrics?.sharpe)} />
                <Metric label="Profit %" value={fmtPct(s.metrics?.profitPct)} />
                <Metric label="MDD %" value={fmtPct(s.metrics?.mddPct)} />
                <Metric label="Winrate" value={fmtPct(s.metrics?.winRate)} />
              </div>

              <div className="mt-4 text-xs text-slate-500">
                {s.updatedAt
                  ? `Actualizada: ${new Date(s.updatedAt).toLocaleString()}`
                  : "Sin fecha"}
              </div>

              <div className="mt-4 flex gap-2">
                <button className="px-3 py-1 rounded-lg border border-sky-600 text-sky-300 hover:bg-sky-600/10">
                  Backtest
                </button>
                <button className="px-3 py-1 rounded-lg border border-emerald-600 text-emerald-300 hover:bg-emerald-600/10">
                  Optimizar
                </button>
                <button className="px-3 py-1 rounded-lg border border-amber-600 text-amber-300 hover:bg-amber-600/10">
                  Reflexionar
                </button>
              </div>
            </motion.div>
          ))}

          {items.length === 0 && (
            <div className="text-slate-400">No hay estrategias aún.</div>
          )}
        </section>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/60 rounded-lg p-3 border border-sky-500/10">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-base font-semibold text-cyan-300">{value}</div>
    </div>
  );
}

function fmt(n?: number) {
  return typeof n === "number" ? n.toFixed(2) : "—";
}
function fmtPct(n?: number) {
  return typeof n === "number" ? `${(n * 100).toFixed(1)}%` : "—";
}
