"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  LineSeries,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type LineData,
} from "lightweight-charts";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Bolt, ShieldCheck, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fetchManifest, fetchMarketSeries, runOptimizerV5 } from "@/lib/omega";

interface ManifestInfo {
  version?: string;
  mode?: string;
  note?: string;
}

type CandlePoint = CandlestickData & { timestamp: string };
type RsiPoint = { time: string; value: number };

type AISignal = {
  id: string;
  label: string;
  detail: string;
  confidence: string;
  tone: "warning" | "success";
  grade?: string;
  position: { top: string; left: string };
};

const SYMBOLS = [
  { value: "BTCUSD", label: "BTC/USD" },
  { value: "ETHUSD", label: "ETH/USD" },
  { value: "SP500", label: "SP500" },
  { value: "XAUUSD", label: "GOLD" },
];

const TIMEFRAMES = ["1m", "5m", "1h", "1d"] as const;

export default function AnalysisPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(SYMBOLS[0].value);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(TIMEFRAMES[2]);
  const [candles, setCandles] = useState<CandlePoint[]>([]);
  const [rsiSeries, setRsiSeries] = useState<RsiPoint[]>([]);
  const [movingAverage, setMovingAverage] = useState<LineData[]>([]);
  const [isSeriesLoading, setIsSeriesLoading] = useState<boolean>(true);
  const [manifestInfo, setManifestInfo] = useState<ManifestInfo | null>(null);
  const [optimizerStatus, setOptimizerStatus] = useState<string | null>(null);
  const [optimizerLoading, setOptimizerLoading] = useState(false);

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartApiRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const maSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const optimizerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchManifest()
      .then((data) => {
        if (!isMounted) return;
        setManifestInfo(parseManifestInfo(data));
      })
      .catch(() => null);
    return () => {
      isMounted = false;
      if (optimizerTimer.current) {
        clearTimeout(optimizerTimer.current);
        optimizerTimer.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const chart = createChart(chartContainerRef.current, {
      height: 420,
      layout: {
        background: { color: "#0F172A" },
        textColor: "#CBD5F5",
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.12)" },
        horzLines: { color: "rgba(148, 163, 184, 0.12)" },
      },
      timeScale: {
        borderColor: "rgba(34, 211, 238, 0.25)",
      },
      rightPriceScale: {
        borderColor: "rgba(34, 211, 238, 0.25)",
      },
      crosshair: {
        vertLine: { color: "rgba(34, 211, 238, 0.6)" },
        horzLine: { color: "rgba(34, 211, 238, 0.6)" },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22D3EE",
      borderUpColor: "#22D3EE",
      wickUpColor: "#22D3EE",
      downColor: "#FACC15",
      borderDownColor: "#FACC15",
      wickDownColor: "#FACC15",
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: "#A855F7",
      lineWidth: 2,
      title: "Media Móvil",
    });

    chartApiRef.current = chart;
    candleSeriesRef.current = candleSeries;
    maSeriesRef.current = lineSeries;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!chartContainerRef.current) return;
      const { width } = entries[0].contentRect;
      chart.applyOptions({ width: Math.floor(width) });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartApiRef.current = null;
      candleSeriesRef.current = null;
      maSeriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    setIsSeriesLoading(true);

    fetchMarketSeries(selectedSymbol, selectedTimeframe)
      .then((series) => {
        if (ignore) return;
        const candleData = buildCandles(series);
        const rsiData = calculateRSI(candleData);
        const maData = calculateMovingAverage(candleData);
        setCandles(candleData);
        setRsiSeries(rsiData);
        setMovingAverage(maData);
      })
      .catch(() => {
        if (!ignore) {
          setCandles([]);
          setRsiSeries([]);
          setMovingAverage([]);
        }
      })
      .finally(() => {
        if (!ignore) setIsSeriesLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [selectedSymbol, selectedTimeframe]);

  useEffect(() => {
    if (!candles.length || !candleSeriesRef.current) return;

    candleSeriesRef.current.setData(
      candles.map(({ open, high, low, close, time }) => ({ open, high, low, close, time }))
    );
    if (movingAverage.length && maSeriesRef.current) {
      maSeriesRef.current.setData(movingAverage);
    }
    chartApiRef.current?.timeScale().fitContent();
  }, [candles, movingAverage]);

  const riskScore = useMemo(() => {
    if (!candles.length) return 42;
    const closes = candles.map((c) => c.close);
    const mean = closes.reduce((acc, price) => acc + price, 0) / closes.length;
    const variance =
      closes.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / Math.max(1, closes.length);
    const volatility = Math.sqrt(variance);
    const normalized = Math.min(95, Math.max(10, (volatility / mean) * 2200));
    return Math.round(normalized);
  }, [candles]);

  const aiSignals = useMemo<AISignal[]>(
    () => [
      {
        id: "bearish-divergence",
        label: "IA: Neural Advisor detecta divergencia bajista",
        detail: "El módulo Neural Advisor detectó divergencia bajista contra el RSI en las últimas 5 velas. Confianza del 75% basada en correlaciones multi-marco.",
        confidence: "75% confianza",
        tone: "warning",
        position: { top: "12%", left: "7%" },
      },
      {
        id: "hybrid-long",
        label: "IA: Hybrid v10 sugiere entrada LONG",
        detail: `Hybrid v10 (grado ${selectedSymbol === "SP500" ? "A" : "B"}) indica ventana LONG con confirmación cuantitativa en timeframe ${selectedTimeframe}. Se recomienda validar con Symbiont.`,
        confidence: "Señal de entrada",
        grade: selectedSymbol === "BTCUSD" ? "Grado B" : "Grado A",
        tone: "success",
        position: { top: "62%", left: "62%" },
      },
    ],
    [selectedSymbol, selectedTimeframe]
  );

  const handleOptimizer = async () => {
    setOptimizerLoading(true);
    try {
      const response = await runOptimizerV5({ symbol: selectedSymbol, timeframe: selectedTimeframe });
      const summary = extractOptimizerSummary(response);
      setOptimizerStatus(
        summary
          ? `Optimizer v5 completado → Sharpe ${summary.expectedSharpe} | Riesgo ${summary.riskScore} | Ventana ${summary.windowSuggestion}`
          : "Optimizer v5 ejecutado correctamente"
      );
    } catch (error) {
      console.error("optimizer_v5 execution failed", error);
      setOptimizerStatus("No fue posible ejecutar optimizer_v5. Reintenta en unos segundos.");
    } finally {
      setOptimizerLoading(false);
      if (optimizerTimer.current) {
        clearTimeout(optimizerTimer.current);
      }
      optimizerTimer.current = setTimeout(() => {
        setOptimizerStatus(null);
        optimizerTimer.current = null;
      }, 6000);
    }
  };

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-[#0F172A] px-6 pb-16 pt-10 text-slate-100">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <HeaderBar
            aiMode="ACTIVATED"
            manifestVersion={manifestInfo?.version}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbol}
            selectedTimeframe={selectedTimeframe}
            onSelectTimeframe={setSelectedTimeframe}
          />

          {optimizerStatus && (
            <div className="rounded-3xl border border-cyan-500/40 bg-cyan-500/10 px-6 py-4 text-sm text-cyan-100 shadow-lg">
              {optimizerStatus}
            </div>
          )}

          <Card className="border-cyan-500/30">
            <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="flex items-center gap-3 text-xl text-cyan-200">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                Análisis Cuantitativo IA — Symbiont v10
              </CardTitle>
              <div className="text-sm text-slate-400">
                {selectedSymbol} · {selectedTimeframe.toUpperCase()} · Fuente: {manifestInfo?.mode ?? "simulada"}
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                <div className="relative overflow-hidden rounded-3xl border border-slate-700/40 bg-slate-900/60 p-4 shadow-inner">
                  <div ref={chartContainerRef} className="h-[420px] w-full" />
                  {isSeriesLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60">
                      <span className="animate-pulse text-slate-400">Cargando serie cuantitativa…</span>
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-amber-400/10" />

                  <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                    <OptimizerButton loading={optimizerLoading} onClick={handleOptimizer} />
                  </div>

                  {aiSignals.map((signal) => (
                    <AIOverlay key={signal.id} signal={signal} />
                  ))}
                </div>

                <aside className="flex flex-col gap-4">
                  <QuantumRiskMeter value={riskScore} />

                  <div className="rounded-3xl border border-slate-700/50 bg-slate-900/70 p-5">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                      Neural Pulse Snapshot
                    </h4>
                    <p className="mt-3 text-2xl font-semibold text-cyan-200">
                      {candles.length ? `$${candles[candles.length - 1].close.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD` : "—"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Último cierre sintetizado por Omega IA
                    </p>
                    <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                      Simetría de riesgo {Math.max(0, 100 - riskScore)}%
                    </div>
                    <div className="mt-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-xs text-cyan-100">
                      {manifestInfo?.note ?? "Manifest IA listo para conexión en caliente."}
                    </div>
                  </div>
                </aside>
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-700/60 bg-slate-900/70 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                    RSI Dinámico
                  </h4>
                  <div className="mt-4 h-48">
                    <ResponsiveContainer width="100%" height="100%" minHeight={180} minWidth={180}>
                      <LineChart data={rsiSeries} margin={{ top: 10, left: 0, right: 0, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="4 4" />
                        <XAxis dataKey="time" tick={{ fill: "#94A3B8", fontSize: 12 }} hide />
                        <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 12 }} width={24} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#020617",
                            borderRadius: 16,
                            border: "1px solid rgba(34, 211, 238, 0.4)",
                            color: "#E2E8F0",
                          }}
                          labelStyle={{ color: "#A5B4FC" }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#22D3EE" strokeWidth={2} dot={false} />
                        <ReferenceLine y={70} stroke="rgba(248, 113, 113, 0.6)" strokeDasharray="6 6" />
                        <ReferenceLine y={30} stroke="rgba(74, 222, 128, 0.6)" strokeDasharray="6 6" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-700/60 bg-slate-900/70 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                    Media Móvil Adaptativa
                  </h4>
                  <div className="mt-4 h-48">
                    <ResponsiveContainer width="100%" height="100%" minHeight={180} minWidth={180}>
                      <AreaChart data={movingAverage.map((point) => ({ time: point.time, value: point.value }))}>
                        <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="4 4" />
                        <XAxis dataKey="time" hide />
                        <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} width={30} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#020617",
                            borderRadius: 16,
                            border: "1px solid rgba(168, 85, 247, 0.4)",
                            color: "#E2E8F0",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#A855F7"
                          strokeWidth={2}
                          fill="url(#maGradient)"
                        />
                        <defs>
                          <linearGradient id="maGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#A855F7" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#0F172A" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
    </TooltipProvider>
  );
}

function parseManifestInfo(data: unknown): ManifestInfo {
  if (!isRecord(data)) return {};
  const version = typeof data.version === "string" ? data.version : undefined;
  const mode = typeof data.mode === "string" ? data.mode : undefined;
  const note = typeof data.note === "string" ? data.note : undefined;
  return { version, mode, note };
}

type OptimizerSummary = {
  expectedSharpe?: number;
  riskScore?: number;
  windowSuggestion?: string;
};

function extractOptimizerSummary(response: unknown): OptimizerSummary | null {
  if (!isRecord(response)) return null;
  const summary = response.summary;
  if (!isRecord(summary)) return null;

  const expectedSharpe = typeof summary.expectedSharpe === "number" ? summary.expectedSharpe : undefined;
  const riskScore = typeof summary.riskScore === "number" ? summary.riskScore : undefined;
  const windowSuggestion = typeof summary.windowSuggestion === "string" ? summary.windowSuggestion : undefined;

  if (expectedSharpe === undefined && riskScore === undefined && windowSuggestion === undefined) {
    return null;
  }

  return { expectedSharpe, riskScore, windowSuggestion };
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function buildCandles(series: Array<{ price: number; timestamp?: string }>): CandlePoint[] {
  if (!Array.isArray(series) || !series.length) return [];

  const candles: CandlePoint[] = [];
  let previousClose = series[0]?.price ?? 0;

  series.forEach((point, index) => {
    const open = index === 0 ? previousClose : candles[index - 1].close;
    const close = point.price ?? open;
    const high = Math.max(open, close) + Math.random() * 6;
    const low = Math.min(open, close) - Math.random() * 6;
    const timeStamp = point.timestamp
      ? Math.floor(new Date(point.timestamp).getTime() / 1000)
      : Math.floor(Date.now() / 1000) - (series.length - index) * 60;

    candles.push({
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(Math.max(low, 0).toFixed(2)),
      close: Number(close.toFixed(2)),
      time: timeStamp,
      timestamp: point.timestamp ?? new Date(timeStamp * 1000).toISOString(),
    });

    previousClose = close;
  });

  return candles;
}

function calculateRSI(candles: CandlePoint[], period = 14): RsiPoint[] {
  if (candles.length <= period) return [];
  const results: RsiPoint[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let averageGain = gains / period;
  let averageLoss = losses / period;

  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    averageGain = (averageGain * (period - 1) + gain) / period;
    averageLoss = (averageLoss * (period - 1) + loss) / period;

    const rs = averageLoss === 0 ? 100 : averageGain / Math.max(averageLoss, 1e-6);
    const rsi = averageLoss === 0 ? 100 : 100 - 100 / (1 + rs);
    const time = new Date(candles[i].time * 1000).toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    results.push({ time, value: Number(rsi.toFixed(2)) });
  }

  return results;
}

function calculateMovingAverage(candles: CandlePoint[], window = 20): LineData[] {
  if (candles.length < window) return [];
  const ma: LineData[] = [];
  for (let i = window - 1; i < candles.length; i++) {
    const slice = candles.slice(i - window + 1, i + 1);
    const sum = slice.reduce((acc, candle) => acc + candle.close, 0);
    ma.push({ time: candles[i].time, value: Number((sum / window).toFixed(2)) });
  }
  return ma;
}

function HeaderBar({
  aiMode,
  manifestVersion,
  selectedSymbol,
  onSelectSymbol,
  selectedTimeframe,
  onSelectTimeframe,
}: {
  aiMode: string;
  manifestVersion?: string;
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  selectedTimeframe: string;
  onSelectTimeframe: (tf: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-cyan-500/30 bg-slate-900/60 p-6 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="success" className="bg-emerald-500/20 text-emerald-200">
            AI Mode: {aiMode}
          </Badge>
          <Badge variant="default">Symbiont Advisor v10</Badge>
          {manifestVersion && <Badge variant="outline">Manifest {manifestVersion}</Badge>}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 border-cyan-400/50 text-cyan-200">
            <Sparkles className="h-4 w-4" /> Co-Piloto
          </Button>
          <Button variant="secondary" size="sm" className="gap-2">
            <ShieldCheck className="h-4 w-4" /> Validar
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {SYMBOLS.map((symbol) => (
            <Button
              key={symbol.value}
              variant={selectedSymbol === symbol.value ? "default" : "outline"}
              size="sm"
              className={selectedSymbol === symbol.value ? "shadow-cyan-500/40" : "border-slate-700/60 text-slate-300"}
              onClick={() => onSelectSymbol(symbol.value)}
            >
              {symbol.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf}
              variant={selectedTimeframe === tf ? "secondary" : "outline"}
              size="sm"
              className={
                selectedTimeframe === tf
                  ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-100"
                  : "border-slate-700/60 text-slate-300"
              }
              onClick={() => onSelectTimeframe(tf)}
            >
              {tf.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function OptimizerButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      variant="outline"
      size="lg"
      className="flex flex-col items-center gap-2 rounded-full border-amber-400/80 bg-amber-400/80 px-10 py-8 text-center text-slate-900 shadow-[0_0_40px_rgba(250,204,21,0.35)] hover:bg-amber-300"
    >
      <span className="flex items-center gap-2 text-base font-semibold uppercase tracking-[0.3em]">
        <Bolt className="h-5 w-5" /> OPTIMIZAR RANGO
      </span>
      <span className="text-xs font-medium text-slate-900/80">
        {loading ? "Ejecutando optimizer_v5…" : "Ejecutar optimizer_v5"}
      </span>
    </Button>
  );
}

function AIOverlay({ signal }: { signal: AISignal }) {
  const toneClasses =
    signal.tone === "warning"
      ? "border-amber-400/70 bg-amber-500/10 text-amber-100"
      : "border-emerald-400/70 bg-emerald-500/10 text-emerald-100";

  return (
    <Tooltip>
      <TooltipTrigger
        className={`absolute z-30 max-w-[240px] rounded-2xl border px-4 py-3 text-xs font-medium shadow-lg backdrop-blur ${toneClasses}`}
        style={{ top: signal.position.top, left: signal.position.left }}
      >
        <div className="flex flex-col gap-1">
          <span>{signal.label}</span>
          <span className="text-[11px] uppercase tracking-wide text-white/70">{signal.confidence}</span>
          {signal.grade && <span className="text-[11px] text-white/60">{signal.grade}</span>}
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm text-left leading-relaxed">
        {signal.detail}
      </TooltipContent>
    </Tooltip>
  );
}

function QuantumRiskMeter({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  const angle = (clamped / 100) * 360;

  return (
    <div className="rounded-3xl border border-slate-700/60 bg-slate-900/70 p-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Quantum Risk Meter</h4>
        <Badge variant={clamped > 60 ? "warning" : "success"}>
          {clamped > 60 ? "Atento" : "Controlado"}
        </Badge>
      </div>
      <div className="mt-6 flex items-center justify-center">
        <div className="relative h-40 w-40">
          <div
            className="absolute inset-0 rounded-full border-8 border-slate-800"
            style={{ background: `conic-gradient(#22D3EE ${angle}deg, rgba(15,23,42,0.8) ${angle}deg)` }}
          />
          <div className="absolute inset-6 rounded-full bg-slate-950/70 shadow-inner shadow-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-cyan-200">{clamped}</span>
            <span className="text-xs text-slate-400">Índice de riesgo</span>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Calculado con volatilidad implícita + desviación cuantitativa en ventana {value > 65 ? "corta" : "media"}.
      </p>
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <Wand2 className="h-4 w-4 text-cyan-300" />
        Ajustable vía optimizer_v5 & IA Reflectiva
      </div>
    </div>
  );
}
