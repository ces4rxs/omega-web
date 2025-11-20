'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '../state/ui';
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Dices,
  BarChart3,
  Table,
  LineChart,
} from 'lucide-react';
import {
  createChart,
  IChartApi,
  ColorType,
  Time,
  LineData,
  LineSeries,
  IPriceLine,
} from 'lightweight-charts';

type Tab = 'equity' | 'trades' | 'metrics';

export default function BottomDock() {
  const router = useRouter();
  const {
    bottomDockOpen,
    toggleBottomDock,
    backtestRunning,
    backtestProgress,
    backtestResults,
    selectedTradeId,
    selectTrade,
  } = useUIStore();

  const [activeTab, setActiveTab] = useState<Tab>('equity');

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
    <div className="h-96 bg-[#1e222d] border-t border-[#2a2e39] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2e39]">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-white">Backtest Results</h3>
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
          {backtestResults && (
            <div className="text-xs text-gray-400">
              {backtestResults.symbol} • {backtestResults.timeframe} • {backtestResults.metrics.totalTrades} trades
            </div>
          )}
        </div>
        <button onClick={toggleBottomDock}>
          <ChevronDown className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
        </button>
      </div>

      {backtestResults ? (
        <>
          {/* Tabs */}
          <div className="flex border-b border-[#2a2e39]">
            <button
              onClick={() => setActiveTab('equity')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'equity'
                  ? 'text-white border-b-2 border-[#2962ff] bg-[#131722]'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              <LineChart className="w-4 h-4" />
              Equity Curve
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'trades'
                  ? 'text-white border-b-2 border-[#2962ff] bg-[#131722]'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              <Table className="w-4 h-4" />
              Trade History
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'metrics'
                  ? 'text-white border-b-2 border-[#2962ff] bg-[#131722]'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              <BarChart3 className="w-4 h-4" />
              Metrics
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'equity' && <EquityCurveTab results={backtestResults} selectedTradeId={selectedTradeId} />}
            {activeTab === 'trades' && (
              <TradeHistoryTab
                results={backtestResults}
                selectedTradeId={selectedTradeId}
                onTradeSelect={selectTrade}
              />
            )}
            {activeTab === 'metrics' && <MetricsTab results={backtestResults} router={router} />}
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No backtest results yet</p>
            <p className="text-xs mt-1">Click "Backtest" to run a strategy</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Equity Curve Tab Component
interface EquityCurveTabProps {
  results: any;
  selectedTradeId: number | null;
}

function EquityCurveTab({ results, selectedTradeId }: EquityCurveTabProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<any>(null);
  const buyHoldLineSeriesRef = useRef<any>(null);
  const markerLineRef = useRef<IPriceLine | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: '#131722' } as any,
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.6)', visible: true },
        horzLines: { color: 'rgba(42, 46, 57, 0.6)', visible: true },
      },
      crosshair: {
        mode: 1 as any,
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
    });

    // Remove watermark - NOT SUPPORTED IN V5
    // chart.applyOptions({
    //   watermark: {
    //     visible: false,
    //   },
    // });

    // Strategy equity line (solid blue)
    const lineSeries = chart.addSeries(LineSeries, {
      color: '#2962ff',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      title: 'Strategy',
    });

    // Buy & Hold equity line (dashed orange/gray)
    const buyHoldLineSeries = chart.addSeries(LineSeries, {
      color: '#ff9800',
      lineWidth: 2,
      lineStyle: 2, // Dashed
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      title: 'Buy & Hold',
    });

    // Convert equity data
    const lineData: LineData<Time>[] = results.equityCurve.map((point: any) => ({
      time: Math.floor(point.time / 1000) as Time,
      value: point.value,
    }));

    const buyHoldData: LineData<Time>[] = results.buyAndHoldEquity.map((point: any) => ({
      time: Math.floor(point.time / 1000) as Time,
      value: point.value,
    }));

    lineSeries.setData(lineData);
    buyHoldLineSeries.setData(buyHoldData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    lineSeriesRef.current = lineSeries;
    buyHoldLineSeriesRef.current = buyHoldLineSeries;

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
  }, [results]);

  // Highlight selected trade on equity curve
  useEffect(() => {
    if (!lineSeriesRef.current) return;

    // Remove existing marker line
    if (markerLineRef.current) {
      lineSeriesRef.current.removePriceLine(markerLineRef.current);
      markerLineRef.current = null;
    }

    if (!selectedTradeId) return;

    // Find the equity point for this trade
    const equityPoint = results.equityCurve.find((p: any) => p.trade === selectedTradeId);
    if (!equityPoint) return;

    // Find the trade to get P&L info
    const trade = results.trades.find((t: any) => t.id === selectedTradeId);
    if (!trade) return;

    // Add marker as a horizontal price line at the equity value
    const markerColor = trade.pnl > 0 ? '#26a69a' : '#ef5350';
    const markerLine = lineSeriesRef.current.createPriceLine({
      price: equityPoint.value,
      color: markerColor,
      lineWidth: 2,
      lineStyle: 0,
      axisLabelVisible: true,
      title: `Trade #${trade.id} (${trade.pnl > 0 ? '+' : ''}${trade.pnlPercent.toFixed(2)}%)`,
    });
    markerLineRef.current = markerLine;
  }, [selectedTradeId, results]);

  const buyHoldFinalCapital = results.buyAndHoldEquity[results.buyAndHoldEquity.length - 1].value;
  const strategyReturn = results.metrics.totalReturn;
  const buyHoldReturn = results.metrics.buyAndHoldReturn;
  const alpha = results.metrics.alpha;

  return (
    <div className="w-full h-full p-4">
      <div className="text-sm mb-2 flex items-center gap-6">
        <div className="text-gray-400">
          Capital Evolution • Initial: ${results.initialCapital.toFixed(2)}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#2962ff] font-semibold">Strategy:</span>
          <span className={strategyReturn > 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}>
            ${results.finalCapital.toFixed(2)} ({strategyReturn > 0 ? '+' : ''}{strategyReturn.toFixed(2)}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#ff9800] font-semibold">Buy & Hold:</span>
          <span className={buyHoldReturn > 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}>
            ${buyHoldFinalCapital.toFixed(2)} ({buyHoldReturn > 0 ? '+' : ''}{buyHoldReturn.toFixed(2)}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">Alpha:</span>
          <span className={alpha > 0 ? 'text-[#26a69a] font-bold' : 'text-[#ef5350] font-bold'}>
            {alpha > 0 ? '+' : ''}{alpha.toFixed(2)}%
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}

// Trade History Tab Component
interface TradeHistoryTabProps {
  results: any;
  selectedTradeId: number | null;
  onTradeSelect: (tradeId: number | null) => void;
}

function TradeHistoryTab({ results, selectedTradeId, onTradeSelect }: TradeHistoryTabProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="w-full h-full overflow-auto">
      <table className="w-full text-xs">
        <thead className="bg-[#131722] sticky top-0 z-10">
          <tr className="border-b border-[#2a2e39]">
            <th className="px-3 py-2 text-left text-gray-400 font-medium">#</th>
            <th className="px-3 py-2 text-left text-gray-400 font-medium">Side</th>
            <th className="px-3 py-2 text-left text-gray-400 font-medium">Entry Date</th>
            <th className="px-3 py-2 text-right text-gray-400 font-medium">Entry Price</th>
            <th className="px-3 py-2 text-left text-gray-400 font-medium">Exit Date</th>
            <th className="px-3 py-2 text-right text-gray-400 font-medium">Exit Price</th>
            <th className="px-3 py-2 text-right text-gray-400 font-medium">P&L</th>
            <th className="px-3 py-2 text-right text-gray-400 font-medium">P&L %</th>
            <th className="px-3 py-2 text-right text-gray-400 font-medium">Duration</th>
          </tr>
        </thead>
        <tbody>
          {results.trades.map((trade: any) => (
            <tr
              key={trade.id}
              onClick={() => onTradeSelect(trade.id)}
              className={`border-b border-[#2a2e39] hover:bg-[#2a2e39] cursor-pointer transition-colors ${selectedTradeId === trade.id ? 'bg-[#2962ff]/20' : ''
                }`}
            >
              <td className="px-3 py-2 text-white">{trade.id}</td>
              <td className="px-3 py-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${trade.side === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}
                >
                  {trade.side.toUpperCase()}
                </span>
              </td>
              <td className="px-3 py-2 text-gray-400">{formatDate(trade.entryTime)}</td>
              <td className="px-3 py-2 text-right text-white">${trade.entryPrice.toFixed(2)}</td>
              <td className="px-3 py-2 text-gray-400">{formatDate(trade.exitTime)}</td>
              <td className="px-3 py-2 text-right text-white">${trade.exitPrice.toFixed(2)}</td>
              <td className={`px-3 py-2 text-right font-medium ${trade.pnl > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
              </td>
              <td className={`px-3 py-2 text-right font-medium ${trade.pnl > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trade.pnl > 0 ? '+' : ''}
                {trade.pnlPercent.toFixed(2)}%
              </td>
              <td className="px-3 py-2 text-right text-gray-400">{formatDuration(trade.duration)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Metrics Tab Component
interface MetricsTabProps {
  results: any;
  router: any;
}

function MetricsTab({ results, router }: MetricsTabProps) {
  const { metrics } = results;

  const handleMonteCarlo = () => {
    router.push('/dashboard/analysis/monte-carlo');
  };

  return (
    <div className="w-full h-full overflow-auto p-6">
      {/* Buy & Hold Comparison Section - Highlighted */}
      <div className="mb-6 bg-gradient-to-r from-[#2962ff]/10 to-[#ff9800]/10 border border-[#2962ff]/30 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">📊 Strategy vs Market Comparison</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#131722]/50 rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-1">Buy & Hold Return</div>
            <div className={`text-2xl font-bold ${metrics.buyAndHoldReturn > 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}`}>
              {metrics.buyAndHoldReturn > 0 ? '+' : ''}{metrics.buyAndHoldReturn.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Market baseline</div>
          </div>
          <div className="bg-[#131722]/50 rounded-lg p-4 border-2 border-[#2962ff]/50">
            <div className="text-xs text-gray-400 mb-1">Alpha (α)</div>
            <div className={`text-2xl font-bold ${metrics.alpha > 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}`}>
              {metrics.alpha > 0 ? '+' : ''}{metrics.alpha.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.alpha > 0 ? '✅ Beating the market' : '❌ Underperforming market'}
            </div>
          </div>
          <div className="bg-[#131722]/50 rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-1">Beta (β)</div>
            <div className={`text-2xl font-bold ${metrics.beta < 1.5 ? 'text-[#26a69a]' : 'text-[#ff9800]'}`}>
              {metrics.beta.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.beta < 1 ? 'Lower risk' : metrics.beta < 1.5 ? 'Moderate risk' : 'Higher risk'}
            </div>
          </div>
        </div>
      </div>

      {/* Standard Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard label="Total Return" value={`${metrics.totalReturn.toFixed(2)}%`} positive={metrics.totalReturn > 0} />
        <MetricCard label="Sharpe Ratio" value={metrics.sharpeRatio.toFixed(2)} positive={metrics.sharpeRatio > 1} />
        <MetricCard label="Max Drawdown" value={`${metrics.maxDrawdown.toFixed(2)}%`} positive={false} />
        <MetricCard label="Win Rate" value={`${metrics.winRate.toFixed(1)}%`} positive={metrics.winRate > 50} />
        <MetricCard label="Profit Factor" value={metrics.profitFactor.toFixed(2)} positive={metrics.profitFactor > 1} />
        <MetricCard label="Total Trades" value={metrics.totalTrades.toString()} positive={true} />
        <MetricCard label="Winning Trades" value={metrics.winningTrades.toString()} positive={true} />
        <MetricCard label="Losing Trades" value={metrics.losingTrades.toString()} positive={false} />
        <MetricCard label="Avg Win" value={`$${metrics.avgWin.toFixed(2)}`} positive={true} />
        <MetricCard label="Avg Loss" value={`$${metrics.avgLoss.toFixed(2)}`} positive={false} />
        <MetricCard label="Largest Win" value={`$${metrics.largestWin.toFixed(2)}`} positive={true} />
        <MetricCard label="Largest Loss" value={`$${metrics.largestLoss.toFixed(2)}`} positive={false} />
      </div>

      {/* Monte Carlo Button */}
      <div className="border-t border-[#2a2e39] pt-6">
        <div className="bg-gradient-to-r from-[#2962ff]/10 to-[#00c853]/10 border border-[#2962ff]/30 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Dices className="w-6 h-6 text-[#2962ff]" />
                <h4 className="text-lg font-semibold text-white">Monte Carlo Simulation</h4>
                <span className="text-xs text-[#2962ff] bg-[#2962ff]/10 px-2 py-0.5 rounded">PRO</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Was this result luck or skill? Run 1,000 simulations to see the probability distribution of outcomes
                and validate your strategy's robustness.
              </p>
              <button
                onClick={handleMonteCarlo}
                className="flex items-center gap-2 px-6 py-3 bg-[#2962ff] hover:bg-[#1e53e5] rounded-lg font-medium text-white transition-colors"
              >
                <Dices className="w-5 h-5" />
                Run Monte Carlo Simulation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  label: string;
  value: string;
  positive: boolean;
}

function MetricCard({ label, value, positive }: MetricCardProps) {
  return (
    <div className="bg-[#131722] border border-[#2a2e39] rounded-lg p-4">
      <div className="text-xs text-gray-400 mb-2">{label}</div>
      <div className="flex items-center gap-2">
        {positive ? (
          <TrendingUp className="w-4 h-4 text-green-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-lg font-semibold ${positive ? 'text-green-500' : 'text-red-500'}`}>{value}</span>
      </div>
    </div>
  );
}
