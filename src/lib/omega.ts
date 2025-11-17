// src/lib/omega.ts
// 🌐 Cliente híbrido para Omega AI Server (v9 → v10.3-B)
// Auto: usa backend real (Render) si está disponible, o fallback educativo offline.

import { api } from "@/lib/api";

// ---------- ⚙️ Helper: verificar conexión ----------
async function tryBackend<T = any>(path: string): Promise<T | null> {
  try {
    const data = await api.get<T>(path);
    return data;
  } catch (err: any) {
    console.warn(`⚠️ Backend no disponible para ${path}:`, err.message);
    return null;
  }
}

async function postBackend<T = any>(path: string, payload: any): Promise<T | null> {
  try {
    const data = await api.post<T>(path, payload);
    return data;
  } catch (err: any) {
    console.warn(`⚠️ Backend no disponible para ${path} (POST):`, err.message);
    return null;
  }
}

// ---------- 🧠 BÁSICOS ----------
export async function fetchManifest() {
  const data = await tryBackend("/ai/manifest");
  if (data) return data;

  // 🧩 Fallback local sin backend
  return {
    ok: true,
    mode: "mock",
    version: "v10.3-B (offline)",
    marketData: {
      BTCUSD: 68250,
      SP500: 5050,
      XAUUSD: 2378,
    },
    note: "Modo educativo (sin conexión con servidor IA)",
  };
}

export async function normalizeMarketDataFromManifest(manifest: any) {
  const md = manifest?.marketData || manifest || {};
  return {
    BTCUSD: md.BTCUSD ?? null,
    SP500: md.SP500 ?? null,
    XAUUSD: md.XAUUSD ?? null,
  };
}

// ---------- 🧩 MEMORIA v9 ----------
export async function fetchMemory() {
  const data = await tryBackend("/ai/learn/memory");
  return (
    data || {
      samples: [],
      stats: { totalSamples: 0 },
      note: "⚠️ Memoria desconectada — modo offline",
    }
  );
}

// ---------- 🤖 SYMBIONT v10 ----------
export async function runSymbiontV10(strategyId: string) {
  const data = await tryBackend(`/ai/learn/symbiont/${encodeURIComponent(strategyId)}`);
  return (
    data || {
      ok: true,
      mode: "offline",
      result: {
        summary: "Modo educativo — sin conexión con IA Symbiont",
        stats: { performance: 0.82 },
      },
    }
  );
}

// ---------- 🧩 PREDICTOR AVANZADO ----------
export async function runAdvancedPredict(strategyId = "demo-unnamed") {
  const data = await tryBackend(`/ai/predict/advanced/${encodeURIComponent(strategyId)}`);
  return (
    data || {
      ok: true,
      version: "v4.4 (mock)",
      prediction: {
        expectedReturn: 0.042,
        risk: 0.12,
        signal: "BUY",
      },
      note: "Predicción simulada sin backend.",
    }
  );
}

// ---------- 🎲 MONTE CARLO ----------
export async function runMonteCarlo(strategyId = "demo-unnamed", runs = 300) {
  const data = await tryBackend(`/ai/montecarlo/${encodeURIComponent(strategyId)}?runs=${runs}`);
  return (
    data || {
      ok: true,
      runs,
      simulated: true,
      meanReturn: 0.037,
      volatility: 0.11,
      note: "Simulación Monte Carlo (modo local)",
    }
  );
}

// ---------- 🧠 REFLEXIVE MARKET ----------
export async function fetchReflectiveMarket() {
  const data = await tryBackend("/ai/markets/live");
  if (data)
    return {
      ok: true,
      version: "v10.3-B (Real Data)",
      data,
      insights: ["✅ Datos reales cargados desde servidor Omega."],
    };

  // ⚠️ Fallback local
  return {
    ok: false,
    version: "v10.3-B (Offline Fallback)",
    lastUpdated: new Date().toISOString(),
    data: {
      BTCUSD: 68120,
      XAUUSD: 2383,
      SP500: 5092,
    },
    correlations: {
      "BTC-Oro": 0.63,
      "BTC-S&P500": 0.45,
    },
    insights: [
      "⚠️ Servidor IA no disponible — modo educativo activado.",
      "📊 Datos simulados (CoinGecko + MetalsAPI placeholders).",
    ],
  };
}

// ---------- 📊 SNAPSHOT + SERIES ----------
export async function fetchMarketSnapshot() {
  const direct = await tryBackend("/ai/market/external-live");
  if (direct?.data) {
    return {
      ...direct,
      timestamp: direct.timestamp ?? new Date().toISOString(),
      mode: "live",
    };
  }

  const fallback = await fetchReflectiveMarket();
  return {
    data: fallback.data,
    timestamp: fallback.lastUpdated ?? new Date().toISOString(),
    mode: fallback.ok ? "reflective" : "offline",
  };
}

export async function fetchMarketSeries(symbol: string, timeframe: string) {
  const data = await tryBackend(
    `/ai/market/history?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(timeframe)}`
  );

  if (data?.series) {
    return data.series;
  }

  const points = timeframe === "1d" ? 120 : timeframe === "1h" ? 72 : 40;
  const step =
    timeframe === "1d"
      ? 24 * 60 * 60 * 1000
      : timeframe === "1h"
      ? 60 * 60 * 1000
      : timeframe === "5m"
      ? 5 * 60 * 1000
      : 60 * 1000;
  const seed = symbol
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array.from({ length: points }).map((_, idx) => {
    const base =
      symbol === "BTCUSD"
        ? 65000
        : symbol === "ETHUSD"
        ? 3200
        : symbol === "XAUUSD"
        ? 2350
        : symbol === "SP500"
        ? 5100
        : 100;
    const noise = Math.sin(idx / 3 + seed) * (timeframe === "1m" ? 6 : 18);
    return {
      t: idx,
      price: Number((base + noise + Math.random() * 12).toFixed(2)),
      timestamp: new Date(Date.now() - (points - idx) * step).toISOString(),
    };
  });
}

// ---------- 🧪 BACKTESTING ----------
export interface BacktestPayload {
  strategy: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialCash?: number;
  feeBps?: number;
  slippageBps?: number;
  params?: Record<string, any>;
}

/**
 * Ejecuta un backtest en el backend real
 * Endpoint: POST /api/backtest
 * Requiere autenticación JWT
 */
export async function runBacktest(payload: BacktestPayload) {
  try {
    // Validar fechas
    if (!payload.startDate || !payload.endDate) {
      throw new Error("startDate y endDate son requeridos");
    }

    // Construir payload según formato del backend
    const body = {
      strategy: payload.strategy,
      symbol: payload.symbol,
      timeframe: payload.timeframe || "day",
      startDate: payload.startDate,
      endDate: payload.endDate,
      initialCash: payload.initialCash ?? 10000,
      feeBps: payload.feeBps ?? 10,
      slippageBps: payload.slippageBps ?? 5,
      ...(payload.params && { params: payload.params }),
    };

    console.log("🚀 Enviando backtest al backend:", body);

    // Llamar al backend real
    const data = await api.post("/api/backtest", body);

    console.log("✅ Respuesta del backend:", data);

    return data;
  } catch (error: any) {
    console.error("❌ Error en runBacktest:", error);

    // Manejo de errores específicos
    if (error.message?.includes("429") || error.message?.includes("Demasiados backtests")) {
      throw new Error("Límite de backtests alcanzado. Intenta de nuevo en 5 minutos.");
    }

    if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
      throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
    }

    if (error.message?.includes("403") || error.message?.includes("Forbidden")) {
      throw new Error("No tienes permisos para ejecutar backtests. Verifica tu suscripción.");
    }

    // Error genérico
    throw new Error(error.message || "Error al ejecutar el backtest. Intenta nuevamente.");
  }
}

// ======================================================
// 🧠 OPTIMIZER V5 (AI Quantitative Analysis)
// ======================================================
export interface OptimizerRequest {
  symbol: string;
  timeframe: string;
  capital?: number;
}

export async function runOptimizerV5(payload: OptimizerRequest) {
  const body = {
    symbol: payload.symbol,
    timeframe: payload.timeframe,
    capital: payload.capital ?? 25000,
    optimizer: "optimizer_v5",
  };

  const data = await postBackend("/ai/optimizer/v5", body);
  if (data) {
    return data;
  }

  return {
    ok: true,
    simulated: true,
    jobId: `offline-${Date.now()}`,
    note: "Optimizer_v5 ejecutado en modo educativo (sin backend).",
    summary: {
      symbol: payload.symbol,
      timeframe: payload.timeframe,
      expectedSharpe: Number((1.4 + Math.random() * 0.4).toFixed(2)),
      riskScore: Math.round(45 + Math.random() * 30),
      windowSuggestion: `${["17 sesiones", "14 sesiones", "21 sesiones"][Math.floor(Math.random() * 3)]}`,
    },
  };
}

// ======================================================
// 🔍 Backtest History (tu función antigua debe seguir aquí)
// ======================================================
export async function fetchBacktestHistory(symbol: string) {
  const data = await api.get(`/ai/backtest/history/${symbol}`);
  return data;
}

// ---------- 📈 HISTÓRICO DE MERCADO ----------
export async function fetchMarketHistory(symbol: "BTCUSD" | "XAUUSD") {
  try {
    if (symbol === "BTCUSD") {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7"
      );
      const data = await res.json();
      return data.prices.map(([timestamp, price]: [number, number]) => ({
        time: new Date(timestamp).toLocaleDateString("es-CO", { weekday: "short" }),
        price,
      }));
    }
    if (symbol === "XAUUSD") {
      const base = 2380;
      return Array.from({ length: 7 }).map((_, i) => ({
        time: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i],
        price: base + Math.sin(i) * 8 + Math.random() * 4,
      }));
    }
    throw new Error("Símbolo no soportado");
  } catch {
    return Array.from({ length: 7 }).map((_, i) => ({
      time: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i],
      price: symbol === "BTCUSD" ? 68000 + Math.random() * 700 : 2380 + Math.random() * 5,
    }));
  }
}
// ------------------------------------------------------
// 🩹 Compatibilidad temporal — funciones legacy (v9/v10)
// ------------------------------------------------------

/**
 * Simula carga de mercados LIVE (modo BFF)
 * Compatible con OmegaTradingPanel antiguo.
 */
export async function fetchLiveMarkets() {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://backtester-pro-1.onrender.com";
    const res = await fetch(`${baseURL}/ai/market/external-live`);
    const data = await res.json();
    return { data };
  } catch {
    // Fallback educativo local
    return {
      data: {
        BTCUSD: { price: 110487, source: "sim" },
        ETHUSD: { price: 3892.55, source: "sim" },
        XAUUSD: { price: 2378.0, source: "sim" },
        SP500: { price: 5050, source: "sim" },
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Simula ejecución Auto-Learn v10.2 (modo demo)
 * Devuelve resultados para compatibilidad del panel IA.
 */
export async function runAutoLearn() {
  return {
    result: {
      base: {
        name: "AutoLearn v10.2 Demo",
        metrics: {
          sharpe: 1.72,
          mdd: 8.1,
        },
        robustness: 94.5,
      },
      frontier: [
        {
          judge: {
            antiOverfit: 0.83,
          },
        },
      ],
    },
  };
}
