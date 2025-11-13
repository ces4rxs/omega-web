import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LayoutType = '1x1' | '2x1' | '2x2';
export type ToolType = 'cursor' | 'crosshair' | 'line' | 'fibo' | 'rectangle' | 'text' | 'eraser';
export type Theme = 'dark' | 'light';
export type ChartType = 'candlestick' | 'hollow' | 'bar' | 'line' | 'area' | 'heikinAshi' | 'renko';

export interface VolumeProfileSettings {
  enabled: boolean;
  period: number; // Number of bars to analyze
  valueAreaPercentage: number; // Default 70% for VAH/VAL
  showPOC: boolean;
  showValueArea: boolean;
  rowSize: number; // Price increment per row (auto if 0)
  profileColor: string;
  pocColor: string;
  valueAreaColor: string;
  opacity: number;
}

interface Panel {
  id: string;
  symbol: string;
  timeframe: string;
  indicators: string[];
  visible: boolean;
}

interface UIState {
  // Layout
  layout: LayoutType;
  panels: Panel[];

  // Active tool
  activeTool: ToolType;

  // Docks visibility
  rightDockOpen: boolean;
  bottomDockOpen: boolean;
  tutorDrawerOpen: boolean;

  // Theme
  theme: Theme;

  // Current selection
  currentSymbol: string;
  currentTimeframe: string;
  chartType: ChartType;

  // Volume Profile
  volumeProfile: VolumeProfileSettings;

  // Backtest state
  backtestRunning: boolean;
  backtestProgress: number;
  backtestRunId: string | null;

  // Actions
  setLayout: (layout: LayoutType) => void;
  setActiveTool: (tool: ToolType) => void;
  toggleRightDock: () => void;
  toggleBottomDock: () => void;
  toggleTutorDrawer: () => void;
  setTheme: (theme: Theme) => void;
  setCurrentSymbol: (symbol: string) => void;
  setCurrentTimeframe: (timeframe: string) => void;
  setChartType: (chartType: ChartType) => void;
  updateVolumeProfile: (updates: Partial<VolumeProfileSettings>) => void;
  startBacktest: (runId: string) => void;
  updateBacktestProgress: (progress: number) => void;
  stopBacktest: () => void;
  addPanel: (panel: Panel) => void;
  removePanel: (id: string) => void;
  updatePanel: (id: string, updates: Partial<Panel>) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      layout: '1x1',
      panels: [
        {
          id: 'panel-1',
          symbol: 'BTCUSDT',
          timeframe: '1h',
          indicators: [],
          visible: true,
        },
      ],
      activeTool: 'cursor',
      rightDockOpen: true,
      bottomDockOpen: true,
      tutorDrawerOpen: false,
      theme: 'dark',
      currentSymbol: 'BTCUSDT',
      currentTimeframe: '1h',
      chartType: 'candlestick',
      volumeProfile: {
        enabled: false,
        period: 100,
        valueAreaPercentage: 70,
        showPOC: true,
        showValueArea: true,
        rowSize: 0, // Auto-calculate
        profileColor: '#2962ff',
        pocColor: '#ff6d00',
        valueAreaColor: '#00c853',
        opacity: 0.6,
      },
      backtestRunning: false,
      backtestProgress: 0,
      backtestRunId: null,

      // Actions
      setLayout: (layout) => set({ layout }),

      setActiveTool: (tool) => set({ activeTool: tool }),

      toggleRightDock: () => set((state) => ({ rightDockOpen: !state.rightDockOpen })),

      toggleBottomDock: () => set((state) => ({ bottomDockOpen: !state.bottomDockOpen })),

      toggleTutorDrawer: () => set((state) => ({ tutorDrawerOpen: !state.tutorDrawerOpen })),

      setTheme: (theme) => set({ theme }),

      setCurrentSymbol: (symbol) => set({ currentSymbol: symbol }),

      setCurrentTimeframe: (timeframe) => set({ currentTimeframe: timeframe }),

      setChartType: (chartType) => set({ chartType }),

      updateVolumeProfile: (updates) =>
        set((state) => ({
          volumeProfile: { ...state.volumeProfile, ...updates },
        })),

      startBacktest: (runId) => set({ backtestRunning: true, backtestRunId: runId, backtestProgress: 0 }),

      updateBacktestProgress: (progress) => set({ backtestProgress: progress }),

      stopBacktest: () => set({ backtestRunning: false, backtestProgress: 0, backtestRunId: null }),

      addPanel: (panel) => set((state) => ({ panels: [...state.panels, panel] })),

      removePanel: (id) => set((state) => ({ panels: state.panels.filter((p) => p.id !== id) })),

      updatePanel: (id, updates) =>
        set((state) => ({
          panels: state.panels.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
    }),
    {
      name: 'omega-tvplus-ui',
      partialize: (state) => ({
        layout: state.layout,
        theme: state.theme,
        chartType: state.chartType,
        volumeProfile: state.volumeProfile,
        rightDockOpen: state.rightDockOpen,
        bottomDockOpen: state.bottomDockOpen,
      }),
    }
  )
);
