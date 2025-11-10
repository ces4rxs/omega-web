// ======================================================
// 🧠 OMEGA AI Unified Server v4.3.2 (Render Production Build)
// ======================================================
// Combina: Core AI + StrategyLabs + Diagnostics + Reflex Intelligence
// Autor: Julio César — Versión Final Render
// ======================================================

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import warehouse from "./warehouse/client.js"; // ✅ Usa el singleton de Prisma
import { authenticate, AuthRequest } from "./middleware/auth.js";
import { requireTier, injectSubscriptionInfo } from "./middleware/subscription.js";

// ======================================================
// 🌐 Configuración inicial
// ======================================================
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ======================================================
// 💾 Prisma Client - Conexión OBLIGATORIA (FAIL-FAST)
// ======================================================
// ✅ Singleton centralizado desde warehouse/client.js
// ⚠️ Si Prisma falla, el servidor NO arranca (comportamiento correcto)

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectPrismaWithRetry(retries = 3) {
  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`🔌 Conectando Prisma (intento ${i}/${retries})...`);
      await warehouse.$connect();
      console.log("🟢 Prisma conectado correctamente");
      return true;
    } catch (err) {
      console.error(`❌ Error de conexión Prisma (intento ${i}):`, (err as Error).message);
      if (i === retries) {
        console.error("⛔ CRÍTICO: No se pudo conectar a la base de datos");
        console.error("⛔ Verifica DATABASE_URL en variables de entorno");
        console.error("⛔ El servidor NO puede iniciar sin base de datos");
        // ✅ FAIL-FAST: Permitir que el error se propague
        // Render/K8s reiniciará el contenedor automáticamente
        throw new Error("Database connection failed - cannot start server");
      }
      console.log("⏳ Reintentando en 2 segundos...");
      await delay(2000); // Reducido de 5s a 2s
    }
  }
  return false;
}

// ✅ FAIL-FAST: Si la DB no conecta, el proceso falla
// NO hay try-catch aquí - el error debe propagarse y detener el arranque
await connectPrismaWithRetry();

// ======================================================
// 🌍 CORS adaptado a Render y Omega Web (Configurable por ENV)
// ======================================================
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [
      "http://localhost:3000",
      "http://192.168.1.90:3000",
      "https://omega-web1.onrender.com",
      "https://backtester-pro-1.onrender.com",
    ];

console.log("🌍 CORS configurado para:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (Postman, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // ✅ VERIFICAR ORIGEN EXACTO (no startsWith)
      // Previene bypass con dominios como "omega-web1.onrender.com.evil.com"
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ CORS bloqueado para:", origin);
        callback(new Error("No permitido por CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
    credentials: true,
  })
);

// ======================================================
// 🔒 HTTPS forzado en producción
// ======================================================
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
});

// ======================================================
// 💳 Stripe Integration
// ======================================================
import stripeCheckoutRouter from "./routes/stripe_checkout.js";
import stripeWebhookRouter from "./routes/stripe_webhook.js";

// ⚠️ Webhook debe ir ANTES de bodyParser (necesita body RAW)
app.use("/stripe/webhook", stripeWebhookRouter);

app.use(bodyParser.json());

// Rutas de Stripe checkout
app.use("/stripe", stripeCheckoutRouter);
app.set("trust proxy", 1);

// ======================================================
// 🛡️ Rate Limiting (protección contra brute force y abuso)
// ======================================================

// Rate limiter estricto para autenticación (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 intentos por IP
  message: { ok: false, error: "Demasiados intentos de login. Intenta de nuevo en 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para endpoints AI (previene abuso de recursos)
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 30, // máximo 30 requests por IP
  message: { ok: false, error: "Demasiadas peticiones. Intenta de nuevo en unos minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter general para el resto de la API
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // máximo 100 requests por IP por minuto
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiter general a toda la app
app.use(generalLimiter);

// ======================================================
// 🔐 Autenticación y Estrategias
// ======================================================
import authRouter from "./routes/server_auth.js";
app.use("/auth", authLimiter, authRouter); // ✅ Protección extra en auth

import strategiesRouter from "./routes/server_strategies.js";
app.use("/api/strategies", strategiesRouter);

// ======================================================
// 🎯 Backtest Engine (Polygon.io Integration)
// ======================================================
import backtestRouter from "./routes/backtest.route.js";
app.use("/api/backtest", backtestRouter);

// ======================================================
// 📊 Advanced Analysis (Professional Plan)
// ======================================================
import analysisRouter from "./routes/analysis.route.js";
app.use("/api/analysis", analysisRouter);

// ======================================================
// 📄 Export (PDF Reports)
// ======================================================
import exportRouter from "./routes/export.route.js";
app.use("/api/export", exportRouter);

// ======================================================
// 🔔 Alerts (Email/Webhook Notifications)
// ======================================================
import alertsRouter from "./routes/alerts.route.js";
app.use("/api/alerts", alertsRouter);

// ======================================================
// 🧠 AI/ML (Machine Learning Endpoints)
// ======================================================
import aiRouter from "./routes/ai.route.js";
app.use("/api/ai", aiRouter);

// ======================================================
// 🧠 Módulos AI Importados
// ======================================================
import {
  generateUnifiedAdviceHybridV10,
} from "./ai/hybridAdvisor.js";
import { generateNeuralAdvisorV11 } from "./ai/neuralAdvisor_v11.js";
import { generateStrategicAdvisorV12 } from "./ai/strategicAdvisor_v12.js";
import { generateQuantumRiskV13 } from "./ai/quantumRisk_v13.js";
import { generateCognitiveRiskV14 } from "./ai/cognitiveRisk_v14.js";
import { predictForCurrent } from "./ai/predictor_v4.js";
import { runAdaptiveOptimizer } from "./core_v5/optimizer_v5.js";
import { saveBrainprint } from "./ai/userBrainprint.js";
import { startMarketAutoUpdater } from "./data/marketAutoUpdater.js";
import { appendSample, loadMemory } from "./learn/memoryStore.js";
import { generateAdvice } from "./learn/learner.js";

// ======================================================
// 🩺 Health & Diagnóstico
// ======================================================
import healthRouter from "./routes/health.route.js";
app.use("/health", healthRouter);

app.get("/", (_req, res) => {
  res.send(`
    <h2>🧠 OMEGA Unified Server v4.3.2</h2>
    <p>Servidor activo y funcionando correctamente 🚀</p>
    <ul>
      <li><a href="/health">/health</a> - Health check completo</li>
      <li><a href="/health/ready">/health/ready</a> - Readiness probe</li>
      <li><a href="/health/live">/health/live</a> - Liveness probe</li>
      <li><a href="/ai/status">/ai/status</a></li>
      <li><a href="/ai/manifest">/ai/manifest</a></li>
      <li><a href="/ai/ping">/ai/ping</a></li>
      <li><a href="/api/ai/status">/api/ai/status</a> - ML System Status (NEW)</li>
    </ul>
    <h3>🧠 ML Endpoints (Authenticated)</h3>
    <ul>
      <li>POST /api/ai/analyze - OMEGA Reflex Analysis</li>
      <li>POST /api/ai/insights - Explainable AI Insights</li>
      <li>POST /api/ai/quantum-risk - Risk Classification (K-Means)</li>
      <li>POST /api/ai/predict - ML Predictions (Enterprise)</li>
      <li>POST /api/ai/anomaly-check - Anomaly Detection</li>
      <li>POST /api/ai/optimize - Parameter Optimization</li>
    </ul>
  `);
});

app.get("/ai/status", (_req, res) =>
  res.json({
    ok: true,
    version: "Omega AI Unified Server v4.3.2",
    status: "🧠 Núcleo estable y sincronizado (Render Mode)",
    modules: ["v11 Neural Advisor", "v12 MonteCarlo+", "v13 QuantumRisk", "v14 Reflex Intelligence"],
    timestamp: new Date().toISOString(),
  })
);

app.get("/ai/ping", (_req, res) =>
  res.json({
    ok: true,
    message: "🧠 Omega Unified Server activo y respondiendo correctamente.",
    timestamp: new Date().toISOString(),
  })
);

// ======================================================
// 📊 Manifesto / Metadatos
// ======================================================
app.get("/ai/manifest", (_req, res) => {
  // Leer los últimos snapshots de mercado (datos en vivo)
  const liveMarket: Record<string, number | null> = {};

  try {
    ["BTCUSD", "XAUUSD", "XAGUSD", "WTIUSD", "SP500"].forEach(asset => {
      const snapshot = readLatestSnapshot(asset as LiveAsset);
      liveMarket[asset] = snapshot?.price || null;
    });
  } catch (err) {
    console.warn("⚠️ Could not read live market data, using fallback");
  }

  res.json({
    ok: true,
    version: "v10.3-B",
    server: "OMEGA Unified Server v4.3.2",
    mode: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    marketData: liveMarket,
    marketDataSource: "live-snapshots",
    endpoints: {
      status: "/ai/status",
      reflex: "/ai/reflex",
      memory: "/ai/learn/memory",
      predict: "/ai/predict/advanced",
      symbiont: "/ai/symbiont",
      brainprint: "/ai/brainprint",
      montecarlo: "/ai/reflective/market",
    },
  });
});

// ======================================================
// 🧠 Aprendizaje y Tutoría Cognitiva
// ======================================================
app.get("/ai/learn/memory", (_req, res) => res.json(loadMemory()));

app.post("/ai/learn/update", (req, res) => {
  const sample = { ...req.body, timestamp: new Date().toISOString() };
  const mem = appendSample(sample);
  res.json({ ok: true, stats: mem.stats });
});

app.get("/ai/learn/advice/:id", (req, res) => {
  const id = req.params.id;
  const risk: "BAJO" | "MEDIO" | "ALTO" = "MEDIO";

  const current = {
    strategyId: id,
    quantumRating: 7.4,
    overfitRisk: risk,
    robustnessProb: 83.2,
    timestamp: new Date().toISOString(),
  };

  const mem = loadMemory();
  const advice = generateAdvice(current, mem);
  res.json({ ok: true, id, advice });
});

// ======================================================
// ⚙️ Predicción / Optimización / IA Avanzada (con rate limiting)
// ======================================================
app.get("/ai/predict/advanced", authenticate, requireTier("professional"), aiLimiter, (_req, res) => {
  try {
    const pred = predictForCurrent();
    res.json({ ok: true, ...pred });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// ======================================================
// 🧮 Monte Carlo Adaptativo v4.5 — Integración con Predictor v4.5
// ======================================================
import { runMonteCarlo } from "./ai/montecarlo.js";

app.get("/ai/montecarlo", authenticate, injectSubscriptionInfo, aiLimiter, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const limits = authReq.subscriptionLimits;

    // Verificar que tenga acceso (Starter o Professional)
    if (!limits || limits.montecarlo_sims === 0) {
      return res.status(403).json({
        ok: false,
        error: "Esta funcionalidad requiere una suscripción activa.",
        requiredPlan: "starter",
      });
    }

    // Usar el límite de simulaciones según su plan
    const maxSims = limits.montecarlo_sims;

    // Permitir al usuario especificar número de simulaciones (hasta su límite del plan)
    const requestedSims = parseInt(req.query.simulations as string) || 300;
    const actualSims = Math.min(requestedSims, maxSims); // Limitar al máximo del plan

    const result = runMonteCarlo(actualSims);
    res.json({
      ...result,
      simulationsUsed: actualSims,
      simulationsRequested: requestedSims,
      maxSimulations: maxSims,
      plan: authReq.subscriptionTier,
    });
  } catch (err) {
    console.error("❌ Error en /ai/montecarlo:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});




app.post("/ai/optimize", authenticate, requireTier("professional"), aiLimiter, async (req, res) => {
  try {
    const { manifest, goal, population } = req.body;

    // Validar datos requeridos
    if (!manifest || !goal) {
      return res.status(400).json({
        ok: false,
        error: "Faltan parámetros requeridos: manifest y goal",
      });
    }

    // Crear función de predicción usando predictor_v4
    const prophetPredict = async (_variant: any) => {
      const pred = predictForCurrent();
      return {
        predictedSharpe: pred.predictedSharpe,
        predictedMDD: pred.predictedMDD,
        antiOverfit: pred.predictedSharpe > 1.0 ? 75 : 50, // Estimación simple
      };
    };

    // Llamar al optimizador con parámetros válidos
    const report = await runAdaptiveOptimizer(manifest, goal, {
      prophetPredict,
      population: population || 200,
    });

    res.json({ ok: true, report });
  } catch (err: any) {
    console.error("❌ Error en /ai/optimize:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ======================================================
// 💾 Brainprint / Symbiont
// ======================================================
app.post("/ai/brainprint", (req, res) => {
  const saved = saveBrainprint(req.body);
  res.json({ ok: true, saved });
});

app.post("/ai/symbiont", aiLimiter, async (req, res) => {
  const { strategyId } = req.body;
  const result = await generateUnifiedAdviceHybridV10(strategyId);
  res.json({ ok: true, result });
});

// ======================================================
// 🌐 Live Market desde Snapshots (Auto-Updater)
// ======================================================
type LiveAsset = "BTCUSD" | "XAUUSD" | "XAGUSD" | "WTIUSD" | "SP500";
// Usa __dirname para que funcione tanto en desarrollo (src/) como en producción (dist/)
const MARKET_DIR = path.join(__dirname, "data", "market");

function pickLatestFilePrefix(prefix: string) {
  if (!fs.existsSync(MARKET_DIR)) return null;
  const files = fs.readdirSync(MARKET_DIR).filter(f => f.startsWith(prefix + "_") && f.endsWith(".json"));
  if (files.length === 0) return null;
  files.sort((a, b) => (a < b ? 1 : -1));
  return path.join(MARKET_DIR, files[0]);
}

function readLatestSnapshot(asset: LiveAsset) {
  const file = pickLatestFilePrefix(asset);
  if (!file) return null;
  try {
    const raw = fs.readFileSync(file, "utf8");
    const j = JSON.parse(raw);
    return {
      asset,
      price: j.price ?? null,
      source: j.source ?? "unknown",
      timestamp: j.timestamp ?? null,
      latency_ms: j.latency_ms ?? null,
      age_ms: j.timestamp ? Date.now() - new Date(j.timestamp).getTime() : null,
      file,
    };
  } catch {
    return null;
  }
}

app.get("/ai/markets/live", (req, res) => {
  const q = String(req.query.assets || "").trim();
  const wanted = (q ? q.split(",") : ["BTCUSD", "XAUUSD", "XAGUSD", "WTIUSD", "SP500"])
    .map(s => s.trim().toUpperCase())
    .filter(Boolean) as LiveAsset[];

  const items = wanted.map(a => readLatestSnapshot(a)).filter(Boolean);

  res.json({
    ok: true,
    at: new Date().toISOString(),
    assets: items,
    note: "Fuente: snapshots locales creados por OMEGA MarketAutoUpdater (cada 5 min).",
    dir: MARKET_DIR,
  });
});

// ======================================================
// 🌎 Live Market External (fuentes públicas directas)
// ======================================================

// Cache temporal en memoria (1 minuto)
let _externalCache: any = null;
let _externalCacheTs = 0;
const EXTERNAL_TTL_MS = 60_000;

// ======================================================
// 🌐 Helper profesional universal (compatible con Render)
// ======================================================
async function safeJson(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000); // 10 s

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "User-Agent": "OMEGA-AI/1.0 (Render Production Server)",
        "Accept": "application/json",
        "Connection": "keep-alive",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`);

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error(`🌐 Error en safeJson(${url}):`, err.message);
    throw new Error("Fuentes externas no disponibles o red bloqueada en Render.");
  }
}

// ======================================================
// 🌍 Función principal: obtiene precios reales (Prueba solo CoinGecko)
// ======================================================
async function fetchExternalMarketSnapshot() {
  console.log("Iniciando fetchExternalMarketSnapshot (Prueba: Solo CoinGecko)...");

  // Usamos Promise.allSettled para que si una falla, la otra no
  const [btcResult, ethResult] = await Promise.allSettled([
    safeJson("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"),
    safeJson("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
    // La API de Metals.live está deshabilitada a propósito para esta prueba
  ]);

  const btcPrice = btcResult.status === 'fulfilled' ? btcResult.value?.bitcoin?.usd : null;
  const ethPrice = ethResult.status === 'fulfilled' ? ethResult.value?.ethereum?.usd : null;

  if (btcResult.status === 'rejected') {
    console.error("❌ Error al llamar a CoinGecko (BTC):", btcResult.reason.message);
  }
  if (ethResult.status === 'rejected') {
    console.error("❌ Error al llamar a CoinGecko (ETH):", ethResult.reason.message);
  }

  // Si ambas fallan, lanzamos el error
  if (!btcPrice && !ethPrice) {
    throw new Error("No se pudo contactar con CoinGecko.");
  }

  return {
    BTCUSD: { price: btcPrice, source: "coingecko" },
    ETHUSD: { price: ethPrice, source: "coingecko" },
    XAUUSD: { price: null, source: "metals.live (deshabilitado)" },
    ts: new Date().toISOString(),
  };
}

// Nuevo endpoint: /ai/market/external-live
app.get("/ai/market/external-live", async (_req, res) => {
  try {
    const now = Date.now();

    // Si hay caché reciente, úsala
    if (_externalCache && now - _externalCacheTs < EXTERNAL_TTL_MS) {
      return res.json({ ok: true, cached: true, data: _externalCache });
    }

    // Si no, actualiza
    const snapshot = await fetchExternalMarketSnapshot();
    _externalCache = snapshot;
    _externalCacheTs = now;

    res.json({ ok: true, cached: false, data: snapshot });
  } catch (err: any) {
    console.error("❌ /ai/market/external-live error:", err?.message || err);
    if (_externalCache) {
      // fallback si hay caché vieja
      return res.json({
        ok: true,
        cached: true,
        stale: true,
        data: _externalCache,
        note: "⚠️ Fuente externa en error, devolviendo caché anterior.",
      });
    }
    res.status(502).json({ ok: false, error: "Fuentes externas no disponibles" });
  }
});

// ======================================================
// 🌍 Relay interno: proxy seguro para APIs externas
// ======================================================
app.get("/relay/market/:source", async (req, res) => {
  const source = req.params.source;

  try {
    let url;
    switch (source) {
      case "coingecko":
        url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd";
        break;
      case "metals":
        url = "https://api.metals.live/v1/spot";
        break;
      default:
        return res.status(400).json({ ok: false, error: "Fuente desconocida" });
    }

    const data = await fetch(url, {
      headers: {
        "User-Agent": "OMEGA-Relay/1.0",
        "Accept": "application/json",
      },
    }).then(r => r.json());

    res.json({ ok: true, data });
  } catch (err: any) {
    console.error("❌ Relay error:", err.message);
    res.status(502).json({ ok: false, error: "Error en relay o fuente remota" });
  }
});



// ======================================================
// 📂 Archivos / Reportes
// ======================================================
const REPORTS_DIR = path.join(process.cwd(), "reports");
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
app.use("/reports", express.static(REPORTS_DIR));

// ======================================================
// 🚀 Inicialización final
// ======================================================
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
app.listen(PORT, () => {
  console.log(`🌍 OMEGA Unified Server corriendo en puerto ${PORT}`);
  console.log("🧩 Todos los módulos v7–v15+ cargados correctamente.");

  // ======================================================
  // 📊 Market Auto-Updater (Configurable)
  // ======================================================
  // Por defecto está HABILITADO. Para deshabilitarlo:
  // export ENABLE_MARKET_UPDATER=false
  const enableMarketUpdater = process.env.ENABLE_MARKET_UPDATER !== 'false';

  if (enableMarketUpdater) {
    console.log("📊 Market Auto-Updater: HABILITADO (actualiza cada 5 min)");
    console.log("   💡 Para deshabilitar: export ENABLE_MARKET_UPDATER=false");
    startMarketAutoUpdater();
  } else {
    console.log("📊 Market Auto-Updater: DESHABILITADO");
    console.log("   ℹ️  Los endpoints /ai/markets/live usarán datos en caché");
  }
});
