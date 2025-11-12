import { create } from 'zustand';
import type {
  CandleData,
  Timeframe,
  Symbol,
  ChartSettings,
  Indicator,
  Drawing,
  Alert,
  WatchlistItem
} from './types';

interface ChartState {
  // Chart Data
  candleData: CandleData[];
  volumeData: Array<{ time: number; value: number; color?: string }>;

  // Current Settings
  currentSymbol: Symbol;
  currentTimeframe: Timeframe;

  // Chart Settings
  settings: ChartSettings;

  // Indicators
  indicators: Indicator[];

  // Drawings
  drawings: Drawing[];
  selectedDrawingTool: string | null;

  // Alerts
  alerts: Alert[];

  // Watchlist
  watchlist: WatchlistItem[];

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  setCandleData: (data: CandleData[]) => void;
  setCurrentSymbol: (symbol: Symbol) => void;
  setCurrentTimeframe: (timeframe: Timeframe) => void;
  updateSettings: (settings: Partial<ChartSettings>) => void;

  // Indicator Actions
  addIndicator: (indicator: Indicator) => void;
  removeIndicator: (id: string) => void;
  toggleIndicator: (id: string) => void;
  updateIndicatorParams: (id: string, params: Record<string, number | string>) => void;

  // Drawing Actions
  addDrawing: (drawing: Drawing) => void;
  removeDrawing: (id: string) => void;
  updateDrawing: (id: string, drawing: Partial<Drawing>) => void;
  setSelectedDrawingTool: (tool: string | null) => void;
  clearAllDrawings: () => void;

  // Alert Actions
  addAlert: (alert: Alert) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;

  // Watchlist Actions
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (symbol: string) => void;
  updateWatchlistItem: (symbol: string, data: Partial<WatchlistItem>) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultSettings: ChartSettings = {
  theme: 'dark',
  candleColors: {
    upColor: '#26a69a',
    downColor: '#ef5350',
    borderUpColor: '#26a69a',
    borderDownColor: '#ef5350',
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350',
  },
  layout: {
    background: '#131722',
    textColor: '#d1d4dc',
  },
  grid: {
    vertLines: {
      color: 'rgba(42, 46, 57, 0.6)',
      visible: true,
    },
    horzLines: {
      color: 'rgba(42, 46, 57, 0.6)',
      visible: true,
    },
  },
};

const defaultSymbol: Symbol = {
  symbol: 'BTC/USD',
  name: 'Bitcoin / US Dollar',
  type: 'crypto',
  exchange: 'Binance',
};

export const useChartStore = create<ChartState>((set) => ({
  // Initial State
  candleData: [],
  volumeData: [],
  currentSymbol: defaultSymbol,
  currentTimeframe: '1h',
  settings: defaultSettings,
  indicators: [],
  drawings: [],
  selectedDrawingTool: null,
  alerts: [],
  watchlist: [],
  isLoading: false,
  error: null,

  // Actions
  setCandleData: (data) => set({ candleData: data }),

  setCurrentSymbol: (symbol) => set({ currentSymbol: symbol }),

  setCurrentTimeframe: (timeframe) => set({ currentTimeframe: timeframe }),

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  // Indicator Actions
  addIndicator: (indicator) =>
    set((state) => ({
      indicators: [...state.indicators, indicator],
    })),

  removeIndicator: (id) =>
    set((state) => ({
      indicators: state.indicators.filter((ind) => ind.id !== id),
    })),

  toggleIndicator: (id) =>
    set((state) => ({
      indicators: state.indicators.map((ind) =>
        ind.id === id ? { ...ind, visible: !ind.visible } : ind
      ),
    })),

  updateIndicatorParams: (id, params) =>
    set((state) => ({
      indicators: state.indicators.map((ind) =>
        ind.id === id ? { ...ind, params: { ...ind.params, ...params } } : ind
      ),
    })),

  // Drawing Actions
  addDrawing: (drawing) =>
    set((state) => ({
      drawings: [...state.drawings, drawing],
    })),

  removeDrawing: (id) =>
    set((state) => ({
      drawings: state.drawings.filter((draw) => draw.id !== id),
    })),

  updateDrawing: (id, drawing) =>
    set((state) => ({
      drawings: state.drawings.map((draw) =>
        draw.id === id ? { ...draw, ...drawing } : draw
      ),
    })),

  setSelectedDrawingTool: (tool) => set({ selectedDrawingTool: tool }),

  clearAllDrawings: () => set({ drawings: [] }),

  // Alert Actions
  addAlert: (alert) =>
    set((state) => ({
      alerts: [...state.alerts, alert],
    })),

  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    })),

  toggleAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
      ),
    })),

  // Watchlist Actions
  addToWatchlist: (item) =>
    set((state) => ({
      watchlist: [...state.watchlist, item],
    })),

  removeFromWatchlist: (symbol) =>
    set((state) => ({
      watchlist: state.watchlist.filter((item) => item.symbol !== symbol),
    })),

  updateWatchlistItem: (symbol, data) =>
    set((state) => ({
      watchlist: state.watchlist.map((item) =>
        item.symbol === symbol ? { ...item, ...data } : item
      ),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));
