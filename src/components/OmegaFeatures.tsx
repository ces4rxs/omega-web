"use client";
import { motion } from "framer-motion";

export default function OmegaFeatures() {
  const features = [
    {
      title: "Motor de Backtesting Institucional (v3.19)",
      desc: "Precisión tipo hedge fund: aritmética Decimal.js (sin floats), ledger de triple entrada, slippage realista y journal de auditoría por trade.",
      quote:
        "El único backtester con precisión institucional. Mientras otros pierden centavos, OMEGA usa aritmética decimal pura.",
    },
    {
      title: "Stack de IA Multicapa (15+ módulos)",
      desc: "Neural Advisor v11, Strategic Advisor v12, Quantum Risk v13, Cognitive Risk v14, Monte Carlo v4.5, Genetic Optimizer v5.",
      quote:
        "No es solo un backtester, es un equipo de analistas cuantitativos 24/7. Redes neuronales + Monte Carlo + Algoritmos genéticos.",
    },
    {
      title: "Datos Profesionales (Polygon.io)",
      desc: "Stocks (NYSE/NASDAQ/AMEX), Crypto top 100, múltiples timeframes (1m–1M) y 20+ años de historia.",
      quote:
        "Los mismos datos que usan los hedge funds. Precisión de Wall Street para tus backtests.",
    },
    {
      title: "Velocidad & Performance",
      desc: "10k barras <2s, backtests multi-año <5s, Monte Carlo (1,000 sims) <10s, optimización genética (100 gen) <30s.",
      quote:
        "Lo que otros hacen en minutos, OMEGA lo hace en segundos. TS + algoritmos optimizados.",
    },
    {
      title: "Métricas Profesionales",
      desc: "Sharpe, Sortino, Calmar, CAGR, MDD, Profit Factor, Recovery Factor, Ulcer Index y más.",
      quote:
        "Métricas que los traders profesionales realmente usan para medir consistencia y riesgo.",
    },
    {
      title: "Estrategias Battle-Tested",
      desc: "SMA Crossover, RSI Mean Reversion, Trend Following + SDK para tus propios algoritmos.",
      quote:
        "3 estrategias pro incluidas + SDK completo. Desde principiante hasta quant PhD.",
    },
  ];

  return (
    <section
      id="features"
      className="relative min-h-screen flex flex-col items-center justify-center text-white px-8 py-24 overflow-hidden"
    >
      {/* Fondo cuántico sutil */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(0,122,255,0.10),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(140,0,255,0.10),transparent_60%)] animate-pulse-slow" />

      <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-16 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0,150,255,0.2)]">
        🧠 Características Destacadas
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: i * 0.08 }}
            viewport={{ once: true, margin: "-80px" }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:-translate-y-1 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.45)] hover:shadow-[0_0_40px_rgba(50,120,255,0.2)]"
          >
            <h3 className="text-xl font-semibold text-blue-400 mb-2">{f.title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">{f.desc}</p>
            <p className="text-gray-400 italic text-xs border-l-2 border-blue-500 pl-3">
              “{f.quote}”
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
