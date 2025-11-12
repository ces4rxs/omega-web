'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from '../state/ui';
import ChartPanel from './ChartPanel';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Mock data generator (same as before)
function generateMockCandleData(symbol: string, timeframe: string, count: number = 500): CandleData[] {
  const data: CandleData[] = [];
  const now = Date.now();
  const timeframeMs = getTimeframeMilliseconds(timeframe);

  let basePrice = 43000;
  if (symbol.includes('ETH')) basePrice = 2250;
  if (symbol.includes('AAPL')) basePrice = 180;

  for (let i = count - 1; i >= 0; i--) {
    const time = Math.floor((now - i * timeframeMs) / 1000);
    const volatility = basePrice * 0.002;
    const trend = (Math.random() - 0.5) * volatility * 2;
    const open = basePrice;
    const high = open + Math.abs(Math.random() * volatility);
    const low = open - Math.abs(Math.random() * volatility);
    const close = open + trend;
    const realHigh = Math.max(open, close, high);
    const realLow = Math.min(open, close, low);
    const priceMove = Math.abs(close - open);
    const baseVolume = 1000000;
    const volume = baseVolume + (priceMove / volatility) * baseVolume * 0.5;

    data.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(realHigh.toFixed(2)),
      low: Number(realLow.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Number(volume.toFixed(0)),
    });

    basePrice = close;
  }

  return data;
}

function getTimeframeMilliseconds(timeframe: string): number {
  const map: Record<string, number> = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1D': 24 * 60 * 60 * 1000,
  };
  return map[timeframe] || 60 * 60 * 1000;
}

export default function ChartGrid() {
  const { layout, panels, currentSymbol, currentTimeframe, removePanel } = useUIStore();
  const [chartData, setChartData] = useState<Record<string, CandleData[]>>({});

  // Load data for all panels
  useEffect(() => {
    const loadData = async () => {
      const newData: Record<string, CandleData[]> = {};

      for (const panel of panels) {
        const key = `${panel.symbol}-${panel.timeframe}`;
        if (!chartData[key]) {
          // TODO: Replace with real API call
          newData[key] = generateMockCandleData(panel.symbol, panel.timeframe, 500);
        } else {
          newData[key] = chartData[key];
        }
      }

      setChartData(newData);
    };

    loadData();
  }, [panels]);

  const getGridClassName = () => {
    switch (layout) {
      case '1x1':
        return 'grid-cols-1 grid-rows-1';
      case '2x1':
        return 'grid-cols-2 grid-rows-1';
      case '2x2':
        return 'grid-cols-2 grid-rows-2';
      default:
        return 'grid-cols-1 grid-rows-1';
    }
  };

  return (
    <div className={`w-full h-full grid ${getGridClassName()} gap-2 p-2`}>
      {panels.slice(0, layout === '1x1' ? 1 : layout === '2x1' ? 2 : 4).map((panel) => {
        const dataKey = `${panel.symbol}-${panel.timeframe}`;
        const data = chartData[dataKey] || [];

        return (
          <ChartPanel
            key={panel.id}
            id={panel.id}
            symbol={panel.symbol}
            timeframe={panel.timeframe}
            data={data}
            indicators={panel.indicators}
            onRemove={panels.length > 1 ? () => removePanel(panel.id) : undefined}
          />
        );
      })}
    </div>
  );
}
