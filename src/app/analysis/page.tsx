"use client";
// src/app/analysis/page.tsx

import { useAIEvents } from "@/hooks/useAIEvents";
import OptimizerOverlay from "@/components/OptimizerOverlay";
import { motion } from "framer-motion";
import { Cpu, LineChart, Loader2 } from "lucide-react";

export default function AnalysisPage() {
  const { optimizerEvt, clear } = useAIEvents();

  const handleRunOptimizer = async (evt: any) => {
    console.log("⚙️ Ejecutar optimizador con evento:", evt);
    // por ahora solo frontend; luego conectarás con /ai/optimizer/run
    // const res = await api.post("/ai/optimizer/run", {...});
    clear();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <LineChart size={28} className="text-blue-400" />
          <h1 className="text-3xl font-bold">Análisis Cuántico</h1>
        </div>

        <p className="text-gray-400 mb-10 max-w-2xl">
          Visualiza en tiempo real las señales y divergencias detectadas por la IA.
          Este módulo usa los motores <span className="text-blue-400">Hybrid v10</span> y{" "}
          <span className="text-cyan-400">Neural Advisor v11</span> para sugerir
          entradas, salidas y niveles óptimos de riesgo.
        </p>

        {/* Espacio para tu chart */}
        <div className="relative border border-white/10 rounded-xl bg-white/5 h-[500px] flex items-center justify-center">
          <div className="text-center">
            <Cpu size={42} className="text-blue-400 animate-pulse mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-2">
              Inicializando motor de análisis...
            </h2>
            <p className="text-gray-400 text-sm">
              Cargando datos de mercado y parámetros de IA.
            </p>
            <Loader2 className="animate-spin text-blue-400 mx-auto mt-6" size={28} />
          </div>
        </div>

        {/* Botón flotante dinámico */}
        <OptimizerOverlay
          event={optimizerEvt}
          onRun={handleRunOptimizer}
          onClose={clear}
        />
      </motion.div>
    </main>
  );
}
