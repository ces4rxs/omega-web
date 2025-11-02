// src/lib/omega.ts
// 🌐 Cliente híbrido para Omega AI Server (v9 → v10.3-B)
// Auto: usa backend real (Render) si está disponible, o fallback educativo offline.

import api from "@/lib/api";

// ---------- ⚙️ Helper: verificar conexión ----------
async function tryBackend(path: string) {
  try {
    const { data } = await api.get(path);
    return data;
  } catch (err: any) {
    console.warn(`⚠️ Backend no disponible para ${path}:`, err.message);
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/market/external-live`);
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
