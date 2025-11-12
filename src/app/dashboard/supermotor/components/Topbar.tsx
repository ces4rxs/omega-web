'use client';

import { useState } from 'react';
import { useUIStore } from '../state/ui';
import { Search, Play, Layout, Sun, Moon, ChevronDown } from 'lucide-react';

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

export default function Topbar() {
  const {
    currentSymbol,
    currentTimeframe,
    layout,
    theme,
    backtestRunning,
    setCurrentSymbol,
    setCurrentTimeframe,
    setLayout,
    setTheme,
    startBacktest,
  } = useUIStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSymbolSelect = (symbol: string) => {
    setCurrentSymbol(symbol);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleBacktest = () => {
    // Generate a unique run ID
    const runId = `run-${Date.now()}`;
    startBacktest(runId);
    // TODO: Call backend API to start backtest
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

      <div className="flex-1" />

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
    </div>
  );
}
