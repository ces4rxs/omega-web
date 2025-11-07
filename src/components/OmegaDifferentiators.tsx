"use client";
import { motion } from "framer-motion";

export default function OmegaDifferentiators() {
  const points = [
    "15+ módulos de IA en paralelo (otros tienen 0–2)",
    "Precisión decimal institucional (otros usan float)",
    "Genetic algorithm optimizer (otros solo grid search)",
    "Quantum Risk v13 (tecnología única)",
    "Cognitive Risk v14 (modelado cerebral)",
    "Journal de auditoría completo (otros no tienen)",
    "Rate limiting inteligente (otros se caen con carga)",
  ];

  return (
    <section
      id="differentiators"
      className="relative min-h-[70vh] flex flex-col items-center justify-center text-white px-8 py-24 overflow-hidden"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_40%_30%,rgba(0,122,255,0.10),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(140,0,255,0.10),transparent_60%)] animate-pulse-slow" />

      <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-10 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
        🚀 Diferenciadores Únicos
      </h2>

      <p className="text-gray-400 text-center mb-12 max-w-2xl">
        Lo que <span className="text-blue-400 font-semibold">nadie más tiene</span> en backtesting cuantitativo.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl">
        {points.map((p, i) => (
          <motion.div
            key={p}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.07 }}
            viewport={{ once: true }}
            className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-3 shadow-[0_0_20px_rgba(0,0,0,0.45)] hover:shadow-[0_0_30px_rgba(0,150,255,0.25)] hover:bg-white/10 transition-all"
          >
            <span className="text-blue-400 text-2xl font-bold">🌟</span>
            <p className="text-gray-300 text-sm leading-relaxed">{p}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
