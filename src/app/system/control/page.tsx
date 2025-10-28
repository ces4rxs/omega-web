"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface LogEntry {
  time: string;
  message: string;
  type: "info" | "success" | "error";
}

interface V11Result {
  projectedSharpe: number;
  projectedMDD: number;
  projectedCAGR: number;
  stabilityIndex: number;
  antiOverfit: number;
  v11Score: number;
  quantGrade: string;
  insights?: string[];
}

interface V12Decision {
  time: string;
  decision: string;
  confidence: number;
  risk: number;
  alpha: number;
}

export default function ControlPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [v11Result, setV11Result] = useState<V11Result | null>(null);
  const [v12Result, setV12Result] = useState<any | null>(null);
  const [history, setHistory] = useState<V12Decision[]>([]);

  // 🔁 Cargar historial previo desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem("omega_v12_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // 💾 Guardar historial cuando cambie
  useEffect(() => {
    localStorage.setItem("omega_v12_history", JSON.stringify(history));
  }, [history]);

  // 🧩 Helper: registrar logs con formato y color
  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [
      { time: new Date().toLocaleTimeString("es-CO"), message, type },
      ...prev.slice(0, 49),
    ]);
  };

  // ⚙️ Ejecutores universales
  const runCommand = async (label: string, endpoint: string, method: "GET" | "POST" = "POST") => {
    if (isRunning) return;
    setIsRunning(true);
    addLog(`🚀 Ejecutando ${label}...`, "info");

    try {
      const res = await api.request({ url: endpoint, method });
      addLog(`✅ ${label} completado correctamente.`, "success");

      // 🧠 Si es el Advisor v11, guardamos su resultado aparte
      if (endpoint.includes("/ai/learn/v11")) {
        const result = res.data?.result?.stats;
        setV11Result(result);
        addLog(`📊 Advisor v11 analizado correctamente.`, "info");
      }

      // 🧩 Si es el Strategic Advisor v12, guardamos su salida también
      if (endpoint.includes("/ai/learn/v12")) {
        const result = res.data?.result;
        setV12Result(result);
        addLog(`📊 Strategic Advisor v12 analizado correctamente.`, "info");

        // 🧠 Guardar en historial v12.1
        const newEntry: V12Decision = {
          time: new Date().toLocaleTimeString("es-CO"),
          decision: result?.decision?.decision || "UNKNOWN",
          confidence: Number(result?.decision?.confidence ?? 0),
          risk: Number(result?.decision?.riskScore ?? 0),
          alpha: Number(result?.meta?.alpha ?? 0),
        };
        setHistory((prev) => [...prev.slice(-19), newEntry]); // máx 20 registros
      }

      addLog(`📦 Respuesta: ${JSON.stringify(res.data).slice(0, 400)}...`, "info");
    } catch (err: any) {
      addLog(`❌ Error en ${label}: ${err.message}`, "error");
    } finally {
      setIsRunning(false);
    }
  };

  // 🧮 Mapa numérico de decisiones para el gráfico
  const mapDecisionToValue = (d: string) => {
    if (d === "BUY") return 2;
    if (d === "HOLD") return 1;
    if (d === "ADAPT") return 0;
    if (d === "SELL") return -1;
    return 0;
  };

  const chartData = history.map((h, i) => ({
    name: i + 1,
    value: mapDecisionToValue(h.decision),
    confidence: (h.confidence * 100).toFixed(1),
  }));

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold text-sky-400 mb-2">🧠 OMEGA AI Control Center</h1>
      <p className="text-slate-400 mb-6">
        Ejecuta y monitorea los módulos cognitivos del núcleo OMEGA v10.3-B + v11 + v12 + v12.1.
      </p>

      {/* 🧭 Botones de control */}
      <div className="flex flex-wrap gap-4 mb-8">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => runCommand("Aprendizaje Cognitivo", "/ai/learn/memory")}
          disabled={isRunning}
          className="px-5 py-3 rounded-xl bg-sky-700 hover:bg-sky-600 font-medium disabled:opacity-50"
        >
          🧩 Refrescar Memoria
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => runCommand("Predicción Avanzada", "/ai/predict/advanced")}
          disabled={isRunning}
          className="px-5 py-3 rounded-xl bg-cyan-700 hover:bg-cyan-600 font-medium disabled:opacity-50"
        >
          🔮 Ejecutar Predicción
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => runCommand("Simulación Montecarlo", "/ai/montecarlo")}
          disabled={isRunning}
          className="px-5 py-3 rounded-xl bg-amber-700 hover:bg-amber-600 font-medium disabled:opacity-50"
        >
          🎲 Correr Montecarlo
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => runCommand("Refrescar Manifest", "/ai/manifest", "GET")}
          disabled={isRunning}
          className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 font-medium disabled:opacity-50"
        >
          ♻️ Actualizar Estado
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => runCommand("Neural Advisor v11", "/ai/learn/v11/demo-unnamed", "GET")}
          disabled={isRunning}
          className="px-5 py-3 rounded-xl bg-fuchsia-700 hover:bg-fuchsia-600 font-medium disabled:opacity-50"
        >
          🧠 Ejecutar Advisor v11
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => runCommand("Strategic Advisor v12", "/ai/learn/v12/demo-unnamed", "GET")}
          disabled={isRunning}
          className="px-5 py-3 rounded-xl bg-purple-800 hover:bg-purple-700 font-medium disabled:opacity-50"
        >
          🔮 Strategic Advisor v12
        </motion.button>
      </div>

      {/* 🖥️ Consola de Logs */}
      <section className="bg-slate-800/60 border border-sky-500/20 rounded-2xl p-4 shadow-inner h-[400px] overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <p className="text-slate-500">Esperando ejecución...</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="mb-1">
              <span className="text-slate-500 mr-2">[{log.time}]</span>
              <span
                className={
                  log.type === "error"
                    ? "text-red-400"
                    : log.type === "success"
                    ? "text-emerald-400"
                    : "text-sky-400"
                }
              >
                {log.message}
              </span>
            </div>
          ))
        )}
      </section>

      {/* 💠 Tarjeta de resultados v11 */}
      {v11Result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-slate-800/70 rounded-2xl border border-fuchsia-500/30 shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-fuchsia-400 mb-3">
            🧠 Omega Neural Advisor v11 — Reflexive Cognition Core
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-slate-300">
            <div>Sharpe: <span className="text-white font-semibold">{v11Result.projectedSharpe}</span></div>
            <div>MDD: <span className="text-white font-semibold">{v11Result.projectedMDD}</span></div>
            <div>CAGR: <span className="text-white font-semibold">{v11Result.projectedCAGR}</span></div>
            <div>Stability: <span className="text-white font-semibold">{v11Result.stabilityIndex}</span></div>
            <div>Anti-Overfit: <span className="text-white font-semibold">{v11Result.antiOverfit}</span></div>
            <div>Score: <span className="text-white font-semibold">{v11Result.v11Score}</span></div>
          </div>
          <p className="mt-3 text-slate-400">
            Calificación Global:{" "}
            <span className="text-fuchsia-400 font-bold">{v11Result.quantGrade}</span>
          </p>
          {v11Result.insights && v11Result.insights.length > 0 && (
            <ul className="mt-3 list-disc list-inside text-slate-400 text-sm">
              {v11Result.insights.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          )}
        </motion.div>
      )}

      {/* 🧠 Tarjeta de resultados v12 */}
      {v12Result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-slate-800/70 rounded-2xl border border-purple-500/30 shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-purple-400 mb-3">
            🔮 Omega Strategic Advisor v12 — Decision Engine
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-slate-300">
            <div>Decisión: <span className="text-white font-semibold">{v12Result?.decision?.decision}</span></div>
            <div>Confianza: <span className="text-white font-semibold">{(v12Result?.decision?.confidence * 100).toFixed(1)}%</span></div>
            <div>Alpha: <span className="text-white font-semibold">{v12Result?.meta?.alpha}</span></div>
            <div>Stabilidad: <span className="text-white font-semibold">{v12Result?.meta?.stability}</span></div>
            <div>Anti-Overfit: <span className="text-white font-semibold">{v12Result?.meta?.antiOverfit}</span></div>
            <div>Riesgo Relativo: <span className="text-white font-semibold">{v12Result?.decision?.riskScore}</span></div>
          </div>
          <p className="mt-3 text-slate-400">
            Acción Recomendada:{" "}
            <span className="text-purple-400 font-bold">{v12Result?.decision?.recommendedAction}</span>
          </p>
          {v12Result?.note && (
            <p className="mt-2 text-xs text-slate-500 italic">{v12Result.note}</p>
          )}
        </motion.div>
      )}

      {/* 📈 Historial de Decisiones v12.1 */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 p-6 bg-slate-800/70 rounded-2xl border border-indigo-500/30 shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-indigo-400 mb-4">
            📈 v12.1 – Decision Auto-Optimizer (Historial)
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis domain={[-1, 2]} tickFormatter={(v) =>
                v === 2 ? "BUY" : v === 1 ? "HOLD" : v === 0 ? "ADAPT" : "SELL"
              } stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  color: "#e2e8f0",
                }}
                formatter={(value: any, name: string) => {
                  if (name === "value")
                    return [
                      value === 2 ? "BUY" : value === 1 ? "HOLD" : value === 0 ? "ADAPT" : "SELL",
                      "Decisión",
                    ];
                  if (name === "confidence") return [`${value}%`, "Confianza"];
                  return [value, name];
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={2} dot />
              <Line type="monotone" dataKey="confidence" stroke="#38bdf8" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-slate-500 text-xs mt-2">
            Muestra las últimas {history.length} decisiones del OMEGA Strategic Advisor v12.
          </p>
        </motion.div>
      )}

      <p className="text-xs text-slate-600 mt-8 text-center">
        OMEGA Reflexive Core v10.3-B + v11 + v12 + v12.1 — Control Educativo Seguro
      </p>
    </main>
  );
}
