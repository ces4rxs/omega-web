'use client';

import { useEffect, useRef } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  Time,
  CandlestickSeries,
  HistogramSeries,
} from 'lightweight-charts';
import { useChartStore } from '../../store';
import type { CandleData } from '../../types';

interface ChartCanvasProps {
  data: CandleData[];
  onChartReady?: (chart: IChartApi) => void;
}

export default function ChartCanvas({ data, onChartReady }: ChartCanvasProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const settings = useChartStore((state) => state.settings);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: settings.layout.background },
        textColor: settings.layout.textColor,
      },
      grid: {
        vertLines: {
          color: settings.grid.vertLines.color,
          visible: settings.grid.vertLines.visible,
        },
        horzLines: {
          color: settings.grid.horzLines.color,
          visible: settings.grid.horzLines.visible,
        },
      },
      crosshair: {
        mode: 1, // Normal crosshair
        vertLine: {
          width: 1,
          color: 'rgba(224, 227, 235, 0.3)',
          style: 0,
          labelBackgroundColor: settings.candleColors.upColor,
        },
        horzLine: {
          width: 1,
          color: 'rgba(224, 227, 235, 0.3)',
          style: 0,
          labelBackgroundColor: settings.candleColors.upColor,
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
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      watermark: {
        visible: false,
      },
    });

    // Create candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: settings.candleColors.upColor,
      downColor: settings.candleColors.downColor,
      borderUpColor: settings.candleColors.borderUpColor,
      borderDownColor: settings.candleColors.borderDownColor,
      wickUpColor: settings.candleColors.wickUpColor,
      wickDownColor: settings.candleColors.wickDownColor,
    });

    // Create volume series (histogram)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Create separate price scale for volume
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // Notify parent when chart is ready
    if (onChartReady) {
      onChartReady(chart);
    }

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

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [settings, onChartReady]);

  // Update data when it changes
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !data.length) return;

    try {
      // Convert data to Lightweight Charts format
      const candleData: CandlestickData<Time>[] = data.map((candle) => ({
        time: candle.time as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));

      const volumeData = data.map((candle) => ({
        time: candle.time as Time,
        value: candle.volume,
        color: candle.close >= candle.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
      }));

      // Set data
      candleSeriesRef.current.setData(candleData);
      volumeSeriesRef.current.setData(volumeData);

      // Fit content to visible range
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    } catch (error) {
      console.error('Error updating chart data:', error);
    }
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full"
      style={{ position: 'relative' }}
    />
  );
}
