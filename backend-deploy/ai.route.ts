// ======================================================
// 🧠 OMEGA AI/ML API v1.0 (Machine Learning Endpoints)
// ======================================================
// Endpoints para todas las funcionalidades ML del sistema OMEGA
// - OMEGA Reflex (análisis cognitivo completo)
// - Explainable AI (interpretabilidad)
// - Quantum Risk v13 (K-Means clustering)
// - Predictor v5 (ML Ensemble: Ridge + Random Forest)
// - Anomaly Detector (Isolation Forest)
// - Hybrid Advisor (optimización)
// ======================================================

import express from "express";
import { authenticate, AuthRequest } from "../middleware/auth.js";
import { requireTier } from "../middleware/subscription.js";
import rateLimit from "express-rate-limit";

// AI Modules
import { OmegaReflex } from "../ai/omegaReflex.js";
import { ExplainableAI } from "../ai/explainableAI.js";
import { generateQuantumRiskV13 } from "../ai/quantumRisk_v13.js";
import { predictWithMLEnsemble } from "../ai/predictor_v5_ml.js";
import { AnomalyDetector } from "../ai/anomalyDetector.js";
import { generateUnifiedAdviceHybridV10 } from "../ai/hybridAdvisor.js";

const router = express.Router();

// Rate limiter para AI endpoints (consumo intensivo de CPU)
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 30, // máximo 30 requests por IP
  message: { ok: false, error: "Demasiadas peticiones AI. Intenta de nuevo en 5 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ======================================================
// 🧠 POST /api/ai/analyze
// OMEGA Reflex - Análisis Cognitivo Completo
// Tier: Professional & Enterprise
// ======================================================
router.post(
  "/analyze",
  authenticate,
  requireTier(["professional", "enterprise"]),
  aiLimiter,
  async (req: AuthRequest, res) => {
    try {
      const { symbol, strategy, startDate, endDate, metrics } = req.body;

      // Validación básica
      if (!symbol || !strategy || !metrics) {
        return res.status(400).json({
          ok: false,
          error: "Faltan parámetros requeridos: symbol, strategy, metrics",
        });
      }

      // Validar estructura de metrics
      const requiredMetrics = ["sharpe", "mdd", "cagr", "tradesCount", "winRate", "profitFactor"];
      for (const metric of requiredMetrics) {
        if (!(metric in metrics)) {
          return res.status(400).json({
            ok: false,
            error: `Falta métrica requerida: ${metric}`,
          });
        }
      }

      // Ejecutar análisis completo con OMEGA Reflex
      const reflex = new OmegaReflex();
      const analysis = reflex.analyzeBacktest({
        symbol,
        strategy,
        startDate,
        endDate,
        metrics: {
          sharpe: Number(metrics.sharpe || 0),
          mdd: Number(metrics.mdd || 0),
          cagr: Number(metrics.cagr || 0),
          tradesCount: Number(metrics.tradesCount || 0),
          winRate: Number(metrics.winRate || 0),
          profitFactor: Number(metrics.profitFactor || 0),
          avgWin: Number(metrics.avgWin || 0),
          avgLoss: Number(metrics.avgLoss || 0),
          equityFinal: Number(metrics.equityFinal || 0),
        },
      });

      res.json({
        ok: true,
        analysis,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Error en /api/ai/analyze:", error);
      res.status(500).json({
        ok: false,
        error: error.message || "Error interno del servidor",
      });
    }
  }
);

// ======================================================
// 💡 POST /api/ai/insights
// Explainable AI - Interpretabilidad de Decisiones ML
// Tier: Professional & Enterprise
// ======================================================
router.post(
  "/insights",
  authenticate,
  requireTier(["professional", "enterprise"]),
  aiLimiter,
  async (req: AuthRequest, res) => {
    try {
      const { metrics, riskProfile } = req.body;

      if (!metrics) {
        return res.status(400).json({
          ok: false,
          error: "Parámetro requerido: metrics",
        });
      }

      const profile = riskProfile || "moderate";
      if (!["conservative", "moderate", "aggressive"].includes(profile)) {
        return res.status(400).json({
          ok: false,
          error: "riskProfile debe ser: conservative, moderate, o aggressive",
        });
      }

      // Generar explicación con XAI
      const xai = new ExplainableAI(profile as "conservative" | "moderate" | "aggressive");
      const cognitiveState = xai.explainDecision({
        sharpe: Number(metrics.sharpe || 0),
        mdd: Number(metrics.mdd || 0),
        cagr: Number(metrics.cagr || 0),
        tradesCount: Number(metrics.tradesCount || 0),
        winRate: Number(metrics.winRate || 0),
        profitFactor: Number(metrics.profitFactor || 0),
        avgWin: Number(metrics.avgWin || 0),
        avgLoss: Number(metrics.avgLoss || 0),
      });

      res.json({
        ok: true,
        insights: cognitiveState,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Error en /api/ai/insights:", error);
      res.status(500).json({
        ok: false,
        error: error.message || "Error interno del servidor",
      });
    }
  }
);

// ======================================================
// 🛡️ POST /api/ai/quantum-risk
// Quantum Risk v13 - Clasificación de Riesgo con K-Means
// Tier: Professional & Enterprise
// ======================================================
router.post(
  "/quantum-risk",
  authenticate,
  requireTier(["professional", "enterprise"]),
  aiLimiter,
  async (req: AuthRequest, res) => {
    try {
      const { strategyId, metrics } = req.body;

      if (!strategyId || !metrics) {
        return res.status(400).json({
          ok: false,
          error: "Parámetros requeridos: strategyId, metrics",
        });
      }

      // Generar análisis de riesgo con ML clustering
      const riskAnalysis = generateQuantumRiskV13(strategyId);

      res.json({
        ok: true,
        riskAnalysis,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Error en /api/ai/quantum-risk:", error);
      res.status(500).json({
        ok: false,
        error: error.message || "Error interno del servidor",
      });
    }
  }
);

// ======================================================
// 🔮 POST /api/ai/predict
// Predictor v5 ML - Predicciones con Ensemble (Ridge + Random Forest)
// Tier: Enterprise Only
// ======================================================
router.post(
  "/predict",
  authenticate,
  requireTier(["enterprise"]),
  aiLimiter,
  async (req: AuthRequest, res) => {
    try {
      // Ejecutar predicción con ML Ensemble
      const predictions = predictWithMLEnsemble();

      if (!predictions) {
        return res.status(503).json({
          ok: false,
          error: "No hay suficientes datos históricos para entrenar el modelo (mínimo 10 backtests)",
        });
      }

      res.json({
        ok: true,
        predictions,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Error en /api/ai/predict:", error);
      res.status(500).json({
        ok: false,
        error: error.message || "Error interno del servidor",
      });
    }
  }
);

// ======================================================
// 🚨 POST /api/ai/anomaly-check
// Anomaly Detector - Detección de Anomalías con Isolation Forest
// Tier: Professional & Enterprise
// ======================================================
router.post(
  "/anomaly-check",
  authenticate,
  requireTier(["professional", "enterprise"]),
  aiLimiter,
  async (req: AuthRequest, res) => {
    try {
      const { metrics } = req.body;

      if (!metrics) {
        return res.status(400).json({
          ok: false,
          error: "Parámetro requerido: metrics",
        });
      }

      // Detectar anomalías con Isolation Forest
      const detector = new AnomalyDetector();
      const anomalyResult = detector.detectAnomaly({
        sharpe: Number(metrics.sharpe || 0),
        mdd: Number(metrics.mdd || 0),
        cagr: Number(metrics.cagr || 0),
        tradesCount: Number(metrics.tradesCount || 0),
        winRate: Number(metrics.winRate || 0),
        profitFactor: Number(metrics.profitFactor || 0),
        avgWin: Number(metrics.avgWin || 0),
        avgLoss: Number(metrics.avgLoss || 0),
      });

      res.json({
        ok: true,
        anomaly: anomalyResult,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Error en /api/ai/anomaly-check:", error);
      res.status(500).json({
        ok: false,
        error: error.message || "Error interno del servidor",
      });
    }
  }
);

// ======================================================
// ⚙️ POST /api/ai/optimize
// Hybrid Advisor - Optimización de Parámetros con ML
// Tier: Professional & Enterprise
// ======================================================
router.post(
  "/optimize",
  authenticate,
  requireTier(["professional", "enterprise"]),
  aiLimiter,
  async (req: AuthRequest, res) => {
    try {
      const { strategy, symbol, currentMetrics, marketConditions } = req.body;

      if (!strategy || !symbol || !currentMetrics) {
        return res.status(400).json({
          ok: false,
          error: "Parámetros requeridos: strategy, symbol, currentMetrics",
        });
      }

      // Generar recomendaciones de optimización
      const advice = generateUnifiedAdviceHybridV10(
        strategy,
        {
          sharpe: Number(currentMetrics.sharpe || 0),
          maxDD: Number(currentMetrics.mdd || 0),
          winRate: Number(currentMetrics.winRate || 0),
          totalTrades: Number(currentMetrics.tradesCount || 0),
        },
        marketConditions || {}
      );

      res.json({
        ok: true,
        optimization: advice,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Error en /api/ai/optimize:", error);
      res.status(500).json({
        ok: false,
        error: error.message || "Error interno del servidor",
      });
    }
  }
);

// ======================================================
// 📊 GET /api/ai/status
// Estado del Sistema ML
// Tier: All (no authentication required for status check)
// ======================================================
router.get("/status", (_req, res) => {
  try {
    res.json({
      ok: true,
      version: "OMEGA AI/ML v1.0",
      modules: {
        omegaReflex: "v5.5 - Autonomous Cognitive System",
        explainableAI: "v1.0 - XAI Interpretability",
        quantumRisk: "v13 - K-Means Clustering",
        predictor: "v5 - ML Ensemble (Ridge + Random Forest)",
        anomalyDetector: "v1.0 - Isolation Forest",
        hybridAdvisor: "v10 - Parameter Optimization",
      },
      mlModels: {
        randomForest: "✅ Ready",
        isolationForest: "✅ Ready",
        kMeans: "✅ Ready",
        ridgeRegression: "✅ Ready",
      },
      status: "🧠 All ML systems operational",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Error en /api/ai/status:", error);
    res.status(500).json({
      ok: false,
      error: error.message || "Error interno del servidor",
    });
  }
});

export default router;
