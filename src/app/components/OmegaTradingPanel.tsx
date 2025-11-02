"use client";

import TutorAIBox from "@/components/TutorAIBox";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  fetchManifest,
  runMonteCarlo,
  fetchReflectiveMarket,
  // fetchLiveMarkets,   // ❌ Eliminado: reemplazado por /ai/market/external-live
  runSymbiontV10,
  // runAutoLearn,       // ❌ Eliminado temporalmente
  fetchMarketHistory,
} from "@/lib/omega";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface LogEntry {
  time: string;
  message: string;
  type: "info" | "success" | "error";
}

export default function OmegaTradingPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [market, setMarket] = useState<any>({});
  const [btcHistory, setBtcHistory] = useState<any[]>([]);
  const [goldHistory, setGoldHistory] = useState<any[]>([]);
  const [autoLearnResult, setAutoLearnResult] = useState<any | null>(null);

  const addLog = (msg: string, type: LogEntry["type"] = "info") =>
    setLogs((prev) => [
      ...prev,
      { time: new Date().toLocaleTimeString("es-CO"), message: msg, type },
    ]);

  // 🧠 Cargar datos (LIVE -> fallback reflexivo)
  const fetchMarketData = async () => {
    try {
      // ⚡ Reemplazo: usamos el endpoint del backend en lugar de fetchLiveMarkets
      const live = await fetch("https://backtester-pro-1.onrender.com/ai/market/external-live").then((r) => r.json());
      if (live?.data) {
        setMarket(live.data);
        addLog("📡 Mercados LIVE cargados desde OMEGA BFF", "success");
        return;
      }
      const refl = await fetchReflectiveMarket();
      setMarket(refl.data);
      addLog("🧠 Datos reflexivos (fallback)", "info");
      refl.insights?.forEach((msg: string) => addLog(`🧠 Insight: ${msg}`, "info"));
    } catch (err: any) {
      addLog("⚠️ Error al cargar mercados, usando modo simulado", "error");
      const refl = await fetchReflectiveMarket();
      setMarket(refl.data);
    }
  };

  const loadMarketHistory = async () => {
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
  };

  useEffect(() => {
    fetchMarketData();
    loadMarketHistory();
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="bg-[#0F172A] border border-[#334155] rounded-2xl p-4 mt-4 shadow-lg shadow-sky-900/10">
      <h3 className="text-lg font-semibold text-sky-400 mb-2">
        ⚡ Panel de Control — OMEGA Markets
      </h3>
      <p className="text-sm text-slate-400 mb-4">
        Monitorea mercados globales y ejecuta módulos IA en tiempo real.
      </p>

      {/* 🌐 MERCADOS EN VIVO */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        {Object.entries(market || {}).map(([label, value]) => {
          if (label === "timestamp") return null;
          const color =
            label === "BTCUSD" ? "text-emerald-400" :
            label === "ETHUSD" ? "text-blue-400" :
            label === "XAUUSD" ? "text-amber-400" :
            label === "SP500" ? "text-sky-400" :
            "text-purple-400";
          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0B1220] rounded-xl border border-[#1E293B] p-3 text-center"
            >
              <p className="text-[11px] text-slate-400">{label}</p>
              <p className={`text-lg font-semibold ${color}`}>
                {value?.price == null ? "—" : `$${Number(value.price).toLocaleString()}`}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {value?.source ? `Fuente: ${value.source}` : ""}
              </p>
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs text-slate-500 mb-5 text-center">
        Última actualización:{" "}
        {market?.timestamp
          ? new Date(market.timestamp).toLocaleTimeString("es-CO")
          : "cargando..."}
      </p>

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

      {/* 🔹 Botones IA */}
      <div className="flex flex-wrap gap-3 mb-4 justify-center">
        <button onClick={handleManifest} disabled={loading} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm">Ver Manifest</button>
        <button onClick={handleMonteCarlo} disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm">Ejecutar Monte Carlo</button>
        <button onClick={handleSymbiont} disabled={loading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm">Analizar con IA Symbiont</button>
        <button onClick={handleAutoLearn} disabled={loading} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm">Ejecutar Auto-Learn</button>
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
