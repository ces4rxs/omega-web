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

type CandlePoint = CandlestickData & { timestamp: string };

export default function AnalysisPage() {
  const [selectedAsset, setSelectedAsset] = useState("BTCUSD");
  const [optimizerLoading, setOptimizerLoading] = useState(false);
  const [candleData, setCandleData] = useState<CandlestickData[]>([]);
  const [maFastData, setMaFastData] = useState<LineData[]>([]);
  const [maSlowData, setMaSlowData] = useState<LineData[]>([]);
  const [volumeData, setVolumeData] = useState<HistogramData[]>([]);
  const [rsiData, setRsiData] = useState<LineData[]>([]);
  const [rsiSignalData, setRsiSignalData] = useState<LineData[]>([]);

  // Generate mock data on mount or when asset changes
  useEffect(() => {
    generateMockData();
  }, [selectedAsset]);

  const generateMockData = () => {
    const dataPoints = 100;
    const basePrice = selectedAsset === "BTCUSD" ? 45000 : selectedAsset === "ETHUSD" ? 3000 : 2000;
    const candles: CandlestickData[] = [];
    const maFast: LineData[] = [];
    const maSlow: LineData[] = [];
    const volume: HistogramData[] = [];
    const rsi: LineData[] = [];
    const rsiSignal: LineData[] = [];

    let lastClose = basePrice;

    for (let i = 0; i < dataPoints; i++) {
      const time = Math.floor(Date.now() / 1000) - (dataPoints - i) * 3600;

      // Generate candlestick
      const change = (Math.random() - 0.48) * (basePrice * 0.02);
      const open = lastClose;
      const close = open + change;
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);

      candles.push({
        time: time as any,
        open,
        high,
        low,
        close,
      });

      // Generate volume
      volume.push({
        time: time as any,
        value: Math.random() * 1000000 + 500000,
        color: close > open ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)",
      });

      // Generate moving averages
      if (i >= 10) {
        const maFastValue = candles.slice(i - 10, i + 1).reduce((sum, c) => sum + c.close, 0) / 11;
        maFast.push({ time: time as any, value: maFastValue });
      }

      if (i >= 20) {
        const maSlowValue = candles.slice(i - 20, i + 1).reduce((sum, c) => sum + c.close, 0) / 21;
        maSlow.push({ time: time as any, value: maSlowValue });
      }

      // Generate RSI
      if (i >= 14) {
        const rsiValue = 30 + Math.random() * 40; // RSI between 30-70
        rsi.push({ time: time as any, value: rsiValue });
        rsiSignal.push({ time: time as any, value: rsiValue + (Math.random() - 0.5) * 10 });
      }

      lastClose = close;
    }

    setCandleData(candles);
    setMaFastData(maFast);
    setMaSlowData(maSlow);
    setVolumeData(volume);
    setRsiData(rsi);
    setRsiSignalData(rsiSignal);
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
    // Simulate optimizer execution
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setOptimizerLoading(false);
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
