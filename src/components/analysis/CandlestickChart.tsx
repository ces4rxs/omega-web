"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type LineData,
} from "lightweight-charts";

interface CandlestickChartProps {
  data: CandlestickData[];
  maFast?: LineData[];
  maSlow?: LineData[];
  volume?: HistogramData[];
  height?: number;
}

export function CandlestickChart({
  data,
  maFast = [],
  maSlow = [],
  volume = [],
  height = 500,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const maFastSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const maSlowSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      height,
      layout: {
        background: { color: "#0a0e1a" },
        textColor: "#9ca3af",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.05)" },
        horzLines: { color: "rgba(255, 255, 255, 0.05)" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "#00d4ff",
          width: 1,
          style: 2,
          labelBackgroundColor: "#00d4ff",
        },
        horzLine: {
          color: "#00d4ff",
          width: 1,
          style: 2,
          labelBackgroundColor: "#00d4ff",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(0, 212, 255, 0.3)",
      },
      timeScale: {
        borderColor: "rgba(0, 212, 255, 0.3)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Candlestick series
    const candleSeries = (chart as any).addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#10b981",
      borderDownColor: "#ef4444",
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    // Volume histogram
    const volumeSeries = (chart as any).addHistogramSeries({
      color: "#00d4ff",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // MA Fast (cyan)
    const maFastSeries = (chart as any).addLineSeries({
      color: "#00d4ff",
      lineWidth: 2,
      title: "MA Rápida",
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // MA Slow (orange)
    const maSlowSeries = (chart as any).addLineSeries({
      color: "#fb923c",
      lineWidth: 2,
      title: "MA Lenta",
      priceLineVisible: false,
      lastValueVisible: false,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    maFastSeriesRef.current = maFastSeries;
    maSlowSeriesRef.current = maSlowSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    if (!candleSeriesRef.current || !data.length) return;
    candleSeriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  useEffect(() => {
    if (!maFastSeriesRef.current || !maFast.length) return;
    maFastSeriesRef.current.setData(maFast);
  }, [maFast]);

  useEffect(() => {
    if (!maSlowSeriesRef.current || !maSlow.length) return;
    maSlowSeriesRef.current.setData(maSlow);
  }, [maSlow]);

  useEffect(() => {
    if (!volumeSeriesRef.current || !volume.length) return;
    const volumeData = volume.map((v) => ({
      ...v,
      color: "rgba(0, 212, 255, 0.3)",
    }));
    volumeSeriesRef.current.setData(volumeData);
  }, [volume]);

  return (
    <div className="relative h-full w-full">
      <div ref={chartContainerRef} className="h-full w-full" />
    </div>
  );
}
