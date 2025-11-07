"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useLiveMarket } from "@/hooks/useLiveMarket";

// 🧩 Nuevos imports
import NeuralPulse from "@/components/NeuralPulse";
import Sparkline from "@/components/Sparkline";
import { gradeFrom, gradeInfo } from "@/lib/grades";

type Strategy = {
  id: string;
  name: string;
  description?: string;
  metrics?: { sharpe?: number; profitPct?: number; mddPct?: number; winRate?: number };
  updatedAt?: string;
};

export default function StrategiesPage() {
  const [items, setItems] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const { market, loading: mLoading, error: mErr, refreshing, lastUpdated, refresh } = useLiveMarket();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/strategies");
        const list: Strategy[] = Array.isArray(data?.strategies) ? data.strategies : [];
        setItems(list);
      } catch (e: any) {
        setErr(e?.message ?? "Error cargando estrategias");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-sky-400">Estrategias Inteligentes</h1>
          <p className="text-slate-400">Datos reales vía OMEGA BFF · panel solo lectura</p>
        </div>

        {/* Barra live market */}
        <div className="bg-slate-800/60 border border-sky-500/20 rounded-xl px-4 py-3">
          <div className="text-xs text-slate-400 mb-1">
            {refreshing
              ? "Actualizando…"
              : lastUpdated
              ? `Últ. actualización: ${lastUpdated.toLocaleTimeString()}`
              : "Cargando…"}
          </div>
          <div className="flex gap-4 text-sm">
            <LiveTag label="BTC" value={market?.BTCUSD?.price} />
            <LiveTag label="ETH" value={market?.ETHUSD?.price} />
            <LiveTag label="XAU" value={market?.XAUUSD?.price} />
            <button
              onClick={refresh}
              className="ml-2 px-3 py-1 rounded-lg border border-sky-600 text-sky-300 hover:bg-sky-600/10"
            >
              Refrescar
            </button>
          </div>
          {mErr && <div className="text-amber-400 text-xs mt-1">⚠️ Mercado: {String(mErr)}</div>}
        </div>
      </header>

      {loading && <p className="text-slate-400">Cargando estrategias…</p>}
      {err && <p className="text-red-400">Error: {err}</p>}

      {!loading && !err && (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((s) => {
            const g = gradeFrom(s.metrics?.sharpe, s.metrics?.winRate);
            const info = gradeInfo(g);

            return (
              <motion.div key={s.id} whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                <NeuralPulse active={!!(s.metrics?.sharpe && s.metrics.sharpe > 1.4)}>
                  <div className="bg-slate-900/80 border border-sky-500/10 rounded-xl p-4 hover:border-sky-400/40 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-sky-300">{s.name ?? s.id}</h3>
                      <span
                        className={`text-[11px] px-2 py-1 rounded-md ${info.color}`}
                        title={info.hint}
                      >
                        {info.label}
                      </span>
                    </div>

                    {s.description && (
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">{s.description}</p>
                    )}

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <Metric label="Sharpe" value={fmt(s.metrics?.sharpe)} />
                      <Metric label="Profit %" value={fmtPct(s.metrics?.profitPct)} />
                      <Metric label="MDD %" value={fmtPct(s.metrics?.mddPct)} />
                      <Metric label="Winrate" value={fmtPct(s.metrics?.winRate)} />
                    </div>

                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-xs text-slate-500 italic">Mini-tendencia</div>
                      <Sparkline
                        values={Array.from({ length: 20 }, () => 1 + Math.random() * 0.1)}
                      />
                    </div>

                    {/* Botones existentes */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        className="px-3 py-1 rounded-lg border border-sky-600 text-sky-300 hover:bg-sky-600/10"
                        onClick={async () => {
                          try {
                            const { data } = await api.get("/ai/predict/advanced");
                            alert(`Predicción lista:\n${JSON.stringify(data, null, 2)}`);
                          } catch (e: any) {
                            alert("Error en predicción: " + e.message);
                          }
                        }}
                      >
                        Backtest
                      </button>

                      <button
                        className="px-3 py-1 rounded-lg border border-emerald-600 text-emerald-300 hover:bg-emerald-600/10"
                        onClick={async () => {
                          try {
                            const { data } = await api.post("/ai/optimize", {
                              manifest: { id: s.id },
                              goal: "robustness",
                            });
                            alert(`Optimización OK:\n${JSON.stringify(data?.report ?? data, null, 2)}`);
                          } catch (e: any) {
                            alert("Error al optimizar: " + e.message);
                          }
                        }}
                      >
                        Optimizar
                      </button>

                      <button
                        className="px-3 py-1 rounded-lg border border-amber-600 text-amber-300 hover:bg-amber-600/10"
                        onClick={async () => {
                          try {
                            const { data } = await api.post("/ai/symbiont", { strategyId: s.id });
                            alert(
                              `Reflexión Cognitiva:\n${JSON.stringify(
                                data?.result ?? data,
                                null,
                                2
                              )}`
                            );
                          } catch (e: any) {
                            alert("Error en reflexión: " + e.message);
                          }
                        }}
                      >
                        Reflexionar
                      </button>
                    </div>

                    <div className="mt-4 text-xs text-slate-500">
                      {s.updatedAt
                        ? `Actualizada: ${new Date(s.updatedAt).toLocaleString()}`
                        : "Sin fecha"}
                    </div>
                  </div>
                </NeuralPulse>
              </motion.div>
            );
          })}

          {items.length === 0 && (
            <div className="text-slate-400">No hay estrategias aún.</div>
          )}
        </section>
      )}
    </main>
  );
}

function LiveTag({ label, value }: { label: string; value: number | null | undefined }) {
  const v =
    typeof value === "number"
      ? value.toLocaleString("en-US", { maximumFractionDigits: 2 })
      : "—";
  return (
    <div className="px-2 py-1 rounded-md bg-slate-700/60 border border-sky-500/10">
      <span className="text-slate-400 mr-1">{label}:</span>
      <span className="text-cyan-300 font-semibold">{v}</span>
    </div>
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
