import React, { useEffect, useMemo, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Area, AreaChart, ReferenceDot, Legend } from "recharts";
import { motion } from "framer-motion";

// --- Utilidades ---
function formatNumber(n?: number, digits = 2) {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
}

function formatPct(n?: number, digits = 2) {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}

// --- Tipos de Props ---
export type OmegaPoint = {
  time: string | number | Date; // ISO string o timestamp
  price?: number;               // Precio del activo (opcional)
  equity?: number;              // Curva de equity de la estrategia
  benchmark?: number;           // Benchmark (BTC/SPX)
};

export type MonteCarloBand = {
  time: string | number | Date;
  p05: number; // percentil 5%
  p95: number; // percentil 95%
};

export type AISignal = {
  time: string | number | Date;
  type: "buy" | "sell" | "hold";
  note?: string; // mini explicación cognitiva
};

export type OmegaKpis = {
  sharpe?: number;
  mdd?: number; // drawdown máximo (0..1)
  cagr?: number; // 0..1
  antiOverfit?: number; // 0..1
};

export type FetchEndpoints = {
  manifestUrl?: string;     // GET -> métricas/estado (opcional)
  montecarloUrl?: string;   // POST -> devuelve bandas (opcional)
  reportUrl?: string;       // POST -> reporte json (opcional)
};

export type OmegaProChartProps = {
  /** Datos listos. Si no se pasan, se intentará obtener desde endpoints (si se proveen). */
  data?: OmegaPoint[];
  bands?: MonteCarloBand[];
  aiSignals?: AISignal[];
  kpis?: OmegaKpis;
  /** Etiquetas y opciones UI */
  title?: string;
  subtitle?: string;
  dark?: boolean; // tema oscuro por defecto
  /** Endpoints opcionales (no rompen tu backend si no existen) */
  endpoints?: FetchEndpoints;
  /** Identificadores visuales */
  tagVersion?: string; // ej: "v10.3-B"
  environment?: "demo" | "live";
};

// --- Tooltip personalizado con capa cognitiva ---
const CognitiveTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  const pluck = (k: string) => payload.find((p: any) => p.dataKey === k)?.value;
  const equity = pluck("equity");
  const bench = pluck("benchmark");
  const price = pluck("price");

  return (
    <div className="rounded-2xl shadow-xl p-3 md:p-4 bg-black/80 text-white backdrop-blur-md border border-white/10 min-w-[220px]">
      <div className="text-xs opacity-80">{new Date(label).toLocaleString()}</div>
      <div className="mt-1 text-sm">Equity: <span className="font-semibold">{formatNumber(equity)}</span></div>
      {bench !== undefined && <div className="text-sm">Benchmark: <span className="font-semibold">{formatNumber(bench)}</span></div>}
      {price !== undefined && <div className="text-sm">Precio: <span className="font-semibold">{formatNumber(price)}</span></div>}
      <div className="mt-2 text-xs text-emerald-300/90">
        💬 Tutor: Variación local estable; evaluar riesgo si se acerca al límite de drawdown.
      </div>
    </div>
  );
};

// --- Botón Exportar a PDF (opcional, requiere jsPDF + html2canvas en el proyecto) ---
async function exportNodeToPDF(node: HTMLElement, filename = "omega-report.pdf") {
  // Carga dinámica para no romper SSR
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");
  const canvas = await html2canvas(node, { backgroundColor: null, scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 60; // márgenes
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.addImage(imgData, "PNG", 30, 40, imgWidth, Math.min(imgHeight, pageHeight - 80));
  pdf.setFontSize(10);
  pdf.text(`OMEGA • ${new Date().toLocaleString()} • ${filename}`, 30, pageHeight - 20);
  pdf.save(filename);
}

// --- Componente principal ---
export default function OmegaProChart({
  data: propData,
  bands: propBands,
  aiSignals = [],
  kpis,
  title = "OMEGA Pro Chart",
  subtitle = "Visualización cognitiva con IA",
  dark = true,
  endpoints,
  tagVersion = "v10.3-B",
  environment = "demo",
}: OmegaProChartProps) {
  const [data, setData] = useState<OmegaPoint[] | undefined>(propData);
  const [bands, setBands] = useState<MonteCarloBand[] | undefined>(propBands);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fallback de datos demo (no rompe nada si aún no conectas endpoints)
  useEffect(() => {
    if (propData) return;
    // demo corta (equity sintético)
    const now = Date.now();
    const demo: OmegaPoint[] = Array.from({ length: 120 }).map((_, i) => ({
      time: new Date(now - (120 - i) * 86400000).toISOString(),
      equity: 100000 + i * 250 + Math.sin(i / 6) * 1200,
      benchmark: 100000 + i * 180 + Math.cos(i / 7) * 900,
      price: 30000 + i * 20 + Math.sin(i / 12) * 600,
    }));
    setData(demo);
  }, [propData]);

  useEffect(() => {
    if (propBands) return;
    if (!data) return;
    const synthetic: MonteCarloBand[] = data.map((d, i) => {
      const base = (d.equity ?? 100000);
      const spread = 1500 + Math.abs(Math.sin(i / 10)) * 2200;
      return { time: d.time, p05: base - spread, p95: base + spread };
    });
    setBands(synthetic);
  }, [propBands, data]);

  // Intento de carga desde endpoints (si existen) — seguro y opcional
  useEffect(() => {
    const load = async () => {
      if (!endpoints || loading) return;
      try {
        setLoading(true);
        // Ejemplos: puedes adaptar a tu contrato real
        if (endpoints.manifestUrl) {
          const r = await fetch(endpoints.manifestUrl).then((x) => x.json());
          if (!propData && r?.data?.bars) {
            const mapped: OmegaPoint[] = r.data.bars.map((b: any) => ({
              time: b.time ?? b.t,
              equity: r.metrics?.equityCurve ? r.metrics.equityCurve[b.index] : undefined,
              benchmark: r.metrics?.benchmarkCurve ? r.metrics.benchmarkCurve[b.index] : undefined,
              price: b.close ?? b.c,
            }));
            setData(mapped);
          }
        }
        if (endpoints.montecarloUrl) {
          const r2 = await fetch(endpoints.montecarloUrl, { method: "POST" }).then((x) => x.json());
          if (!propBands && r2?.bands) {
            const mappedBands: MonteCarloBand[] = r2.bands.map((b: any) => ({ time: b.time, p05: b.p05, p95: b.p95 }));
            setBands(mappedBands);
          }
        }
      } catch (e) {
        console.warn("[OmegaProChart] endpoints offline (fallback demo)", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [endpoints, propData, propBands, loading]);

  // Merge de datos para Recharts
  const merged = useMemo(() => {
    if (!data) return [] as any[];
    const bandMap = new Map<string, MonteCarloBand>();
    (bands || []).forEach((b) => bandMap.set(String(new Date(b.time).getTime()), b));
    return data.map((d) => {
      const tkey = String(new Date(d.time).getTime());
      const b = bandMap.get(tkey);
      return { ...d, p05: b?.p05, p95: b?.p95 };
    });
  }, [data, bands]);

  // Señales AI indexadas por timestamp
  const signalMap = useMemo(() => {
    const map = new Map<number, AISignal>();
    aiSignals.forEach((s) => map.set(new Date(s.time).getTime(), s));
    return map;
  }, [aiSignals]);

  // KPIs visibles
  const k = kpis || { sharpe: 1.8, mdd: 0.22, cagr: 0.38, antiOverfit: 0.75 };

  const bg = dark ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" : "bg-white";
  const text = dark ? "text-white" : "text-slate-900";

  return (
    <div className={`${bg} ${text} w-full rounded-3xl p-4 md:p-6 shadow-2xl border border-white/10`} ref={cardRef}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-xl md:text-2xl font-semibold">
            {title}
          </motion.h2>
          <div className="opacity-70 text-sm">{subtitle}</div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30">{environment.toUpperCase()}</span>
          <span className="px-2 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30">{tagVersion}</span>
          <button onClick={() => cardRef.current && exportNodeToPDF(cardRef.current)} className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20">
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <div className="rounded-2xl p-3 bg-white/5 border border-white/10">
          <div className="text-xs opacity-70">Sharpe</div>
          <div className="text-lg font-semibold">{formatNumber(k.sharpe, 2)}</div>
        </div>
        <div className="rounded-2xl p-3 bg-white/5 border border-white/10">
          <div className="text-xs opacity-70">MDD</div>
          <div className="text-lg font-semibold">{formatPct(k.mdd, 1)}</div>
        </div>
        <div className="rounded-2xl p-3 bg-white/5 border border-white/10">
          <div className="text-xs opacity-70">CAGR</div>
          <div className="text-lg font-semibold">{formatPct(k.cagr, 1)}</div>
        </div>
        <div className="rounded-2xl p-3 bg-white/5 border border-white/10">
          <div className="text-xs opacity-70">Anti-Overfit</div>
          <div className="text-lg font-semibold">{formatPct(k.antiOverfit, 0)}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6 h-[380px] md:h-[460px] rounded-2xl overflow-hidden bg-black/20 border border-white/10">
<ResponsiveContainer width="100%" height={400} minWidth={300}>
          <AreaChart data={merged} margin={{ top: 20, right: 24, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="equityGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="benchGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FDE68A" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#FDE68A" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="time" tickFormatter={(t) => new Date(t).toLocaleDateString()} stroke="#A3A3A3" />
            <YAxis stroke="#A3A3A3" tickFormatter={(v) => formatNumber(v)} domain={["auto", "auto"]} />
            <Tooltip content={<CognitiveTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ color: "#E5E7EB" }} />

            {/* Monte Carlo Band (p05..p95) */}
            <Area type="monotone" dataKey="p95" stroke="none" fillOpacity={1} fill="url(#bandFill)" />
            <Area type="monotone" dataKey="p05" stroke="none" fillOpacity={1} fill="url(#bandFill)" />

            {/* Equity (principal) */}
            <Line type="monotone" dataKey="equity" stroke="#60A5FA" strokeWidth={2.6} dot={false} name="Equity" />

            {/* Benchmark (opcional) */}
            <Line type="monotone" dataKey="benchmark" stroke="#FDE68A" strokeWidth={1.8} dot={false} name="Benchmark" />

            {/* Señales AI */}
            {merged.map((d, idx) => {
              const s = signalMap.get(new Date(d.time).getTime());
              if (!s || !d.equity) return null;
              const color = s.type === "buy" ? "#22c55e" : s.type === "sell" ? "#ef4444" : "#93c5fd";
              return (
                <ReferenceDot key={`sig-${idx}`} x={d.time as any} y={d.equity} r={4} fill={color} stroke="#0b1220" strokeWidth={1.5} />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Nota cognitiva inferior */}
      <div className="mt-4 text-xs md:text-sm opacity-80">
        💡 <span className="font-medium">Nota Cognitiva:</span> La banda turquesa representa el rango esperado (p5–p95) de la simulación Monte Carlo. Los puntos verde/rojo señalan decisiones del agente IA (buy/sell).
      </div>

      {/* Estado */}
      {loading && <div className="mt-3 text-xs opacity-70">Cargando datos desde endpoints…</div>}
    </div>
  );
}
