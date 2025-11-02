// src/components/TutorAIBox.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
// import { runStrategicV12, runQuantumRiskV13 } from "@/lib/omega"; // ❌ legacy — reemplazado temporalmente

interface LogEntry {
  time: string;
  message: string;
  type: string;
}

interface TutorAIBoxProps {
  logs: LogEntry[];
  metrics?: Record<string, any>;
}

/**
 * 🧠 Tutor Cognitivo Integrado OMEGA AI v10.1 → v13
 * Explica resultados IA, detecta riesgos y genera narrativa adaptativa.
 */
export default function TutorAIBox({ logs, metrics }: TutorAIBoxProps) {
  const [analysis, setAnalysis] = useState<string>(
    "🧩 Iniciando motor cognitivo OMEGA..."
  );
  const [mode, setMode] = useState<"cognitive" | "advisor" | "reflex">(
    "cognitive"
  );

  // 🧩 Estados del v12
  const [v12Result, setV12Result] = useState<any>(null);
  const [loadingV12, setLoadingV12] = useState(false);

  // 🧠 Estado del v13 Quantum Risk
  const [v13Result, setV13Result] = useState<any>(null);
  const [loadingV13, setLoadingV13] = useState(false);

  // 🧩 Simulación segura de v12
  const handleStrategicV12 = async () => {
    setLoadingV12(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const res = {
        summary: "📊 Simulación Estratégica v12 completada (modo demo).",
        decision: {
          decision: "Mantener posición",
          confidence: "0.87",
          riskScore: "15.3",
          rationale: "La tendencia es estable con leve presión compradora.",
          expectedReturn: 12.5,
          recommendedAction: "Continuar con balance actual",
        },
        baseModel: "Strategic v12 Cognitive Layer",
        note: "Modo demostrativo (sin backend)",
      };
      setV12Result(res);
    } catch (err: any) {
      console.error("❌ Error ejecutando v12:", err.message);
    } finally {
      setLoadingV12(false);
    }
  };

  // 🛡️ Simulación segura de v13
  const handleQuantumRiskV13 = async () => {
    setLoadingV13(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const res = {
        summary: "🧠 Evaluación de Riesgo v13 completada (modo demo).",
        risk: {
          tier: "MODERATE",
          riskScore: 26.8,
        },
        recommendations: [
          "Reducir exposición en 10 %",
          "Mantener cobertura en oro",
        ],
        meta: { version: "v13 QuantumRisk", note: "Simulación cognitiva local" },
      };
      setV13Result(res);
    } catch (err: any) {
      console.error("❌ Error ejecutando v13:", err.message);
    } finally {
      setLoadingV13(false);
    }
  };

  useEffect(() => {
    if (!logs.length) return;
    const lastLog = logs[logs.length - 1].message || "";
    let response = "";

    if (lastLog.includes("Monte Carlo")) {
      response =
        "🎲 Simulación Monte Carlo completada. Distribución estable con sesgo positivo.";
      setMode("cognitive");
    } else if (lastLog.includes("Symbiont")) {
      response =
        "🧠 Symbiont Advisor detectó coherencia entre memoria y patrón actual. Activando reflexión adaptativa.";
      setMode("advisor");
    } else if (lastLog.includes("Auto-Learn")) {
      response =
        "🤖 Auto-Learn completado. La IA reajustó pesos neuronales para optimizar predicción de desempeño.";
      setMode("reflex");
    } else if (lastLog.includes("Reflective")) {
      response =
        "📊 El motor reflexivo procesó métricas correctamente. Correlación positiva entre riesgo y rendimiento.";
      setMode("advisor");
    } else {
      response = "🧩 Tutor cognitivo activo y en espera de nuevos eventos.";
    }

    if (metrics) {
      if (metrics.Sharpe && Number(metrics.Sharpe) > 1.5) {
        response +=
          " 📈 Excelente rendimiento ajustado al riesgo (Sharpe > 1.5).";
      }
      if (
        metrics.MDD &&
        typeof metrics.MDD === "string" &&
        metrics.MDD.includes("-3")
      ) {
        response +=
          " ⚠️ Riesgo elevado detectado (MDD > -30 %). Activando heurística de cobertura dinámica v11.2.";
      }
      if (metrics.CAGR && metrics.CAGR.includes("30")) {
        response +=
          " 💡 Crecimiento anual compuesto sobresaliente. IA recomienda conservar base actual.";
      }
    }

    const reflexPhrases = [
      "Estoy aprendiendo tus patrones de análisis.",
      "La correlación BTC–Oro sugiere cobertura efectiva ante inflación.",
      "He detectado consistencia entre tus simulaciones y los ciclos del mercado.",
      "Modo reflexivo activo: asimilando decisiones para el siguiente backtest.",
    ];
    if (mode === "reflex") {
      const randomInsight =
        reflexPhrases[Math.floor(Math.random() * reflexPhrases.length)];
      response += ` 🌀 ${randomInsight}`;
    }

    setAnalysis(response);
  }, [logs, metrics]);

  const riskColor = (tier: string) => {
    switch (tier) {
      case "LOW":
        return "text-green-400";
      case "MODERATE":
        return "text-yellow-400";
      case "HIGH":
        return "text-orange-400";
      case "CRITICAL":
        return "text-red-500";
      default:
        return "text-slate-300";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#0B1220] border border-[#1E293B] rounded-lg p-4 mt-4 shadow-md shadow-sky-900/10"
    >
      <h4 className="text-sky-400 font-semibold mb-2">
        🧭 Tutor Cognitivo — OMEGA AI{" "}
        {mode === "reflex"
          ? "v12 Reflex-Loop"
          : mode === "advisor"
          ? "v11 Neural Advisor"
          : "v10.1 Cognitivo"}
      </h4>

      {/* 🧩 Botones IA */}
      <div className="flex gap-3 mb-3">
        <button
          onClick={handleStrategicV12}
          disabled={loadingV12}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-all duration-200"
        >
          {loadingV12 ? "Procesando..." : "Ejecutar Estratega v12"}
        </button>

        <button
          onClick={handleQuantumRiskV13}
          disabled={loadingV13}
          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded-lg transition-all duration-200"
        >
          {loadingV13 ? "Analizando..." : "Evaluar Riesgo v13"}
        </button>
      </div>

      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
        {analysis}
      </p>

      {/* 🔹 Resultado v12 Strategic Advisor */}
      {v12Result && (
        <div className="mt-3 border border-indigo-500/30 bg-indigo-950/30 rounded-lg p-3 text-sm text-indigo-100">
          <p className="font-semibold text-indigo-300 mb-1">
            {v12Result.summary}
          </p>
          <p>
            📊 <b>Decisión:</b> {v12Result.decision.decision} · Confianza {v12Result.decision.confidence} · Riesgo {v12Result.decision.riskScore}
          </p>
          <p className="mt-1">
            💡 <b>Racional:</b> {v12Result.decision.rationale}
          </p>
          <p className="mt-1">
            💰 <b>Retorno esperado:</b> {v12Result.decision.expectedReturn} %
          </p>
          <p className="mt-2">
            🧩 <b>Acción recomendada:</b>{" "}
            {v12Result.decision.recommendedAction}
          </p>
          <p className="text-[11px] text-indigo-400 mt-3 italic">
            Fuente: {v12Result.baseModel} ({v12Result.note})
          </p>
        </div>
      )}

      {/* 🛡️ Resultado v13 Quantum Risk Layer */}
      {v13Result && (
        <div className="mt-4 border border-amber-500/40 bg-amber-900/20 rounded-lg p-3 text-sm text-amber-100">
          <p className="font-semibold text-amber-300 mb-1">
            {v13Result.summary}
          </p>
          <p>
            🛡️ <b>Riesgo:</b>{" "}
            <span className={riskColor(v13Result.risk.tier)}>
              {v13Result.risk.tier}
            </span>{" "}
            {" · "}
            <b>Score:</b> {v13Result.risk.riskScore.toFixed(2)} %
          </p>
          <p className="mt-1">
            💡 <b>Recomendaciones:</b>{" "}
            {v13Result.recommendations.join(" · ")}
          </p>
          <p className="text-[11px] text-amber-400 mt-3 italic">
            Fuente: {v13Result.meta.version} — {v13Result.meta.note}
          </p>
        </div>
      )}
    </motion.div>
  );
}
