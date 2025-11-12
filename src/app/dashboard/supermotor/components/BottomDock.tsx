'use client';

import { useUIStore } from '../state/ui';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';

const MOCK_METRICS = {
  totalReturn: 45.2,
  sharpeRatio: 1.85,
  maxDrawdown: -12.5,
  winRate: 62.5,
  profitFactor: 2.1,
  totalTrades: 142,
};

const MOCK_LOGS = [
  { time: '2024-01-15 10:30:15', message: 'Backtest started for BTCUSDT 1h' },
  { time: '2024-01-15 10:30:16', message: 'Loading historical data...' },
  { time: '2024-01-15 10:30:18', message: 'Calculating indicators...' },
  { time: '2024-01-15 10:30:20', message: 'Running strategy simulation...' },
  { time: '2024-01-15 10:30:25', message: 'Backtest completed successfully' },
];

export default function BottomDock() {
  const { bottomDockOpen, toggleBottomDock, backtestRunning, backtestProgress } = useUIStore();

  if (!bottomDockOpen) {
    return (
      <button
        onClick={toggleBottomDock}
        className="absolute bottom-0 left-0 right-0 h-8 bg-[#1e222d] border-t border-[#2a2e39] flex items-center justify-center hover:bg-[#2a2e39] transition-colors"
      >
        <ChevronUp className="w-4 h-4 text-gray-400" />
      </button>
    );
  }

  return (
    <div className="h-80 bg-[#1e222d] border-t border-[#2a2e39] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2e39]">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-white">Backtest Console</h3>
          {backtestRunning && (
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-[#2a2e39] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2962ff] transition-all duration-300"
                  style={{ width: `${backtestProgress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{backtestProgress}%</span>
            </div>
          )}
        </div>
        <button onClick={toggleBottomDock}>
          <ChevronDown className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Logs Panel */}
        <div className="flex-1 flex flex-col border-r border-[#2a2e39]">
          <div className="px-4 py-2 bg-[#131722] border-b border-[#2a2e39]">
            <h4 className="text-xs font-medium text-gray-400">Execution Log</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs">
            {MOCK_LOGS.map((log, i) => (
              <div key={i} className="flex gap-2 text-gray-400">
                <span className="text-gray-600">{log.time}</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Panel */}
        <div className="w-96 flex flex-col">
          <div className="px-4 py-2 bg-[#131722] border-b border-[#2a2e39]">
            <h4 className="text-xs font-medium text-gray-400">Performance Metrics</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Total Return"
                value={`${MOCK_METRICS.totalReturn}%`}
                positive={MOCK_METRICS.totalReturn > 0}
              />
              <MetricCard
                label="Sharpe Ratio"
                value={MOCK_METRICS.sharpeRatio.toFixed(2)}
                positive={MOCK_METRICS.sharpeRatio > 1}
              />
              <MetricCard
                label="Max Drawdown"
                value={`${MOCK_METRICS.maxDrawdown}%`}
                positive={false}
              />
              <MetricCard
                label="Win Rate"
                value={`${MOCK_METRICS.winRate}%`}
                positive={MOCK_METRICS.winRate > 50}
              />
              <MetricCard
                label="Profit Factor"
                value={MOCK_METRICS.profitFactor.toFixed(2)}
                positive={MOCK_METRICS.profitFactor > 1}
              />
              <MetricCard
                label="Total Trades"
                value={MOCK_METRICS.totalTrades.toString()}
                positive={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  positive: boolean;
}

function MetricCard({ label, value, positive }: MetricCardProps) {
  return (
    <div className="bg-[#131722] border border-[#2a2e39] rounded-lg p-3">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="flex items-center gap-1">
        {positive ? (
          <TrendingUp className="w-4 h-4 text-green-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-lg font-semibold ${positive ? 'text-green-500' : 'text-red-500'}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
