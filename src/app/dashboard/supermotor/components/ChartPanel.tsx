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
  IPriceLine,
} from 'lightweight-charts';
import { X, Maximize2 } from 'lucide-react';
import { useUIStore } from '../state/ui';
import type { ChartType, VolumeProfileSettings } from '../state/ui';

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

// Volume Profile calculation
interface VolumeProfileRow {
  price: number;
  volume: number;
}

interface VolumeProfileResult {
  rows: VolumeProfileRow[];
  poc: number; // Point of Control (price with highest volume)
  vah: number; // Value Area High
  val: number; // Value Area Low
  maxVolume: number;
}

function calculateVolumeProfile(
  data: CandleData[],
  settings: VolumeProfileSettings
): VolumeProfileResult | null {
  if (data.length === 0) return null;

  // Use only the last N bars based on period setting
  const analysisData = data.slice(-settings.period);
  if (analysisData.length === 0) return null;

  // Find price range
  const prices = analysisData.flatMap((c) => [c.high, c.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Calculate row size (price increment per row)
  let rowSize = settings.rowSize;
  if (rowSize === 0) {
    // Auto-calculate: aim for ~50 rows
    const priceRange = maxPrice - minPrice;
    rowSize = priceRange / 50;
  }

  // Create price levels (rows)
  const volumeMap = new Map<number, number>();
  const numRows = Math.ceil((maxPrice - minPrice) / rowSize);

  // Initialize all rows
  for (let i = 0; i <= numRows; i++) {
    const priceLevel = minPrice + i * rowSize;
    volumeMap.set(priceLevel, 0);
  }

  // Distribute volume across price levels
  for (const candle of analysisData) {
    // Find which price levels this candle covers
    const startLevel = Math.floor((candle.low - minPrice) / rowSize);
    const endLevel = Math.ceil((candle.high - minPrice) / rowSize);

    const numLevels = Math.max(1, endLevel - startLevel);
    const volumePerLevel = candle.volume / numLevels;

    for (let level = startLevel; level <= endLevel; level++) {
      const priceLevel = minPrice + level * rowSize;
      const currentVol = volumeMap.get(priceLevel) || 0;
      volumeMap.set(priceLevel, currentVol + volumePerLevel);
    }
  }

  // Convert to array and sort by price
  const rows: VolumeProfileRow[] = Array.from(volumeMap.entries())
    .map(([price, volume]) => ({ price, volume }))
    .sort((a, b) => a.price - b.price);

  if (rows.length === 0) return null;

  // Find POC (Point of Control) - price with highest volume
  const maxVolume = Math.max(...rows.map((r) => r.volume));
  const pocRow = rows.find((r) => r.volume === maxVolume);
  const poc = pocRow?.price || minPrice;

  // Calculate Value Area (VAH/VAL)
  // Value Area contains X% of total volume (default 70%)
  const totalVolume = rows.reduce((sum, r) => sum + r.volume, 0);
  const targetVolume = totalVolume * (settings.valueAreaPercentage / 100);

  // Start from POC and expand up/down until we reach target volume
  const pocIndex = rows.findIndex((r) => r.price === poc);
  let accumulatedVolume = rows[pocIndex].volume;
  let upperIndex = pocIndex;
  let lowerIndex = pocIndex;

  while (accumulatedVolume < targetVolume) {
    const upperVol = upperIndex < rows.length - 1 ? rows[upperIndex + 1].volume : 0;
    const lowerVol = lowerIndex > 0 ? rows[lowerIndex - 1].volume : 0;

    if (upperVol >= lowerVol && upperIndex < rows.length - 1) {
      upperIndex++;
      accumulatedVolume += upperVol;
    } else if (lowerIndex > 0) {
      lowerIndex--;
      accumulatedVolume += lowerVol;
    } else if (upperIndex < rows.length - 1) {
      upperIndex++;
      accumulatedVolume += upperVol;
    } else {
      break;
    }
  }

  const vah = rows[upperIndex].price;
  const val = rows[lowerIndex].price;

  return {
    rows,
    poc,
    vah,
    val,
    maxVolume,
  };
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
  const pocLineRef = useRef<IPriceLine | null>(null);
  const vahLineRef = useRef<IPriceLine | null>(null);
  const valLineRef = useRef<IPriceLine | null>(null);
  const entryLineRef = useRef<IPriceLine | null>(null);
  const exitLineRef = useRef<IPriceLine | null>(null);

  const chartType = useUIStore((state) => state.chartType);
  const volumeProfile = useUIStore((state) => state.volumeProfile);
  const selectedTradeId = useUIStore((state) => state.selectedTradeId);
  const backtestResults = useUIStore((state) => state.backtestResults);

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

  // Volume Profile rendering
  useEffect(() => {
    if (!chartRef.current || !mainSeriesRef.current || !data.length) return;

    // Remove existing volume profile lines
    if (pocLineRef.current) {
      mainSeriesRef.current.removePriceLine(pocLineRef.current);
      pocLineRef.current = null;
    }
    if (vahLineRef.current) {
      mainSeriesRef.current.removePriceLine(vahLineRef.current);
      vahLineRef.current = null;
    }
    if (valLineRef.current) {
      mainSeriesRef.current.removePriceLine(valLineRef.current);
      valLineRef.current = null;
    }

    // If volume profile is disabled, stop here
    if (!volumeProfile.enabled) return;

    try {
      // Calculate volume profile
      const vpResult = calculateVolumeProfile(data, volumeProfile);
      if (!vpResult) return;

      const { poc, vah, val } = vpResult;

      // Draw POC line (Point of Control)
      if (volumeProfile.showPOC) {
        const pocLine = mainSeriesRef.current.createPriceLine({
          price: poc,
          color: volumeProfile.pocColor,
          lineWidth: 2,
          lineStyle: 0, // Solid
          axisLabelVisible: true,
          title: 'POC',
        });
        pocLineRef.current = pocLine;
      }

      // Draw VAH line (Value Area High)
      if (volumeProfile.showValueArea) {
        const vahLine = mainSeriesRef.current.createPriceLine({
          price: vah,
          color: volumeProfile.valueAreaColor,
          lineWidth: 1,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: 'VAH',
        });
        vahLineRef.current = vahLine;

        // Draw VAL line (Value Area Low)
        const valLine = mainSeriesRef.current.createPriceLine({
          price: val,
          color: volumeProfile.valueAreaColor,
          lineWidth: 1,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: 'VAL',
        });
        valLineRef.current = valLine;
      }
    } catch (error) {
      console.error('Error rendering volume profile:', error);
    }
  }, [data, volumeProfile, mainSeriesRef.current]);

  // Trade zoom (Interconexión PRO)
  useEffect(() => {
    if (!chartRef.current || !mainSeriesRef.current) return;

    // Remove existing trade lines
    if (entryLineRef.current) {
      mainSeriesRef.current.removePriceLine(entryLineRef.current);
      entryLineRef.current = null;
    }
    if (exitLineRef.current) {
      mainSeriesRef.current.removePriceLine(exitLineRef.current);
      exitLineRef.current = null;
    }

    if (!selectedTradeId || !backtestResults) return;

    try {
      // Find the selected trade
      const trade = backtestResults.trades.find((t) => t.id === selectedTradeId);
      if (!trade) return;

      // Convert timestamps to seconds (Lightweight Charts uses seconds)
      const entryTime = Math.floor(trade.entryTime / 1000);
      const exitTime = Math.floor(trade.exitTime / 1000);

      // Add padding (10% of trade duration on each side)
      const tradeDuration = exitTime - entryTime;
      const padding = Math.max(tradeDuration * 0.1, 3600); // At least 1 hour padding

      const fromTime = entryTime - padding;
      const toTime = exitTime + padding;

      // Zoom to trade time range
      chartRef.current.timeScale().setVisibleRange({
        from: fromTime as Time,
        to: toTime as Time,
      });

      // Add entry price line
      const entryColor = trade.side === 'long' ? '#26a69a' : '#ef5350';
      const entryLine = mainSeriesRef.current.createPriceLine({
        price: trade.entryPrice,
        color: entryColor,
        lineWidth: 2,
        lineStyle: 0, // Solid
        axisLabelVisible: true,
        title: `${trade.side.toUpperCase()} Entry`,
      });
      entryLineRef.current = entryLine;

      // Add exit price line
      const exitColor = trade.pnl > 0 ? '#26a69a' : '#ef5350';
      const exitLine = mainSeriesRef.current.createPriceLine({
        price: trade.exitPrice,
        color: exitColor,
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: `Exit (${trade.pnl > 0 ? '+' : ''}${trade.pnlPercent.toFixed(2)}%)`,
      });
      exitLineRef.current = exitLine;
    } catch (error) {
      console.error('Error zooming to trade:', error);
    }
  }, [selectedTradeId, backtestResults, mainSeriesRef.current]);

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
