import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BacktestResults } from '../types/backtest';
import { generateMockBacktestResults } from '../types/backtest';

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

export interface SavedLayout {
  id: string;
  name: string;
  chartType: ChartType;
  volumeProfile: VolumeProfileSettings;
  activeIndicators: string[];
  gridLayout: LayoutType;
  createdAt: number;
  isTemplate?: boolean; // For predefined templates
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

  // Active indicators
  activeIndicators: string[];

  // Volume Profile
  volumeProfile: VolumeProfileSettings;

  // Saved Layouts
  savedLayouts: SavedLayout[];
  currentLayoutId: string | null;

  // Backtest state
  backtestRunning: boolean;
  backtestProgress: number;
  backtestRunId: string | null;
  backtestResults: BacktestResults | null;
  selectedTradeId: number | null;

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
  toggleIndicator: (indicator: string) => void;
  updateVolumeProfile: (updates: Partial<VolumeProfileSettings>) => void;
  saveCurrentLayout: (name: string) => void;
  loadLayout: (id: string) => void;
  deleteLayout: (id: string) => void;
  renameLayout: (id: string, newName: string) => void;
  startBacktest: (runId: string) => void;
  updateBacktestProgress: (progress: number) => void;
  stopBacktest: () => void;
  completeBacktest: (results: BacktestResults) => void;
  selectTrade: (tradeId: number | null) => void;
  addPanel: (panel: Panel) => void;
  removePanel: (id: string) => void;
  updatePanel: (id: string, updates: Partial<Panel>) => void;
}

// Predefined templates
const DEFAULT_TEMPLATES: SavedLayout[] = [
  {
    id: 'template-day-trading',
    name: 'Day Trading',
    chartType: 'candlestick',
    volumeProfile: {
      enabled: true,
      period: 50,
      valueAreaPercentage: 70,
      showPOC: true,
      showValueArea: true,
      rowSize: 0,
      profileColor: '#2962ff',
      pocColor: '#ff6d00',
      valueAreaColor: '#00c853',
      opacity: 0.6,
    },
    activeIndicators: ['rsi', 'volume'],
    gridLayout: '1x1',
    createdAt: Date.now(),
    isTemplate: true,
  },
  {
    id: 'template-swing-trading',
    name: 'Swing Trading',
    chartType: 'heikinAshi',
    volumeProfile: {
      enabled: false,
      period: 100,
      valueAreaPercentage: 70,
      showPOC: true,
      showValueArea: true,
      rowSize: 0,
      profileColor: '#2962ff',
      pocColor: '#ff6d00',
      valueAreaColor: '#00c853',
      opacity: 0.6,
    },
    activeIndicators: ['ema', 'macd', 'bollingerBands'],
    gridLayout: '1x1',
    createdAt: Date.now(),
    isTemplate: true,
  },
  {
    id: 'template-volume-analysis',
    name: 'Volume Analysis',
    chartType: 'candlestick',
    volumeProfile: {
      enabled: true,
      period: 100,
      valueAreaPercentage: 70,
      showPOC: true,
      showValueArea: true,
      rowSize: 0,
      profileColor: '#2962ff',
      pocColor: '#ff6d00',
      valueAreaColor: '#00c853',
      opacity: 0.7,
    },
    activeIndicators: ['volume', 'obv', 'vwap'],
    gridLayout: '1x1',
    createdAt: Date.now(),
    isTemplate: true,
  },
];

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
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
      activeIndicators: [],
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
      savedLayouts: DEFAULT_TEMPLATES,
      currentLayoutId: null,
      backtestRunning: false,
      backtestProgress: 0,
      backtestRunId: null,
      backtestResults: null,
      selectedTradeId: null,

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

      toggleIndicator: (indicator) =>
        set((state) => ({
          activeIndicators: state.activeIndicators.includes(indicator)
            ? state.activeIndicators.filter((i) => i !== indicator)
            : [...state.activeIndicators, indicator],
        })),

      updateVolumeProfile: (updates) =>
        set((state) => ({
          volumeProfile: { ...state.volumeProfile, ...updates },
        })),

      saveCurrentLayout: (name) => {
        const state = get();
        const newLayout: SavedLayout = {
          id: `layout-${Date.now()}`,
          name,
          chartType: state.chartType,
          volumeProfile: { ...state.volumeProfile },
          activeIndicators: state.activeIndicators,
          gridLayout: state.layout,
          createdAt: Date.now(),
        };
        set((state) => ({
          savedLayouts: [...state.savedLayouts, newLayout],
          currentLayoutId: newLayout.id,
        }));
      },

      loadLayout: (id) => {
        const state = get();
        const layout = state.savedLayouts.find((l) => l.id === id);
        if (layout) {
          set({
            chartType: layout.chartType,
            volumeProfile: { ...layout.volumeProfile },
            activeIndicators: layout.activeIndicators,
            layout: layout.gridLayout,
            currentLayoutId: id,
          });
        }
      },

      deleteLayout: (id) => {
        set((state) => ({
          savedLayouts: state.savedLayouts.filter((l) => l.id !== id && !l.isTemplate),
          currentLayoutId: state.currentLayoutId === id ? null : state.currentLayoutId,
        }));
      },

      renameLayout: (id, newName) => {
        set((state) => ({
          savedLayouts: state.savedLayouts.map((l) =>
            l.id === id && !l.isTemplate ? { ...l, name: newName } : l
          ),
        }));
      },

      startBacktest: (runId) => {
        const state = get();
        set({ backtestRunning: true, backtestRunId: runId, backtestProgress: 0, backtestResults: null });

        // Simulate backtest execution
        const simulateProgress = () => {
          const currentProgress = get().backtestProgress;
          if (currentProgress < 100) {
            set({ backtestProgress: Math.min(100, currentProgress + 10) });
            setTimeout(simulateProgress, 300);
          } else {
            // Generate mock results
            const results = generateMockBacktestResults(state.currentSymbol, state.currentTimeframe);
            set({
              backtestRunning: false,
              backtestResults: results,
              backtestProgress: 100,
            });
          }
        };
        setTimeout(simulateProgress, 300);
      },

      updateBacktestProgress: (progress) => set({ backtestProgress: progress }),

      stopBacktest: () => set({
        backtestRunning: false,
        backtestProgress: 0,
        backtestRunId: null,
        backtestResults: null,
        selectedTradeId: null,
      }),

      completeBacktest: (results) => set({
        backtestRunning: false,
        backtestResults: results,
        backtestProgress: 100,
      }),

      selectTrade: (tradeId) => set({ selectedTradeId: tradeId }),

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
        savedLayouts: state.savedLayouts,
        currentLayoutId: state.currentLayoutId,
        rightDockOpen: state.rightDockOpen,
        bottomDockOpen: state.bottomDockOpen,
      }),
    }
  )
);
