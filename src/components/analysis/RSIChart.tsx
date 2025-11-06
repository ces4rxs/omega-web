"use client";

import { useEffect, useRef } from "react";
import { createChart, type IChartApi, type ISeriesApi, type LineData } from "lightweight-charts";

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

  useEffect(() => {
    if (!chartContainerRef.current) return;

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
    const rsiSeries = (chart as any).addLineSeries({
      color: "#00d4ff",
      lineWidth: 2,
      title: "RSI",
      priceLineVisible: false,
    });

    // Secondary line (orange) - could be another indicator
    const secondarySeries = (chart as any).addLineSeries({
      color: "#fb923c",
      lineWidth: 2,
      title: "Signal",
      priceLineVisible: false,
    });

    // Add reference lines at 30, 50, 70
    chart.applyOptions({
      rightPriceScale: {
        autoScale: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
    });

    chartRef.current = chart;
    rsiSeriesRef.current = rsiSeries;
    secondarySeriesRef.current = secondarySeries;

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
    if (!rsiSeriesRef.current || !data.length) return;
    rsiSeriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  useEffect(() => {
    if (!secondarySeriesRef.current || !secondaryData.length) return;
    secondarySeriesRef.current.setData(secondaryData);
  }, [secondaryData]);

  return (
    <div className="relative h-full w-full rounded-2xl border border-[#9ca3af]/20 bg-[#1a1f2e] p-4">
      <div className="mb-2 flex items-center justify-between">
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
      <div ref={chartContainerRef} className="h-[calc(100%-32px)] w-full" />
      {/* Reference lines labels */}
      <div className="pointer-events-none absolute right-16 top-16 flex flex-col gap-8 text-[10px] text-[#9ca3af]/60">
        <span>70</span>
        <span>50</span>
        <span>30</span>
      </div>
    </div>
  );
}
