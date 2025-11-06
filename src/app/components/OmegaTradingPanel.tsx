"use client";

import TutorAIBox from "@/components/TutorAIBox";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  fetchManifest,
  runMonteCarlo,
  fetchReflectiveMarket,
  // fetchLiveMarkets,   // ❌ Eliminado: reemplazado por /ai/market/external-live
  runSymbiontV10,
  // runAutoLearn,       // ❌ Eliminado temporalmente
  fetchMarketHistory,
  fetchMarketSnapshot,
  fetchMarketSeries,
  runBacktest,
  fetchBacktestHistory,
} from "@/lib/omega";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface LogEntry {
  time: string;
  message: string;
  type: "info" | "success" | "error";
}

const TIMEFRAMES = ["1m", "5m", "1h", "1d"] as const;
const SYMBOLS = ["BTCUSD", "ETHUSD", "SP500", "XAUUSD"] as const;

type Timeframe = (typeof TIMEFRAMES)[number];
type SymbolTicker = (typeof SYMBOLS)[number];

interface MarketTile {
  price?: number | null;
  source?: string;
  change24h?: number | null;
}

interface SeriesPoint {
  timestamp: string;
  price: number;
  t?: number;
}

interface BacktestRow {
  id: string;
  symbol: string;
  timeframe: string;
  pnl: number;
  sharpe: number;
  startedAt: string;
}

export default function OmegaTradingPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [snapshot, setSnapshot] = useState<{
    data: Record<string, MarketTile>;
    timestamp?: string;
    mode?: string;
  } | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolTicker>("BTCUSD");
  const [timeframe, setTimeframe] = useState<Timeframe>("1h");
  const [btcHistory, setBtcHistory] = useState<any[]>([]);
  const [goldHistory, setGoldHistory] = useState<any[]>([]);
  const [series, setSeries] = useState<SeriesPoint[]>([]);
  const [manifest, setManifest] = useState<any | null>(null);
  const [backtestRows, setBacktestRows] = useState<BacktestRow[]>([]);
  const [backtestSummary, setBacktestSummary] = useState<any | null>(null);
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(false);
  const [isSeriesLoading, setIsSeriesLoading] = useState(false);
  const [isBacktesting, setIsBacktesting] = useState(false);

  const addLog = useCallback(
    (msg: string, type: LogEntry["type"] = "info") =>
      setLogs((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString("es-CO"), message: msg, type },
      ]),
    []
  );

  const loadSnapshot = useCallback(async () => {
    setIsSnapshotLoading(true);
    try {
      const res = await fetchMarketSnapshot();
      setSnapshot({
        data: res?.data ?? {},
        timestamp: res?.timestamp,
        mode: res?.mode,
      });
      addLog(
        res?.mode === "live"
          ? "📡 Mercados LIVE sincronizados"
          : "🧠 Snapshot reflexivo cargado",
        res?.mode === "live" ? "success" : "info"
      );
    } catch (err: any) {
      addLog(`⚠️ Error snapshot: ${err.message}`, "error");
      const refl = await fetchReflectiveMarket();
      setSnapshot({ data: refl.data, timestamp: refl.lastUpdated, mode: "fallback" });
    } finally {
      setIsSnapshotLoading(false);
    }
  }, [addLog]);

  const loadSeries = useCallback(
    async (sym: SymbolTicker, tf: Timeframe) => {
      setIsSeriesLoading(true);
      try {
        const res = await fetchMarketSeries(sym, tf);
        setSeries(res ?? []);
        addLog(`📈 Serie ${sym} (${tf}) lista`, "success");
      } catch (err: any) {
        addLog(`⚠️ Serie simulada (${sym} ${tf})`, "error");
        setSeries([]);
      } finally {
        setIsSeriesLoading(false);
      }
    },
    [addLog]
  );

  const loadManifest = useCallback(async () => {
    try {
      const res = await fetchManifest();
      setManifest(res);
      addLog("📘 Manifest sincronizado", "success");
    } catch (err: any) {
      addLog(`Manifest offline: ${err.message}`, "error");
    }
  }, [addLog]);

  const loadBacktestHistory = useCallback(async (sym: SymbolTicker) => {
    try {
      const history = await fetchBacktestHistory(sym);
      const normalized: BacktestRow[] = (history || []).map((item: any, idx: number) => ({
        id: item.id ?? item.strategyId ?? `remote-${idx}`,
        symbol: item.symbol ?? sym,
        timeframe: item.timeframe ?? item.tf ?? timeframe,
        pnl:
          typeof item.pnl === "number"
            ? item.pnl
            : Number(item.pnl ?? item.pnlUsd ?? 0),
        sharpe:
          typeof item.sharpe === "number"
            ? item.sharpe
            : Number(item.sharpe ?? item.metrics?.sharpe ?? 0),
        startedAt: item.startedAt ?? item.createdAt ?? new Date().toISOString(),
      }));
      setBacktestRows(normalized);
      addLog(`🗂️ Historial de backtests (${sym}) listo`, "info");
    } catch (err: any) {
      addLog(`Error historial (${sym}): ${err.message}`, "error");
    }
  }, [addLog, timeframe]);

  const loadMarketHistory = useCallback(async () => {
    try {
      const [btcHist, goldHist] = await Promise.all([
        fetchMarketHistory("BTCUSD"),
        fetchMarketHistory("XAUUSD"),
      ]);
      setBtcHistory(btcHist);
      setGoldHistory(goldHist);
    } catch {
      addLog("⚠️ No se pudo cargar histórico (modo simulado)", "error");
    }
  }, [addLog]);

  useEffect(() => {
    loadSnapshot();
    loadManifest();
    loadMarketHistory();
    loadBacktestHistory("BTCUSD");
  }, [loadSnapshot, loadManifest, loadMarketHistory, loadBacktestHistory]);

  useEffect(() => {
    loadSeries(selectedSymbol, timeframe);
    loadBacktestHistory(selectedSymbol);
  }, [selectedSymbol, timeframe, loadSeries, loadBacktestHistory]);

  useEffect(() => {
    const interval = setInterval(loadSnapshot, 60000);
    return () => clearInterval(interval);
  }, [loadSnapshot]);

  const handleSymbiont = async () => {
    setLoading(true);
    addLog("🧠 Ejecutando Symbiont Advisor v10...", "info");
    try {
      const res = await runSymbiontV10("demo-unnamed");
      addLog("✅ Análisis Symbiont completado", "success");
      addLog(JSON.stringify(res.result?.summary || res, null, 2), "info");
    } catch (e: any) {
      addLog(`❌ Error Symbiont: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBacktest = async () => {
    setIsBacktesting(true);
    addLog(
      `🚀 Ejecutando backtest (${selectedSymbol} · ${timeframe})`,
      "info"
    );
    try {
      const res = await runBacktest({
        symbol: selectedSymbol,
        timeframe,
        capital: 12000,
      });
      setBacktestSummary(res);
      addLog("✅ Backtest completado", "success");
      addLog(JSON.stringify(res.result ?? res, null, 2), "info");
      await loadBacktestHistory(selectedSymbol);
    } catch (err: any) {
      addLog(`❌ Backtest falló: ${err.message}`, "error");
    } finally {
      setIsBacktesting(false);
    }
  };

  // ⚙️ Temporalmente deshabilitado para no romper el build
  const handleAutoLearn = async () => {
    setLoading(true);
    addLog("🎯 Auto-Learn v10.2 temporalmente deshabilitado", "info");
    addLog("ℹ️ Esta función se reactivará con el módulo Neural v11.", "info");
    setLoading(false);
  };

  const handleManifest = async () => {
    setLoading(true);
    addLog("📘 Solicitando manifest IA...", "info");
    try {
      const res = await fetchManifest();
      addLog("Manifest recibido ✅", "success");
      addLog(JSON.stringify(res, null, 2), "info");
    } catch (e: any) {
      addLog(`Error manifest: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMonteCarlo = async () => {
    setLoading(true);
    addLog("🎲 Ejecutando Monte Carlo (v4.4)...", "info");
    try {
      const res = await runMonteCarlo("demo-unnamed", 300);
      addLog("Simulación completada ✅", "success");
      addLog(JSON.stringify(res.result, null, 2), "info");
    } catch (e: any) {
      addLog(`Error Monte Carlo: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(
    () =>
      (series || []).map((point, idx) => ({
        idx,
        price: point.price,
        label: point.timestamp
          ? new Date(point.timestamp).toLocaleTimeString("es-CO", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : `t${idx}`,
      })),
    [series]
  );

  const activeTile = snapshot?.data?.[selectedSymbol];
  const manifestMetrics = manifest?.strategies?.[selectedSymbol] || manifest?.strategies?.default;
  const normalizedBacktest = backtestSummary?.result ?? backtestSummary?.data ?? backtestSummary;

  return (
    <div className="bg-[#0F172A] border border-[#334155] rounded-2xl p-5 mt-4 shadow-lg shadow-sky-900/10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-sky-400">
            ⚡ Panel de Control — OMEGA Markets
          </h3>
          <p className="text-sm text-slate-400">
            Monitorea mercados globales, ejecuta IA cuantitativa y analiza backtests en vivo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value as SymbolTicker)}
            className="bg-[#0B1220] border border-[#1E293B] text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {SYMBOLS.map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>

          <div className="flex gap-1 rounded-lg bg-[#0B1220] border border-[#1E293B] p-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  timeframe === tf
                    ? "bg-sky-600 text-white"
                    : "text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={loadSnapshot}
            disabled={isSnapshotLoading}
            className="px-3 py-2 bg-slate-800 text-xs text-slate-200 rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-60"
          >
            {isSnapshotLoading ? "Actualizando..." : "Refrescar"}
          </button>
        </div>
      </div>

      {/* 🌐 MERCADOS EN VIVO */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        {Object.entries(snapshot?.data ?? {}).map(([label, value]) => {
          if (label === "timestamp") return null;
          const color =
            label === "BTCUSD"
              ? "text-emerald-400"
              : label === "ETHUSD"
              ? "text-blue-400"
              : label === "XAUUSD"
              ? "text-amber-400"
              : label === "SP500"
              ? "text-sky-400"
              : "text-purple-400";
          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0B1220] rounded-xl border border-[#1E293B] p-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-400">{label}</p>
                {value?.change24h != null && (
                  <span
                    className={`text-[11px] font-medium ${
                      value.change24h >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {value.change24h >= 0 ? "+" : ""}
                    {value.change24h}%
                  </span>
                )}
              </div>
              <p className={`text-lg font-semibold ${color}`}>
                {value?.price == null
                  ? "—"
                  : `$${Number(value.price).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {value?.source ? `Fuente: ${value.source}` : snapshot?.mode === "live" ? "LIVE" : "Reflexivo"}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 mb-6">
        <span>
          Última actualización:{" "}
          {snapshot?.timestamp
            ? new Date(snapshot.timestamp).toLocaleTimeString("es-CO")
            : "cargando..."}
        </span>
        <span className="text-slate-400">
          Modo: {snapshot?.mode === "live" ? "Live" : snapshot?.mode ? snapshot.mode : "offline"}
        </span>
      </div>

      {/* 🔹 Mini Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#0B1220] rounded-xl border border-[#1E293B] p-3">
          <p className="text-xs text-slate-400 mb-1">Bitcoin (7d)</p>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={btcHistory}>
              <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#0B1220] rounded-xl border border-[#1E293B] p-3">
          <p className="text-xs text-slate-400 mb-1">Oro (7d)</p>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={goldHistory}>
              <Line type="monotone" dataKey="price" stroke="#fbbf24" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📊 Serie dinámica del activo seleccionado */}
      <div className="bg-[#0B1220] rounded-xl border border-[#1E293B] p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-400">{selectedSymbol} · timeframe {timeframe}</p>
            <p className="text-lg font-semibold text-slate-100">
              {activeTile?.price
                ? `$${Number(activeTile.price).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "Sin datos"}
            </p>
          </div>
          {isSeriesLoading && <span className="text-xs text-slate-500">Cargando serie...</span>}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <Line type="monotone" dataKey="price" stroke="#38bdf8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 Botones IA */}
      <div className="flex flex-wrap gap-3 mb-4 justify-center">
        <button onClick={handleManifest} disabled={loading} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm">Ver Manifest</button>
        <button onClick={handleMonteCarlo} disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm">Ejecutar Monte Carlo</button>
        <button onClick={handleSymbiont} disabled={loading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm">Analizar con IA Symbiont</button>
        <button onClick={handleAutoLearn} disabled={loading} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm">Ejecutar Auto-Learn</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#0B1220] border border-[#1E293B] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-200">Backtest & Riesgo</h4>
            <button
              onClick={handleBacktest}
              disabled={isBacktesting}
              className="px-3 py-1.5 text-xs rounded-lg bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-60"
            >
              {isBacktesting ? "Ejecutando..." : "Lanzar Backtest"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
            <MetricCard label="Sharpe" value={manifestMetrics?.sharpe ?? normalizedBacktest?.sharpe} suffix="" />
            <MetricCard label="PnL" value={normalizedBacktest?.pnl} prefix="$" decimals={2} />
            <MetricCard label="PnL %" value={normalizedBacktest?.pnlPct != null ? normalizedBacktest.pnlPct * 100 : undefined} suffix="%" decimals={2} />
            <MetricCard label="Trades" value={normalizedBacktest?.trades ?? manifestMetrics?.trades} decimals={0} />
          </div>

          {backtestSummary?.note && (
            <p className="mt-3 text-[12px] text-slate-400">{backtestSummary.note}</p>
          )}
        </div>

        <div className="bg-[#0B1220] border border-[#1E293B] rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-3">Insights IA</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              <span className="text-slate-400 text-[11px] uppercase tracking-wide">Manifest</span>
              <p>
                {manifest?.version ?? "Modo offline"} · {manifest?.timestamp ? new Date(manifest.timestamp).toLocaleString("es-CO") : "sin timestamp"}
              </p>
            </li>
            <li>
              <span className="text-slate-400 text-[11px] uppercase tracking-wide">Spot {selectedSymbol}</span>
              <p>
                {activeTile?.price
                  ? `$${Number(activeTile.price).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : "—"}
              </p>
            </li>
            <li>
              <span className="text-slate-400 text-[11px] uppercase tracking-wide">Modo IA</span>
              <p>{snapshot?.mode === "live" ? "Live" : snapshot?.mode === "reflective" ? "Reflexivo" : "Offline"}</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-[#0B1220] border border-[#1E293B] rounded-xl p-4 mb-6 overflow-hidden">
        <h4 className="text-sm font-semibold text-slate-200 mb-3">Historial de estrategias</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-slate-300">
            <thead className="text-[11px] uppercase text-slate-500">
              <tr>
                <th className="text-left py-2 pr-4">Estrategia</th>
                <th className="text-left py-2 pr-4">Timeframe</th>
                <th className="text-right py-2 pr-4">PnL</th>
                <th className="text-right py-2 pr-4">Sharpe</th>
                <th className="text-right py-2">Inicio</th>
              </tr>
            </thead>
            <tbody>
              {backtestRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">
                    Sin ejecuciones registradas.
                  </td>
                </tr>
              )}
              {backtestRows.map((row) => (
                <tr key={row.id} className="border-t border-[#1E293B]">
                  <td className="py-2 pr-4 font-medium text-slate-200">{row.id}</td>
                  <td className="py-2 pr-4">{row.timeframe}</td>
                  <td className={`py-2 pr-4 text-right ${row.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    ${row.pnl.toFixed(2)}
                  </td>
                  <td className="py-2 pr-4 text-right">{row.sharpe.toFixed(2)}</td>
                  <td className="py-2 text-right text-slate-400">
                    {new Date(row.startedAt).toLocaleString("es-CO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 Consola */}
      <div className="bg-[#0B1220] border border-[#334155] rounded-lg p-3 h-72 overflow-auto text-sm font-mono">
        {logs.length === 0 && <p className="text-slate-500">Esperando comandos...</p>}
        {logs.map((log, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`mb-1 ${
              log.type === "error"
                ? "text-red-400"
                : log.type === "success"
                ? "text-emerald-400"
                : "text-slate-300"
            }`}
          >
            [{log.time}] {log.message}
          </motion.div>
        ))}
      </div>

      <TutorAIBox logs={logs} />
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

function MetricCard({ label, value, prefix = "", suffix = "", decimals = 2 }: MetricCardProps) {
  const numericValue =
    typeof value === "number"
      ? value
      : value != null
      ? Number(value)
      : undefined;

  return (
    <div className="bg-[#091020] border border-[#1E293B] rounded-lg p-3">
      <p className="text-[11px] text-slate-400 mb-1">{label}</p>
      <p className="text-base font-semibold text-slate-100">
        {numericValue == null
          ? "—"
          : `${prefix}${numericValue.toFixed(decimals)}${suffix}`}
      </p>
    </div>
  );
}
