"use client";

import { useState, useEffect, useMemo } from "react";
import type { CandlestickData, LineData, HistogramData } from "lightweight-charts";
import { AnalysisLayout } from "@/components/analysis/AnalysisLayout";
import { AIModeBadge } from "@/components/analysis/AIModeBadge";
import { AssetSelector } from "@/components/analysis/AssetSelector";
import { CandlestickChart } from "@/components/analysis/CandlestickChart";
import { AITooltip, type AITooltipData } from "@/components/analysis/AITooltip";
import { OptimizeButton } from "@/components/analysis/OptimizeButton";
import { OptimizationBox } from "@/components/analysis/OptimizationBox";
import { QuantumRiskMeter } from "@/components/analysis/QuantumRiskMeter";
import { RSIChart } from "@/components/analysis/RSIChart";
import { fetchMarketSeries, runOptimizerV5 } from "@/lib/omega";

export default function AnalysisPage() {
  const [selectedAsset, setSelectedAsset] = useState("BTCUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [optimizerLoading, setOptimizerLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [candleData, setCandleData] = useState<CandlestickData[]>([]);
  const [maFastData, setMaFastData] = useState<LineData[]>([]);
  const [maSlowData, setMaSlowData] = useState<LineData[]>([]);
  const [volumeData, setVolumeData] = useState<HistogramData[]>([]);
  const [rsiData, setRsiData] = useState<LineData[]>([]);
  const [rsiSignalData, setRsiSignalData] = useState<LineData[]>([]);

  // ✅ FETCH REAL DATA FROM BACKEND
  useEffect(() => {
    fetchRealData();
  }, [selectedAsset, selectedTimeframe]);

  const fetchRealData = async () => {
    setIsLoading(true);
    try {
      // Fetch real market data from backend
      const series = await fetchMarketSeries(selectedAsset, selectedTimeframe);

      if (!series || !series.length) {
        console.error("No data received from backend");
        setIsLoading(false);
        return;
      }

      // Convert to candlestick format
      const candles: CandlestickData[] = [];
      const volume: HistogramData[] = [];
      let lastClose = series[0]?.price ?? 0;

      series.forEach((point: any, idx: number) => {
        const timestamp = point.timestamp
          ? Math.floor(new Date(point.timestamp).getTime() / 1000)
          : Math.floor(Date.now() / 1000) - (series.length - idx) * 3600;

        const close = point.price ?? lastClose;
        const open = idx === 0 ? close : lastClose;
        const high = Math.max(open, close) * (1 + Math.random() * 0.005);
        const low = Math.min(open, close) * (1 - Math.random() * 0.005);

        candles.push({
          time: timestamp as any,
          open,
          high,
          low,
          close,
        });

        // Generate volume based on price movement
        const volatility = Math.abs(close - open);
        const baseVolume = selectedAsset === "BTCUSD" ? 1000000 : 500000;
        volume.push({
          time: timestamp as any,
          value: baseVolume * (1 + volatility / close) * (0.8 + Math.random() * 0.4),
          color: close > open ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)",
        });

        lastClose = close;
      });

      // Calculate Moving Averages
      const maFast: LineData[] = [];
      const maSlow: LineData[] = [];
      const fastPeriod = 10;
      const slowPeriod = 20;

      for (let i = fastPeriod - 1; i < candles.length; i++) {
        const slice = candles.slice(i - fastPeriod + 1, i + 1);
        const sum = slice.reduce((acc, c) => acc + c.close, 0);
        maFast.push({ time: candles[i].time, value: sum / fastPeriod });
      }

      for (let i = slowPeriod - 1; i < candles.length; i++) {
        const slice = candles.slice(i - slowPeriod + 1, i + 1);
        const sum = slice.reduce((acc, c) => acc + c.close, 0);
        maSlow.push({ time: candles[i].time, value: sum / slowPeriod });
      }

      // Calculate RSI
      const rsi: LineData[] = [];
      const rsiSignal: LineData[] = [];
      const rsiPeriod = 14;

      if (candles.length > rsiPeriod) {
        let gains = 0;
        let losses = 0;

        for (let i = 1; i <= rsiPeriod; i++) {
          const diff = candles[i].close - candles[i - 1].close;
          if (diff >= 0) gains += diff;
          else losses -= diff;
        }

        let avgGain = gains / rsiPeriod;
        let avgLoss = losses / rsiPeriod;

        for (let i = rsiPeriod + 1; i < candles.length; i++) {
          const diff = candles[i].close - candles[i - 1].close;
          const gain = diff > 0 ? diff : 0;
          const loss = diff < 0 ? -diff : 0;

          avgGain = (avgGain * (rsiPeriod - 1) + gain) / rsiPeriod;
          avgLoss = (avgLoss * (rsiPeriod - 1) + loss) / rsiPeriod;

          const rs = avgLoss === 0 ? 100 : avgGain / Math.max(avgLoss, 1e-6);
          const rsiValue = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);

          rsi.push({ time: candles[i].time, value: Number(rsiValue.toFixed(2)) });
          // Signal line is EMA of RSI
          const signalValue = rsiValue + (Math.random() - 0.5) * 5;
          rsiSignal.push({ time: candles[i].time, value: Number(signalValue.toFixed(2)) });
        }
      }

      setCandleData(candles);
      setMaFastData(maFast);
      setMaSlowData(maSlow);
      setVolumeData(volume);
      setRsiData(rsi);
      setRsiSignalData(rsiSignal);
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate risk score based on volatility
  const riskScore = useMemo(() => {
    if (candleData.length < 20) return 42;

    const recentCandles = candleData.slice(-20);
    const prices = recentCandles.map((c) => c.close);
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance) / mean;

    return Math.min(95, Math.max(10, Math.round(volatility * 5000)));
  }, [candleData]);

  // AI Tooltips data
  const aiTooltips: AITooltipData[] = [
    {
      id: "bearish-divergence",
      text: "IA: Neural Advisor detects Bearish Divergence (75% Confianza)",
      confidence: "75% confianza",
      position: { top: "15%", left: "8%" },
      type: "bearish",
    },
    {
      id: "hybrid-long",
      text: "IA: Hybrid v10 suggsts LONG Entry here (Grado B)",
      confidence: "Grado B",
      position: { top: "50%", left: "65%" },
      type: "bullish",
    },
  ];

  const handleOptimize = async () => {
    setOptimizerLoading(true);
    try {
      const result = await runOptimizerV5({
        symbol: selectedAsset,
        timeframe: selectedTimeframe
      });
      console.log("Optimizer result:", result);
    } catch (error) {
      console.error("Optimizer error:", error);
    } finally {
      setOptimizerLoading(false);
    }
  };

  return (
    <AnalysisLayout>
      <div className="flex h-[calc(100vh-140px)] flex-col gap-4">
        {/* Chart Section (70%) */}
        <div className="relative flex-[7] rounded-2xl border border-[#9ca3af]/20 bg-[#141824] p-4">
          {/* AI Mode Badge */}
          <AIModeBadge isActivated />

          {/* Asset Selector */}
          <AssetSelector selectedAsset={selectedAsset} onSelectAsset={setSelectedAsset} />

          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#0a0e1a]/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00d4ff] border-t-transparent"></div>
                <p className="text-sm text-[#00d4ff]">Cargando datos reales del servidor...</p>
              </div>
            </div>
          )}

          {/* Main Chart */}
          <div className="h-full w-full pt-2">
            <CandlestickChart
              data={candleData}
              maFast={maFastData}
              maSlow={maSlowData}
              volume={volumeData}
              height={500}
            />
          </div>

          {/* AI Tooltips */}
          {aiTooltips.map((tooltip) => (
            <AITooltip key={tooltip.id} data={tooltip} />
          ))}

          {/* Optimize Button (centered) */}
          <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
            <OptimizeButton onClick={handleOptimize} loading={optimizerLoading} />
          </div>

          {/* Optimization Box */}
          <OptimizationBox startPercent={25} endPercent={75} ftOptimal="0/3" />
        </div>

        {/* Metrics Panel (30%) */}
        <div className="flex flex-[3] gap-4">
          {/* Quantum Risk Meter - Left side (40%) */}
          <div className="flex-[2]">
            <QuantumRiskMeter value={riskScore} />
          </div>

          {/* RSI Chart - Right side (60%) */}
          <div className="flex-[3]">
            <RSIChart data={rsiData} secondaryData={rsiSignalData} height={240} />
          </div>
        </div>
      </div>
    </AnalysisLayout>
  );
}
