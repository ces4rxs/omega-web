'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Gauge,
  Target,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  type NewsItem,
  type ImpactAnalysis,
  formatTimeAgo,
  getSentimentColor,
  getSentimentIcon,
  getSentimentLabel,
  getImpact,
} from '@/lib/api/news';
import { generateSmartAlerts, getAlertSeverityColor, type SmartAlert } from '@/lib/utils/smartAlerts';

interface NewsCardProps {
  item: NewsItem;
  onViewImpact: (newsId: number) => void;
  index: number;
}

export default function NewsCard({ item, onViewImpact, index }: NewsCardProps) {
  const [impact, setImpact] = useState<ImpactAnalysis | null>(null);
  const [isLoadingImpact, setIsLoadingImpact] = useState(false);
  const [smartAlerts, setSmartAlerts] = useState<SmartAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  // Load impact data for this news item
  useEffect(() => {
    loadImpactData();
  }, [item.id]);

  const loadImpactData = async () => {
    setIsLoadingImpact(true);
    try {
      const impactData = await getImpact(item.id);
      setImpact(impactData);

      // Generate smart alerts based on impact
      const alerts = generateSmartAlerts(impactData);
      setSmartAlerts(alerts);
    } catch (error) {
      console.error('Failed to load impact for news', item.id, error);
    } finally {
      setIsLoadingImpact(false);
    }
  };

  // Determine card border color based on impact level
  const getBorderColor = () => {
    if (!impact) return 'border-white/10';

    switch (impact.impactLevel) {
      case 'CRITICAL':
        return 'border-red-500/40';
      case 'HIGH':
        return 'border-orange-500/40';
      case 'MEDIUM':
        return 'border-yellow-500/40';
      default:
        return 'border-blue-500/20';
    }
  };

  // Get top border gradient based on impact level
  const getTopBorderGradient = () => {
    if (!impact) return 'from-blue-500 to-cyan-500';

    switch (impact.impactLevel) {
      case 'CRITICAL':
        return 'from-red-500 via-orange-500 to-red-500';
      case 'HIGH':
        return 'from-orange-500 via-yellow-500 to-orange-500';
      case 'MEDIUM':
        return 'from-yellow-500 via-green-500 to-yellow-500';
      default:
        return 'from-green-500 via-cyan-500 to-green-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative bg-gradient-to-br from-white/5 to-white/[0.02] border ${getBorderColor()} rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 group`}
    >
      {/* Top gradient border */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getTopBorderGradient()}`} />

      {/* Main content */}
      <div className="p-6 pt-7">
        {/* Header: Symbol + Impact Level + Sentiment */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Symbol Badge */}
            <div className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/40 rounded-lg font-bold text-blue-400 text-sm tracking-wide">
              {item.symbol}
            </div>

            {/* Impact Level Badge */}
            {impact && (
              <div className={`px-3 py-1.5 border rounded-lg font-bold text-xs tracking-wider ${
                impact.impactLevel === 'CRITICAL' ? 'bg-red-500/20 border-red-500/40 text-red-400' :
                impact.impactLevel === 'HIGH' ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' :
                impact.impactLevel === 'MEDIUM' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' :
                'bg-green-500/20 border-green-500/40 text-green-400'
              }`}>
                {impact.impactLevel}
              </div>
            )}
          </div>

          {/* Sentiment Badge */}
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${getSentimentColor(item.sentiment)}`}>
            {getSentimentIcon(item.sentiment)} {getSentimentLabel(item.sentiment)}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-white text-lg mb-3 leading-tight group-hover:text-blue-400 transition-colors">
          {item.title}
        </h3>

        {/* AI Summary */}
        <div className="flex items-start gap-2 mb-5">
          <Brain className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-300 leading-relaxed">{item.summary}</p>
        </div>

        {/* Impact Metrics Grid */}
        {impact && !isLoadingImpact && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {/* Impact Score */}
            <div className="bg-black/30 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <Target className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">Impact</span>
              </div>
              <div className="text-xl font-bold text-white">{impact.impactScore}<span className="text-sm text-gray-500">/100</span></div>
            </div>

            {/* Probability */}
            <div className="bg-black/30 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                {impact.trendDirection === 'UP' ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                <span className="text-xs text-gray-500">Prob {impact.trendDirection}</span>
              </div>
              <div className={`text-xl font-bold ${impact.trendDirection === 'UP' ? 'text-green-400' : 'text-red-400'}`}>
                {impact.trendDirection === 'UP' ? impact.probabilityUp : impact.probabilityDown}%
              </div>
            </div>

            {/* Volatility */}
            <div className="bg-black/30 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <Gauge className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">Volatility</span>
              </div>
              <div className="text-xl font-bold text-yellow-400">{Number(impact.volatility1h ?? 0).toFixed(1)}%</div>
            </div>

            {/* Duration */}
            <div className="bg-black/30 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">Duration</span>
              </div>
              <div className="text-xl font-bold text-cyan-400">{impact.eventDuration}</div>
            </div>
          </div>
        )}

        {/* Loading Impact Skeleton */}
        {isLoadingImpact && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-black/30 border border-white/10 rounded-lg p-3 h-16"></div>
            ))}
          </div>
        )}

        {/* Price Movement Timeline */}
        {impact && !isLoadingImpact && (
          <div className="mb-5 bg-black/20 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Price Movement Forecast</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '1H', value: impact.move1h, vol: impact.volatility1h },
                { label: '4H', value: impact.move4h, vol: impact.volatility4h },
                { label: '24H', value: impact.move24h, vol: impact.volatility24h },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                  <div className={`text-lg font-bold ${Number(item.value ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center justify-center gap-1`}>
                    {Number(item.value ?? 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Number(item.value ?? 0) >= 0 ? '+' : ''}{Number(item.value ?? 0).toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-600">Vol: {Number(item.vol ?? 0).toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Smart Alerts Section */}
        {smartAlerts.length > 0 && (
          <div className="mb-5">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="w-full flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-300">Smart Alerts ({smartAlerts.length})</span>
              </div>
              {showAlerts ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4 text-blue-400" />}
            </button>

            {showAlerts && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 space-y-2"
              >
                {smartAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-3 border rounded-lg ${getAlertSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{alert.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1">{alert.message}</div>
                        <div className="text-xs opacity-90">{alert.action}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Footer: Confidence + Time + Action */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Confianza:</span>
              <span className="text-cyan-400 font-bold">{(Number(item.confidence ?? 0) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-gray-500">{formatTimeAgo(item.createdAt)}</span>
            </div>
            {item.source && (
              <div className="text-gray-600">
                Fuente: {item.source}
              </div>
            )}
          </div>

          <button
            onClick={() => onViewImpact(item.id)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 group/btn shadow-lg shadow-blue-500/20"
          >
            <Zap className="w-4 h-4 group-hover/btn:text-yellow-300 transition-colors" />
            Ver Análisis Completo
          </button>
        </div>
      </div>
    </motion.div>
  );
}
