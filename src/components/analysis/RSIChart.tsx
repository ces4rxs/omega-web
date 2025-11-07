"use client";

import { useEffect, useRef, useState } from "react";
import type { IChartApi, ISeriesApi, LineData } from "lightweight-charts";

interface RSIChartProps {
  data: LineData[];
  secondaryData?: LineData[];
  height?: number;
}

export function RSIChart({ data, secondaryData = [], height = 200 }: RSIChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const secondarySeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let isMounted = true;

    // Dynamic import to avoid SSR issues
    import("lightweight-charts").then(({ createChart, LineSeries }) => {
      if (!isMounted || !chartContainerRef.current) return;

      const chart = createChart(chartContainerRef.current, {
        height,
        layout: {
          background: { color: "transparent" },
          textColor: "#9ca3af",
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { color: "rgba(255, 255, 255, 0.05)" },
        },
        crosshair: {
          mode: 1,
          vertLine: {
            color: "#00d4ff",
            width: 1,
            style: 2,
          },
          horzLine: {
            color: "#00d4ff",
            width: 1,
            style: 2,
          },
        },
        rightPriceScale: {
          borderColor: "rgba(0, 212, 255, 0.3)",
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        timeScale: {
          borderColor: "rgba(0, 212, 255, 0.3)",
          visible: true,
        },
      });

      // RSI Line (cyan)
      const rsiSeries = chart.addLineSeries({
        color: "#00d4ff",
        lineWidth: 2,
        title: "RSI",
        priceLineVisible: false,
      });

      // Secondary line (orange)
      const secondarySeries = chart.addLineSeries({
        color: "#fb923c",
        lineWidth: 2,
        title: "Signal",
        priceLineVisible: false,
      });

      chartRef.current = chart;
      rsiSeriesRef.current = rsiSeries;
      secondarySeriesRef.current = secondarySeries;

      setIsChartReady(true);

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
      console.error("Error loading lightweight-charts for RSI:", error);
    });

    return () => {
      isMounted = false;
    };
  }, [height]);

  useEffect(() => {
    if (!isChartReady || !rsiSeriesRef.current || !data.length) return;
    rsiSeriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [data, isChartReady]);

  useEffect(() => {
    if (!isChartReady || !secondarySeriesRef.current || !secondaryData.length) return;
    secondarySeriesRef.current.setData(secondaryData);
  }, [secondaryData, isChartReady]);

  return (
    <div className="relative h-full w-full rounded-2xl border border-[#9ca3af]/20 bg-[#1a1f2e] p-4">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-[#111827]/60 via-transparent to-[#0a0e1a]/60" />
      <div className="relative z-10 mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-[#9ca3af]">
          RSI 4, 6, 8
        </h4>
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-[#00d4ff]" />
            <span className="text-[#9ca3af]">RSI</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-[#fb923c]" />
            <span className="text-[#9ca3af]">Signal</span>
          </div>
        </div>
      </div>
      <div className="relative z-10 h-[calc(100%-32px)] w-full">
        <div className="pointer-events-none absolute left-0 right-0 top-6 h-6 rounded-full bg-[#ef4444]/5" />
        <div className="pointer-events-none absolute left-0 right-0 bottom-6 h-6 rounded-full bg-[#10b981]/5" />
        <div ref={chartContainerRef} className="h-full w-full" />
      </div>
      {!isChartReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs text-[#9ca3af]">Cargando RSI...</div>
        </div>
      )}
      {/* Reference lines labels */}
      <div className="pointer-events-none absolute right-16 top-16 flex flex-col gap-8 text-[10px] text-[#9ca3af]/60">
        <span>70</span>
        <span>50</span>
        <span>30</span>
      </div>
    </div>
  );
}
