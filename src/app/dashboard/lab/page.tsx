"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis } from "recharts";
import api from "@/lib/api";

export default function OmegaStrategyLab() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [response, setResponse] = useState<any>(null);

  // 🚀 Cargar estrategias del usuario
  useEffect(() => {
    api.get("/api/strategies/mine")
      .then(res => setStrategies(res.data.strategies || []))
      .catch(err => console.error("Error al cargar estrategias:", err))
      .finally(() => setLoading(false));
  }, []);

  // 🧠 Ejecutar simulación cognitiva
  const runSimulation = async () => {
    if (!selected) return;
    setThinking(true);
    setResponse(null);
    try {
      const res = await api.post("/ai/symbiont", { strategyId: selected.id });
      setResponse(res.data);
    } catch (err) {
      console.error("Error en simulación:", err);
      alert("❌ Error al ejecutar la simulación cognitiva");
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-8">
      <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
        🧠 OMEGA Strategy Lab™
      </h1>
      <p className="text-gray-400 mb-8">
        Laboratorio cognitivo con Tutor Symbiont v10 — versión 1-G (Visual Cognitive Interface)
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 📊 Panel de Estrategias */}
        <div className="bg-[#111827] p-6 rounded-2xl shadow-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">📈 Mis Estrategias</h2>

          {loading && <p className="text-gray-400">Cargando estrategias...</p>}

          {!loading && strategies.length === 0 && (
            <p className="text-gray-500">Aún no tienes estrategias.</p>
          )}

          <div className="space-y-3">
            {strategies.map((s) => (
              <motion.div
                key={s.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl cursor-pointer transition-colors ${
                  selected?.id === s.id
                    ? "bg-gradient-to-r from-purple-600 to-blue-700"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
                onClick={() => setSelected(s)}
              >
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-gray-300">{s.symbol} · {s.timeframe}</p>
              </motion.div>
            ))}
          </div>

          <button
            onClick={runSimulation}
            disabled={!selected || thinking}
            className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            {thinking ? "🧠 Analizando..." : "🚀 Ejecutar Simulación Cognitiva"}
          </button>
        </div>

        {/* 🧩 Panel Cognitivo */}
        <div className="bg-[#111827] p-6 rounded-2xl shadow-xl border border-gray-700 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">🤖 Tutor Symbiont v10</h2>

          <div className="flex-1 overflow-y-auto max-h-[65vh] pr-2">
            <AnimatePresence>
              {thinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-blue-400 animate-pulse text-center mt-10"
                >
                  ⏳ Procesando análisis cognitivo...
                </motion.div>
              )}

              {!thinking && response && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-gray-900 rounded-xl border border-gray-700">
                    <h3 className="font-bold text-lg mb-2">📘 Diagnóstico Cognitivo</h3>
                    <p className="text-gray-300 whitespace-pre-line">
                      {response.summary || "Sin resumen disponible"}
                    </p>
                  </div>

                  {response.stats && (
                    <div className="p-4 bg-gray-900 rounded-xl border border-gray-700">
                      <h3 className="font-bold text-lg mb-2">📊 Métricas Clave</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(response.stats).map(([k, v]) => (
                          <p key={k} className="text-gray-400">
                            <span className="text-white font-medium">{k}:</span> {String(v)}
                          </p>
                        ))}
                      </div>

                      {/* Mini-gráfico */}
                      <div className="h-32 mt-4">
                        <ResponsiveContainer>
                          <LineChart
                            data={[
                              { x: 0, y: 0 },
                              { x: 1, y: Number(response.stats?.robustnessProb ?? 70) },
                              { x: 2, y: Number(response.stats?.quantumRating ?? 75) },
                            ]}
                          >
                            <Line type="monotone" dataKey="y" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                            <Tooltip />
                            <XAxis hide />
                            <YAxis hide />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {response.insights && (
                    <div className="p-4 bg-gray-900 rounded-xl border border-gray-700">
                      <h3 className="font-bold text-lg mb-2">💡 Insights del Tutor</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        {response.insights.map((i: string, idx: number) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            {i}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {response.recommendations && (
                    <div className="p-4 bg-gray-900 rounded-xl border border-gray-700">
                      <h3 className="font-bold text-lg mb-2">🧭 Recomendaciones</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        {response.recommendations.map((r: string, idx: number) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            {r}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
