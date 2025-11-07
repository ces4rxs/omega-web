"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Activity, Brain, BarChart2, Settings } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string } | null>(null);

  // 🧠 Cargar usuario desde localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <main className="flex min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white">
      {/* ==== SIDEBAR LATERAL ==== */}
      <aside className="w-60 border-r border-white/10 bg-black/30 backdrop-blur-xl flex flex-col justify-between p-4">
        <div>
          <h1 className="text-xl font-bold text-center mb-6 tracking-widest">
            OMEGA <span className="text-blue-400">QUANTUM</span>
          </h1>

          <nav className="space-y-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-600/10 transition"
            >
              <Home size={18} /> <span>Inicio</span>
            </button>

            <button
              onClick={() => router.push("/backtest")}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-600/10 transition"
            >
              <Activity size={18} /> <span>Backtesting</span>
            </button>

            <button
              onClick={() => router.push("/ai")}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-600/10 transition"
            >
              <Brain size={18} /> <span>Asistente IA</span>
            </button>

            <button
              onClick={() => router.push("/reports")}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-600/10 transition"
            >
              <BarChart2 size={18} /> <span>Reportes</span>
            </button>
          </nav>
        </div>

        <div>
          <button
            onClick={() => router.push("/settings")}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-600/10 transition"
          >
            <Settings size={18} /> <span>Configuración</span>
          </button>
        </div>
      </aside>

      {/* ==== CONTENIDO PRINCIPAL ==== */}
      <section className="flex-1 p-10 overflow-y-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-2">
            Bienvenido{user?.name ? `, ${user.name}` : ""} 👋
          </h2>
          <p className="text-gray-400 mb-10">
            Tu panel de control cuántico está listo.  
            Explora tus estrategias, IA y análisis de rendimiento.
          </p>

          {/* Tarjetas de resumen */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-400/40 transition">
              <h3 className="text-lg font-semibold mb-2">💰 Rendimiento Total</h3>
              <p className="text-3xl font-bold text-blue-400">+12.5%</p>
              <p className="text-xs text-gray-400 mt-1">Últimos 30 días</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-400/40 transition">
              <h3 className="text-lg font-semibold mb-2">⚙️ Estrategias Activas</h3>
              <p className="text-3xl font-bold text-purple-400">3</p>
              <p className="text-xs text-gray-400 mt-1">SMA, RSI, Neural v11</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-400/40 transition">
              <h3 className="text-lg font-semibold mb-2">🧠 IA Analizando</h3>
              <p className="text-3xl font-bold text-cyan-400">BTCUSD</p>
              <p className="text-xs text-gray-400 mt-1">Neural Advisor v11</p>
            </div>
          </div>

          {/* CTA principal */}
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => router.push("/backtest")}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 px-8 py-4 rounded-xl font-bold shadow-[0_0_25px_rgba(59,130,246,0.4)] transition"
            >
              🚀 Iniciar Nuevo Backtest
            </button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
