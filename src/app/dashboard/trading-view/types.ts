// Trading View Types

export interface CandleData {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface VolumeData {
  time: number;
  value: number;
  color?: string;
}

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';

export interface TimeframeConfig {
  label: string;
  value: Timeframe;
  seconds: number;
}

export interface Symbol {
  symbol: string;
  name: string;
  type: 'crypto' | 'stock' | 'forex' | 'commodity';
  exchange?: string;
}

export interface ChartSettings {
  theme: 'dark' | 'light';
  candleColors: {
    upColor: string;
    downColor: string;
    borderUpColor: string;
    borderDownColor: string;
    wickUpColor: string;
    wickDownColor: string;
  };
  layout: {
    background: string;
    textColor: string;
  };
  grid: {
    vertLines: {
      color: string;
      visible: boolean;
    };
    horzLines: {
      color: string;
      visible: boolean;
    };
  };
}

export interface Indicator {
  id: string;
  type: 'sma' | 'ema' | 'rsi' | 'macd' | 'bollinger' | 'atr' | 'stochastic' | 'volume';
  name: string;
  visible: boolean;
  params: Record<string, number | string>;
  panel: 'main' | 'separate';
}

export interface Drawing {
  id: string;
  type: 'trendline' | 'horizontal' | 'vertical' | 'rectangle' | 'fibonacci' | 'text' | 'arrow';
  points: Array<{ time: number; price: number }>;
  settings: {
    color: string;
    lineWidth: number;
    lineStyle: 'solid' | 'dashed' | 'dotted';
    text?: string;
  };
}

export interface Alert {
  id: string;
  symbol: string;
  condition: 'above' | 'below' | 'crosses_up' | 'crosses_down';
  price: number;
  enabled: boolean;
  triggered: boolean;
  createdAt: number;
  triggeredAt?: number;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'crypto' | 'stock' | 'forex' | 'commodity';
}
