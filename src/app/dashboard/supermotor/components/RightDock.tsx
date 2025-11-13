'use client';

import { useState } from 'react';
import { useUIStore } from '../state/ui';
import { ChevronLeft, ChevronRight, TrendingUp, Activity, BarChart3, Search, Settings, Layers } from 'lucide-react';

type Tab = 'indicators' | 'watchlist' | 'alerts';

interface IndicatorDefinition {
  id: string;
  name: string;
  category: 'trend' | 'momentum' | 'volatility' | 'volume';
  defaultParams: Record<string, number>;
}

const INDICATORS: IndicatorDefinition[] = [
  // TREND
  { id: 'sma', name: 'SMA', category: 'trend', defaultParams: { period: 20 } },
  { id: 'ema', name: 'EMA', category: 'trend', defaultParams: { period: 12 } },
  { id: 'macd', name: 'MACD', category: 'trend', defaultParams: { fast: 12, slow: 26, signal: 9 } },
  { id: 'adx', name: 'ADX', category: 'trend', defaultParams: { period: 14 } },
  { id: 'parabolicSar', name: 'Parabolic SAR', category: 'trend', defaultParams: { acceleration: 0.02, maximum: 0.2 } },
  { id: 'ichimoku', name: 'Ichimoku Cloud', category: 'trend', defaultParams: { tenkan: 9, kijun: 26, senkou: 52 } },

  // MOMENTUM
  { id: 'rsi', name: 'RSI', category: 'momentum', defaultParams: { period: 14 } },
  { id: 'stochastic', name: 'Stochastic', category: 'momentum', defaultParams: { k: 14, d: 3, smooth: 3 } },
  { id: 'cci', name: 'CCI', category: 'momentum', defaultParams: { period: 20 } },
  { id: 'williamsR', name: 'Williams %R', category: 'momentum', defaultParams: { period: 14 } },
  { id: 'roc', name: 'ROC', category: 'momentum', defaultParams: { period: 12 } },

  // VOLATILITY
  { id: 'bollingerBands', name: 'Bollinger Bands', category: 'volatility', defaultParams: { period: 20, stdDev: 2 } },
  { id: 'atr', name: 'ATR', category: 'volatility', defaultParams: { period: 14 } },
  { id: 'keltner', name: 'Keltner Channels', category: 'volatility', defaultParams: { period: 20, multiplier: 2 } },
  { id: 'donchian', name: 'Donchian Channels', category: 'volatility', defaultParams: { period: 20 } },

  // VOLUME
  { id: 'volume', name: 'Volume', category: 'volume', defaultParams: {} },
  { id: 'obv', name: 'OBV', category: 'volume', defaultParams: {} },
  { id: 'vwap', name: 'VWAP', category: 'volume', defaultParams: {} },
  { id: 'cmf', name: 'Chaikin Money Flow', category: 'volume', defaultParams: { period: 20 } },
];

const CATEGORIES = {
  trend: { label: 'Trend', icon: TrendingUp, color: '#2962ff' },
  momentum: { label: 'Momentum', icon: Activity, color: '#ff6d00' },
  volatility: { label: 'Volatility', icon: BarChart3, color: '#00c853' },
  volume: { label: 'Volume', icon: BarChart3, color: '#ab47bc' },
};

export default function RightDock() {
  const { rightDockOpen, toggleRightDock, volumeProfile, updateVolumeProfile } = useUIStore();
  const [activeTab, setActiveTab] = useState<Tab>('indicators');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndicators, setActiveIndicators] = useState<Set<string>>(new Set(['volume']));
  const [settingsOpen, setSettingsOpen] = useState<string | null>(null);
  const [vpSettingsOpen, setVpSettingsOpen] = useState(false);

  if (!rightDockOpen) {
    return (
      <button
        onClick={toggleRightDock}
        className="w-8 bg-[#1e222d] border-l border-[#2a2e39] flex items-center justify-center hover:bg-[#2a2e39] transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-gray-400" />
      </button>
    );
  }

  const toggleIndicator = (id: string) => {
    const newActive = new Set(activeIndicators);
    if (newActive.has(id)) {
      newActive.delete(id);
    } else {
      newActive.add(id);
    }
    setActiveIndicators(newActive);
    // TODO: Apply to chart
  };

  const filteredIndicators = INDICATORS.filter((ind) =>
    ind.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedIndicators = filteredIndicators.reduce((acc, ind) => {
    if (!acc[ind.category]) acc[ind.category] = [];
    acc[ind.category].push(ind);
    return acc;
  }, {} as Record<string, IndicatorDefinition[]>);

  return (
    <div className="w-80 bg-[#1e222d] border-l border-[#2a2e39] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2e39]">
        <h3 className="text-sm font-semibold text-white">Panel</h3>
        <button onClick={toggleRightDock}>
          <ChevronRight className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a2e39]">
        <button
          onClick={() => setActiveTab('indicators')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'indicators'
              ? 'text-white border-b-2 border-[#2962ff]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Indicators
        </button>
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'watchlist'
              ? 'text-white border-b-2 border-[#2962ff]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Watchlist
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'alerts'
              ? 'text-white border-b-2 border-[#2962ff]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Alerts
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'indicators' && (
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search indicators..."
                className="w-full pl-10 pr-3 py-2 bg-[#131722] border border-[#2a2e39] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#2962ff]"
              />
            </div>

            {/* Active Count */}
            <div className="text-xs text-gray-400">
              {activeIndicators.size} indicator{activeIndicators.size !== 1 ? 's' : ''} active
            </div>

            {/* Volume Profile - Special Section */}
            <div className="border border-[#2962ff]/30 rounded-lg p-3 bg-[#131722]/50">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-5 h-5 text-[#2962ff]" />
                <h4 className="text-sm font-semibold text-white">Volume Profile</h4>
                <span className="ml-auto text-xs text-[#2962ff] bg-[#2962ff]/10 px-2 py-0.5 rounded">PRO</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={volumeProfile.enabled}
                    onChange={(e) => updateVolumeProfile({ enabled: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 text-[#2962ff] focus:ring-[#2962ff]"
                  />
                  <span className="text-sm text-white">Enable Volume Profile</span>
                </label>
                {volumeProfile.enabled && (
                  <button
                    onClick={() => setVpSettingsOpen(!vpSettingsOpen)}
                    className="p-1 hover:bg-[#2a2e39] rounded transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Volume Profile Settings */}
              {volumeProfile.enabled && vpSettingsOpen && (
                <div className="space-y-3 pt-3 border-t border-[#2a2e39]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-400">Period (bars)</label>
                    <input
                      type="number"
                      value={volumeProfile.period}
                      onChange={(e) => updateVolumeProfile({ period: parseInt(e.target.value) || 100 })}
                      className="w-20 px-2 py-1 bg-[#2a2e39] border border-[#363a45] rounded text-sm text-white focus:outline-none focus:border-[#2962ff]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-400">Value Area %</label>
                    <input
                      type="number"
                      value={volumeProfile.valueAreaPercentage}
                      onChange={(e) => updateVolumeProfile({ valueAreaPercentage: parseInt(e.target.value) || 70 })}
                      min="50"
                      max="90"
                      className="w-20 px-2 py-1 bg-[#2a2e39] border border-[#363a45] rounded text-sm text-white focus:outline-none focus:border-[#2962ff]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-400">Opacity</label>
                    <input
                      type="range"
                      value={volumeProfile.opacity * 100}
                      onChange={(e) => updateVolumeProfile({ opacity: parseInt(e.target.value) / 100 })}
                      min="10"
                      max="100"
                      className="w-32"
                    />
                    <span className="text-xs text-white w-8">{Math.round(volumeProfile.opacity * 100)}%</span>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={volumeProfile.showPOC}
                        onChange={(e) => updateVolumeProfile({ showPOC: e.target.checked })}
                        className="w-3 h-3 rounded border-gray-600 text-[#ff6d00] focus:ring-[#ff6d00]"
                      />
                      <span className="text-xs text-gray-300">Show POC (Point of Control)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={volumeProfile.showValueArea}
                        onChange={(e) => updateVolumeProfile({ showValueArea: e.target.checked })}
                        className="w-3 h-3 rounded border-gray-600 text-[#00c853] focus:ring-[#00c853]"
                      />
                      <span className="text-xs text-gray-300">Show VAH/VAL (Value Area)</span>
                    </label>
                  </div>

                  <div className="pt-2 border-t border-[#2a2e39]">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: volumeProfile.pocColor }}></div>
                        <span>POC - Highest volume price</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: volumeProfile.valueAreaColor }}></div>
                        <span>VAH/VAL - {volumeProfile.valueAreaPercentage}% volume range</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Indicators by Category */}
            {Object.entries(groupedIndicators).map(([category, indicators]) => {
              const cat = CATEGORIES[category as keyof typeof CATEGORIES];
              const Icon = cat.icon;

              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: cat.color }} />
                    <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                      {cat.label}
                    </h4>
                  </div>
                  <div className="space-y-1">
                    {indicators.map((ind) => {
                      const isActive = activeIndicators.has(ind.id);
                      const isSettingsOpen = settingsOpen === ind.id;

                      return (
                        <div key={ind.id}>
                          <div className="flex items-center justify-between p-2 hover:bg-[#2a2e39] rounded transition-colors">
                            <label className="flex items-center gap-2 flex-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={() => toggleIndicator(ind.id)}
                                className="w-4 h-4 rounded border-gray-600 text-[#2962ff] focus:ring-[#2962ff]"
                              />
                              <span className="text-sm text-white">{ind.name}</span>
                            </label>
                            {isActive && (
                              <button
                                onClick={() => setSettingsOpen(isSettingsOpen ? null : ind.id)}
                                className="p-1 hover:bg-[#131722] rounded transition-colors"
                              >
                                <Settings className="w-4 h-4 text-gray-400" />
                              </button>
                            )}
                          </div>

                          {/* Settings Panel */}
                          {isActive && isSettingsOpen && (
                            <div className="ml-6 p-3 bg-[#131722] rounded-lg space-y-2 mb-2">
                              {Object.entries(ind.defaultParams).map(([param, value]) => (
                                <div key={param} className="flex items-center justify-between">
                                  <label className="text-xs text-gray-400 capitalize">{param}</label>
                                  <input
                                    type="number"
                                    defaultValue={value}
                                    className="w-20 px-2 py-1 bg-[#2a2e39] border border-[#363a45] rounded text-sm text-white focus:outline-none focus:border-[#2962ff]"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="p-4">
            <div className="text-center text-gray-400 py-8">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Watchlist coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="p-4">
            <div className="text-center text-gray-400 py-8">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Alerts coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
