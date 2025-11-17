'use client';

import { useState } from 'react';
import { useUIStore } from '../state/ui';
import type { ChartType } from '../state/ui';
import { Search, Play, Layout, Sun, Moon, ChevronDown, CandlestickChart, BarChart3, LineChart, AreaChart, Box, Layers } from 'lucide-react';
import LayoutsModal from './LayoutsModal';
import { runBacktest } from '@/lib/omega';
import { transformBacktestResponse, type BackendBacktestResponse } from '@/lib/transformBacktest';
import { useToast } from '@/components/ui/toast';

const POPULAR_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'XAUUSD',
  'EURUSD',
  'AAPL',
  'TSLA',
  'GOOGL',
];

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D'];

const LAYOUTS = [
  { value: '1x1' as const, label: '1×1' },
  { value: '2x1' as const, label: '2×1' },
  { value: '2x2' as const, label: '2×2' },
];

const CHART_TYPES: Array<{ value: ChartType; label: string; icon: React.ElementType }> = [
  { value: 'candlestick', label: 'Candlestick', icon: CandlestickChart },
  { value: 'hollow', label: 'Hollow Candles', icon: CandlestickChart },
  { value: 'bar', label: 'Bars (OHLC)', icon: BarChart3 },
  { value: 'line', label: 'Line', icon: LineChart },
  { value: 'area', label: 'Area', icon: AreaChart },
  { value: 'heikinAshi', label: 'Heikin Ashi', icon: CandlestickChart },
  { value: 'renko', label: 'Renko', icon: Box },
];

export default function Topbar() {
  const {
    currentSymbol,
    currentTimeframe,
    layout,
    theme,
    chartType,
    backtestRunning,
    bottomDockOpen,
    setCurrentSymbol,
    setCurrentTimeframe,
    setLayout,
    setTheme,
    setChartType,
    startBacktest,
    completeBacktest,
    stopBacktest,
    toggleBottomDock,
  } = useUIStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chartTypeOpen, setChartTypeOpen] = useState(false);
  const [layoutsModalOpen, setLayoutsModalOpen] = useState(false);

  const { addToast } = useToast();

  const handleSymbolSelect = (symbol: string) => {
    setCurrentSymbol(symbol);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleBacktest = async () => {
    try {
      // Generar ID único del backtest
      const runId = `run-${Date.now()}`;

      // Iniciar el backtest en el estado
      startBacktest(runId);

      // Calcular fechas (últimos 365 días por defecto)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 365);

      // Formatear fechas a YYYY-MM-DD
      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      // Mostrar notificación de inicio
      addToast({
        title: 'Ejecutando backtest...',
        description: `${currentSymbol} en ${currentTimeframe}`,
        type: 'info',
        duration: 3000
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Iniciando backtest:', {
          symbol: currentSymbol,
          timeframe: currentTimeframe,
          startDate: formatDate(startDate),
          endDate: formatDate(endDate)
        });
      }

      // Llamar al backend real
      const response = await runBacktest({
        strategy: 'smaCrossover', // Por defecto, esto podría venir de settings
        symbol: currentSymbol,
        timeframe: currentTimeframe === '1m' ? 'minute'
                  : currentTimeframe === '5m' ? 'minute'
                  : currentTimeframe === '15m' ? 'minute'
                  : currentTimeframe === '1h' ? 'hour'
                  : currentTimeframe === '4h' ? 'hour'
                  : currentTimeframe === '1D' ? 'day'
                  : 'day', // Convertir formato frontend a backend
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        initialCash: 10000,
        feeBps: 10,
        slippageBps: 5
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Respuesta del backend recibida:', response);
      }

      // Transformar la respuesta al formato del frontend
      const transformedData = transformBacktestResponse(response as BackendBacktestResponse);

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Datos transformados:', transformedData);
      }

      // Actualizar el estado con los resultados
      completeBacktest(transformedData.backtest);

      // Mostrar éxito
      addToast({
        title: 'Backtest completado',
        description: `${transformedData.backtest.trades?.length || 0} trades ejecutados`,
        type: 'success',
        duration: 5000
      });

      // Abrir el dock inferior para mostrar resultados
      if (!bottomDockOpen) {
        toggleBottomDock();
      }

    } catch (error: any) {
      console.error('❌ Error ejecutando backtest:', error);

      // Detener el backtest en caso de error
      stopBacktest();

      // Mostrar error al usuario
      addToast({
        title: 'Error en backtest',
        description: error.message || 'Error al ejecutar el backtest',
        type: 'error',
        duration: 6000
      });
    }
  };

  const filteredSymbols = searchQuery
    ? POPULAR_SYMBOLS.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : POPULAR_SYMBOLS;

  return (
    <div className="h-14 bg-[#1e222d] border-b border-[#2a2e39] flex items-center px-4 gap-4">
      {/* Symbol Search */}
      <div className="relative">
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#131722] hover:bg-[#2a2e39] rounded text-white transition-colors"
        >
          <span className="font-semibold">{currentSymbol}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {searchOpen && (
          <div className="absolute top-full mt-1 left-0 w-64 bg-[#131722] border border-[#2a2e39] rounded-lg shadow-xl z-50">
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search symbols..."
                  className="w-full pl-10 pr-3 py-2 bg-[#2a2e39] border border-[#363a45] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#2962ff]"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredSymbols.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => handleSymbolSelect(symbol)}
                  className="w-full px-4 py-2 text-left text-white hover:bg-[#2a2e39] transition-colors"
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-[#2a2e39]" />

      {/* Timeframes */}
      <div className="flex items-center gap-1">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => setCurrentTimeframe(tf)}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              currentTimeframe === tf
                ? 'bg-[#2962ff] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#2a2e39]'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-[#2a2e39]" />

      {/* Layout Selector */}
      <div className="flex items-center gap-1">
        <Layout className="w-4 h-4 text-gray-400" />
        {LAYOUTS.map((l) => (
          <button
            key={l.value}
            onClick={() => setLayout(l.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              layout === l.value
                ? 'bg-[#2962ff] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#2a2e39]'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-[#2a2e39]" />

      {/* Chart Type Selector */}
      <div className="relative">
        <button
          onClick={() => setChartTypeOpen(!chartTypeOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#131722] hover:bg-[#2a2e39] rounded text-white transition-colors"
        >
          {(() => {
            const current = CHART_TYPES.find((ct) => ct.value === chartType);
            const Icon = current?.icon || CandlestickChart;
            return (
              <>
                <Icon className="w-4 h-4" />
                <span className="text-sm">{current?.label || 'Candlestick'}</span>
                <ChevronDown className="w-4 h-4" />
              </>
            );
          })()}
        </button>

        {chartTypeOpen && (
          <div className="absolute top-full mt-1 left-0 w-48 bg-[#131722] border border-[#2a2e39] rounded-lg shadow-xl z-50">
            {CHART_TYPES.map((ct) => {
              const Icon = ct.icon;
              return (
                <button
                  key={ct.value}
                  onClick={() => {
                    setChartType(ct.value);
                    setChartTypeOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                    chartType === ct.value
                      ? 'bg-[#2962ff] text-white'
                      : 'text-gray-300 hover:bg-[#2a2e39]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{ct.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Layouts Button */}
      <button
        onClick={() => setLayoutsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-[#131722] hover:bg-[#2a2e39] rounded text-white transition-colors"
      >
        <Layers className="w-4 h-4" />
        <span className="text-sm font-medium">Layouts</span>
      </button>

      {/* Backtest Button */}
      <button
        onClick={handleBacktest}
        disabled={backtestRunning}
        className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors ${
          backtestRunning
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-[#2962ff] hover:bg-[#1e53e5] text-white'
        }`}
      >
        <Play className="w-4 h-4" />
        {backtestRunning ? 'Running...' : 'Backtest'}
      </button>

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="p-2 hover:bg-[#2a2e39] rounded transition-colors"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-gray-400" />
        ) : (
          <Moon className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Layouts Modal */}
      <LayoutsModal
        isOpen={layoutsModalOpen}
        onClose={() => setLayoutsModalOpen(false)}
      />
    </div>
  );
}
