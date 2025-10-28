// src/lib/omega.ts
// 🌐 Cliente seguro para Omega AI Server (v9 → v10.3-B)
// Centraliza todas las llamadas al backend de IA y mantiene compatibilidad total con tu sistema.

import api from "@/lib/api";

// ---------- 🧠 BÁSICOS ----------
export async function fetchManifest() {
  const { data } = await api.get("/ai/manifest");
  return data;
}

export async function normalizeMarketDataFromManifest(manifest: any) {
  const md = manifest?.marketData || {};
  return {
    BTCUSD: md.BTCUSD ?? null,
    SP500: md.SP500 ?? null,
    XAUUSD: md.XAUUSD ?? null,
  };
}

// ---------- 🧩 MEMORIA v9 ----------
export async function fetchMemory() {
  const { data } = await api.get("/ai/learn/memory");
  return data;
}

export async function fetchAdvice(strategyId: string) {
  const { data } = await api.get(`/ai/learn/advice/${encodeURIComponent(strategyId)}`);
  return data;
}

// ---------- 🤖 SYMBIONT v10 ----------
export async function runSymbiontV10(strategyId: string) {
  const { data } = await api.get(`/ai/learn/symbiont/${encodeURIComponent(strategyId)}`);
  return data; // { ok, mode, result: { summary, stats, brainprint, ... } }
}

// ---------- 🧩 PREDICTOR AVANZADO v4.4 ----------
export async function runAdvancedPredict(strategyId = "demo-unnamed") {
  const { data } = await api.get(`/ai/predict/advanced/${encodeURIComponent(strategyId)}`);
  return data; // { ok, predictedSharpe, predictedMDD, predictedCAGR, antiOverfit, confidence, ... }
}

// ---------- 🎲 MONTE CARLO v4.4 ----------
export async function runMonteCarlo(strategyId = "demo-unnamed", runs = 300) {
  const { data } = await api.get(`/ai/montecarlo/${encodeURIComponent(strategyId)}?runs=${runs}`);
  return data; // { ok, result: { runs, meanReturn, p95Return, p05Return, expectedMDD, antiOverfit }, ... }
}

// ---------- 📊 REPORTES PÚBLICOS ----------
export async function createPublicReport(strategyId: string) {
  const { data } = await api.post("/ai/reports", { strategyId });
  return data as { success: boolean; publicUrl: string; message?: string };
}

export async function fetchReportById(reportId: string) {
  const { data } = await api.get(`/ai/report/${encodeURIComponent(reportId)}`);
  return data; // contenido del reporte IA
}

// ---------- 🧬 BRAINPRINT v10 ----------
export async function sendBrainprint(payload: {
  strategyId: string;
  stats?: any;
  riskProfile?: any;
  habits?: any;
  labels?: string[];
  notes?: string;
}) {
  const { data } = await api.post("/ai/brainprint", payload);
  return data;
}

// ---------- 🔁 AUTO-LEARN v10.2 ----------
export async function runAutoLearn() {
  const { data } = await api.post("/ai/autolearn", {});
  return data; // { ok, result }
}

// ---------- 🪞 REFLECTIVE DASHBOARD v10.3-B ----------
export async function fetchReflectiveReport(strategyId = "demo-unnamed") {
  const { data } = await api.get(`/ai/reflective/${encodeURIComponent(strategyId)}`);
  return data; // { ok, insights, metrics, autoSummary, recommendations }
}

// ---------- 🧠 CONSOLA WEB / MODO QUERY ----------
export async function callOmegaWebQuery(query: string, mode = "symbiont") {
  const { data } = await api.post("/web/omega/query", {
    query,
    mode,
    userId: "web-demo-user",
  });
  return data; // { success, mode, message }
}

// ---------- ⚙️ UTILIDADES UI ----------
export function normalizeMarketData(manifest: any) {
  return normalizeMarketDataFromManifest(manifest);
}

// ---------- 📈 HISTÓRICO DE MERCADO (para Dashboard) ----------
export async function fetchMarketHistory(symbol: "BTCUSD" | "XAUUSD") {
  try {
    if (symbol === "BTCUSD") {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7"
      );
      const data = await res.json();
      return data.prices.map(([timestamp, price]: [number, number]) => ({
        time: new Date(timestamp).toLocaleDateString("es-CO", {
          weekday: "short",
        }),
        price,
      }));
    }

    if (symbol === "XAUUSD") {
      const base = 2380;
      return Array.from({ length: 7 }).map((_, i) => ({
        time: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i],
        price: base + Math.sin(i) * 10 + Math.random() * 5,
      }));
    }

    throw new Error("Símbolo no soportado");
  } catch (err) {
    console.warn("⚠️ Error obteniendo datos de mercado, modo simulado:", err);
    return Array.from({ length: 7 }).map((_, i) => ({
      time: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i],
      price: symbol === "BTCUSD" ? 68000 + Math.random() * 800 : 2380 + Math.random() * 5,
    }));
  }
}

// ---------- 🧠 REFLEXIVE MARKET v10.3-B ----------
export async function fetchReflectiveMarket() {
  try {
    const { data } = await api.get("/ai/reflective/market");
    return data; // { ok, version, data, correlations, insights }
  } catch (err: any) {
    console.warn("⚠️ No se pudo conectar al backend reflexivo, usando modo simulado:", err.message);
    return {
      ok: true,
      version: "v10.3-B (Simulado)",
      data: {
        BTCUSD: 68000,
        ETHUSD: 3600,
        XAUUSD: 2380,
        SP500: 5230,
        USDCOP: 4200,
        timestamp: new Date().toISOString(),
      },
      correlations: {
        "BTC-Oro": 0.67,
        "BTC-S&P500": 0.41,
        "Oro-S&P500": -0.12,
        "BTC-ETH": 0.83,
      },
      insights: [
        "⚠️ Datos simulados: API real no disponible.",
        "IA reflexiva activa en modo seguro para visualización.",
      ],
    };
  }
}
