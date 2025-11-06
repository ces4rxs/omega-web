"use client";

import { useEffect, useRef, useState } from "react";
import type { CandlestickData, HistogramData, LineData } from "lightweight-charts";

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
  const chartRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const maFastSeriesRef = useRef<any>(null);
  const maSlowSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let isMounted = true;

    // Dynamic import to avoid SSR issues with lightweight-charts
    import("lightweight-charts").then(({ createChart }) => {
      if (!isMounted || !chartContainerRef.current) return;

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

      setIsChartReady(true);

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener("resize", handleResize);
      handleResize(); // Initial resize

      return () => {
        isMounted = false;
        window.removeEventListener("resize", handleResize);
        if (chartRef.current) {
          chart.remove();
          chartRef.current = null;
        }
      };
    }).catch((error) => {
      console.error("Error loading lightweight-charts:", error);
    });

    return () => {
      isMounted = false;
    };
  }, [height]);

  useEffect(() => {
    if (!isChartReady || !candleSeriesRef.current || !data.length) return;
    candleSeriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [data, isChartReady]);

  useEffect(() => {
    if (!isChartReady || !maFastSeriesRef.current || !maFast.length) return;
    maFastSeriesRef.current.setData(maFast);
  }, [maFast, isChartReady]);

  useEffect(() => {
    if (!isChartReady || !maSlowSeriesRef.current || !maSlow.length) return;
    maSlowSeriesRef.current.setData(maSlow);
  }, [maSlow, isChartReady]);

  useEffect(() => {
    if (!isChartReady || !volumeSeriesRef.current || !volume.length) return;
    const volumeData = volume.map((v) => ({
      ...v,
      color: "rgba(0, 212, 255, 0.3)",
    }));
    volumeSeriesRef.current.setData(volumeData);
  }, [volume, isChartReady]);

  return (
    <div className="relative h-full w-full">
      <div ref={chartContainerRef} className="h-full w-full" />
      {!isChartReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs text-[#9ca3af]">Cargando chart...</div>
        </div>
      )}
    </div>
  );
}
