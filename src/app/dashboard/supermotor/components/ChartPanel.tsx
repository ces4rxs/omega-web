'use client';

import { useEffect, useRef } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  Time,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  AreaSeries,
  BarSeries,
} from 'lightweight-charts';
import { X, Maximize2 } from 'lucide-react';
import { useUIStore } from '../state/ui';
import type { ChartType } from '../state/ui';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartPanelProps {
  id: string;
  symbol: string;
  timeframe: string;
  data: CandleData[];
  indicators?: string[];
  onRemove?: () => void;
}

// Calculate Heikin Ashi candles
function calculateHeikinAshi(data: CandleData[]): CandleData[] {
  if (data.length === 0) return [];

  const haData: CandleData[] = [];
  let prevHaClose = (data[0].open + data[0].close) / 2;

  for (let i = 0; i < data.length; i++) {
    const candle = data[i];

    // Heikin Ashi formulas
    const haClose = (candle.open + candle.high + candle.low + candle.close) / 4;
    const haOpen = i === 0 ? (candle.open + candle.close) / 2 : (haData[i - 1].open + haData[i - 1].close) / 2;
    const haHigh = Math.max(candle.high, haOpen, haClose);
    const haLow = Math.min(candle.low, haOpen, haClose);

    haData.push({
      time: candle.time,
      open: haOpen,
      high: haHigh,
      low: haLow,
      close: haClose,
      volume: candle.volume,
    });

    prevHaClose = haClose;
  }

  return haData;
}

// Calculate Renko bricks
function calculateRenko(data: CandleData[], brickSize?: number): CandleData[] {
  if (data.length === 0) return [];

  // Auto-calculate brick size if not provided (0.5% of average price)
  if (!brickSize) {
    const avgPrice = data.reduce((sum, c) => sum + c.close, 0) / data.length;
    brickSize = avgPrice * 0.005; // 0.5% of average price
  }

  const renkoBricks: CandleData[] = [];
  let currentPrice = data[0].close;
  let currentOpen = data[0].close;
  let currentTime = data[0].time;

  for (let i = 1; i < data.length; i++) {
    const candle = data[i];
    const priceDiff = candle.close - currentOpen;

    // Calculate how many bricks we need
    const numBricks = Math.floor(Math.abs(priceDiff) / brickSize);

    if (numBricks > 0) {
      const direction = priceDiff > 0 ? 1 : -1;

      // Create bricks
      for (let j = 0; j < numBricks; j++) {
        const brickOpen = currentOpen;
        const brickClose = currentOpen + direction * brickSize;

        renkoBricks.push({
          time: candle.time,
          open: brickOpen,
          high: direction > 0 ? brickClose : brickOpen,
          low: direction > 0 ? brickOpen : brickClose,
          close: brickClose,
          volume: candle.volume / numBricks, // Distribute volume
        });

        currentOpen = brickClose;
      }

      currentTime = candle.time;
    }
  }

  return renkoBricks;
}

export default function ChartPanel({
  id,
  symbol,
  timeframe,
  data,
  indicators = [],
  onRemove,
}: ChartPanelProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const chartType = useUIStore((state) => state.chartType);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: '#131722' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.6)', visible: true },
        horzLines: { color: 'rgba(42, 46, 57, 0.6)', visible: true },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: 'rgba(224, 227, 235, 0.3)',
          style: 0,
          labelBackgroundColor: '#2962ff',
        },
        horzLine: {
          width: 1,
          color: 'rgba(224, 227, 235, 0.3)',
          style: 0,
          labelBackgroundColor: '#2962ff',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.4)',
        visible: true,
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.4)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, []);

  // Update chart series based on type
  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Remove existing series
    if (mainSeriesRef.current) {
      chartRef.current.removeSeries(mainSeriesRef.current);
      mainSeriesRef.current = null;
    }
    if (volumeSeriesRef.current) {
      chartRef.current.removeSeries(volumeSeriesRef.current);
      volumeSeriesRef.current = null;
    }

    try {
      let processedData = data;

      // Apply transformations if needed
      if (chartType === 'heikinAshi') {
        processedData = calculateHeikinAshi(data);
      } else if (chartType === 'renko') {
        processedData = calculateRenko(data);
      }

      // Create appropriate series based on chart type
      switch (chartType) {
        case 'candlestick':
        case 'heikinAshi':
        case 'renko': {
          const series = chartRef.current.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderUpColor: '#26a69a',
            borderDownColor: '#ef5350',
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
          });

          const candleData: CandlestickData<Time>[] = processedData.map((candle) => ({
            time: candle.time as Time,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
          }));

          series.setData(candleData);
          mainSeriesRef.current = series;
          break;
        }

        case 'hollow': {
          const series = chartRef.current.addSeries(CandlestickSeries, {
            upColor: 'rgba(38, 166, 154, 0)',
            downColor: '#ef5350',
            borderUpColor: '#26a69a',
            borderDownColor: '#ef5350',
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
            borderVisible: true,
          });

          const candleData: CandlestickData<Time>[] = processedData.map((candle) => ({
            time: candle.time as Time,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
          }));

          series.setData(candleData);
          mainSeriesRef.current = series;
          break;
        }

        case 'bar': {
          const series = chartRef.current.addSeries(BarSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            openVisible: true,
            thinBars: false,
          });

          const barData: CandlestickData<Time>[] = processedData.map((candle) => ({
            time: candle.time as Time,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
          }));

          series.setData(barData);
          mainSeriesRef.current = series;
          break;
        }

        case 'line': {
          const series = chartRef.current.addSeries(LineSeries, {
            color: '#2962ff',
            lineWidth: 2,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 4,
          });

          const lineData: LineData<Time>[] = processedData.map((candle) => ({
            time: candle.time as Time,
            value: candle.close,
          }));

          series.setData(lineData);
          mainSeriesRef.current = series;
          break;
        }

        case 'area': {
          const series = chartRef.current.addSeries(AreaSeries, {
            topColor: 'rgba(41, 98, 255, 0.4)',
            bottomColor: 'rgba(41, 98, 255, 0.0)',
            lineColor: '#2962ff',
            lineWidth: 2,
          });

          const areaData: LineData<Time>[] = processedData.map((candle) => ({
            time: candle.time as Time,
            value: candle.close,
          }));

          series.setData(areaData);
          mainSeriesRef.current = series;
          break;
        }
      }

      // Add volume histogram
      const volumeSeries = chartRef.current.addSeries(HistogramSeries, {
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });

      const volumeData = processedData.map((candle) => ({
        time: candle.time as Time,
        value: candle.volume,
        color: candle.close >= candle.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
      }));

      volumeSeries.setData(volumeData);
      volumeSeriesRef.current = volumeSeries;

      // Fit content
      chartRef.current.timeScale().fitContent();
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  }, [data, chartType]);

  return (
    <div className="relative w-full h-full bg-[#131722] border border-[#2a2e39] rounded-lg overflow-hidden">
      {/* Panel Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-[#1e222d] to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{symbol}</span>
          <span className="text-xs text-gray-400">{timeframe}</span>
          {indicators.length > 0 && (
            <div className="flex items-center gap-1">
              {indicators.map((ind) => (
                <span key={ind} className="px-2 py-0.5 text-xs bg-[#2962ff] text-white rounded">
                  {ind}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-[#2a2e39] rounded transition-colors">
            <Maximize2 className="w-4 h-4 text-gray-400" />
          </button>
          {onRemove && (
            <button onClick={onRemove} className="p-1 hover:bg-[#2a2e39] rounded transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
