'use client';

import { useEffect, useState, useRef } from 'react';
import { IChartApi } from 'lightweight-charts';
import { useChartStore } from './store';
import { fetchCandleData } from './services/dataService';
import ChartCanvas from './components/TradingChart/ChartCanvas';
import ChartControls from './components/TradingChart/ChartControls';
import { TrendingUp, Loader2 } from 'lucide-react';

export default function TradingViewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const chartRef = useRef<IChartApi | null>(null);

  const {
    candleData,
    setCandleData,
    currentSymbol,
    currentTimeframe,
    setLoading,
    setError,
  } = useChartStore();

  // Fetch data when symbol or timeframe changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoading(true);
        setError(null);

        const data = await fetchCandleData(currentSymbol.symbol, currentTimeframe, 500);
        setCandleData(data);
      } catch (error) {
        console.error('Error loading chart data:', error);
        setError('Failed to load chart data');
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    };

    loadData();
  }, [currentSymbol, currentTimeframe, setCandleData, setLoading, setError]);

  // Chart control handlers
  const handleZoomIn = () => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      const range = timeScale.getVisibleLogicalRange();
      if (range) {
        const newRange = {
          from: range.from + (range.to - range.from) * 0.1,
          to: range.to - (range.to - range.from) * 0.1,
        };
        timeScale.setVisibleLogicalRange(newRange);
      }
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      const range = timeScale.getVisibleLogicalRange();
      if (range) {
        const newRange = {
          from: range.from - (range.to - range.from) * 0.1,
          to: range.to + (range.to - range.from) * 0.1,
        };
        timeScale.setVisibleLogicalRange(newRange);
      }
    }
  };

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  const handleScreenshot = () => {
    if (chartRef.current) {
      // Get chart canvas
      const canvas = (chartRef.current as any)
        .chartElement()
        ?.querySelector('canvas');

      if (canvas) {
        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `chart-${currentSymbol.symbol}-${currentTimeframe}-${Date.now()}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          }
        });
      }
    }
  };

  const handleChartReady = (chart: IChartApi) => {
    chartRef.current = chart;
  };

  return (
    <div className="flex flex-col h-screen bg-[#131722]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#1e222d] border-b border-[#2a2e39]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#2962ff]" />
            <h1 className="text-xl font-bold text-white">OMEGA Trading View</h1>
          </div>

          {/* Symbol Info */}
          <div className="flex items-center gap-3 ml-8">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-white">
                  {currentSymbol.symbol}
                </span>
                <span className="px-2 py-0.5 text-xs font-medium text-gray-400 bg-[#2a2e39] rounded">
                  {currentSymbol.exchange || 'Exchange'}
                </span>
              </div>
              <span className="text-xs text-gray-400">{currentSymbol.name}</span>
            </div>

            {candleData.length > 0 && (
              <div className="flex items-center gap-4 ml-6">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Close</span>
                  <span className="text-lg font-semibold text-white">
                    ${candleData[candleData.length - 1].close.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">24h Change</span>
                  <span
                    className={`text-sm font-medium ${
                      candleData[candleData.length - 1].close >
                      candleData[candleData.length - 2]?.close
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {candleData.length > 1
                      ? (
                          ((candleData[candleData.length - 1].close -
                            candleData[candleData.length - 2].close) /
                            candleData[candleData.length - 2].close) *
                          100
                        ).toFixed(2)
                      : '0.00'}
                    %
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {currentTimeframe.toUpperCase()} Chart
          </span>
          {isLoading && (
            <Loader2 className="w-4 h-4 text-[#2962ff] animate-spin" />
          )}
        </div>
      </header>

      {/* Controls */}
      <ChartControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onScreenshot={handleScreenshot}
      />

      {/* Main Content */}
      <div className="flex-1 relative">
        {isLoading && candleData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#2962ff] animate-spin" />
              <span className="text-sm text-gray-400">Loading chart data...</span>
            </div>
          </div>
        ) : (
          <ChartCanvas data={candleData} onChartReady={handleChartReady} />
        )}
      </div>

      {/* Footer Status Bar */}
      <footer className="flex items-center justify-between px-6 py-2 bg-[#1e222d] border-t border-[#2a2e39]">
        <div className="flex items-center gap-6 text-xs text-gray-400">
          <span>Candles: {candleData.length}</span>
          <span>Timeframe: {currentTimeframe}</span>
          <span>Symbol: {currentSymbol.symbol}</span>
        </div>
        <div className="text-xs text-gray-400">
          OMEGA v1.0 | Real-time Trading Analysis
        </div>
      </footer>
    </div>
  );
}
