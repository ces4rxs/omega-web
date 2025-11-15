'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  BarChart3,
  Loader2,
  AlertTriangle,
  Target,
  Gauge,
  Calendar,
} from 'lucide-react';
import { getImpact, type ImpactAnalysis } from '@/lib/api/news';

interface ImpactModalProps {
  newsId: number | null;
  onClose: () => void;
}

export default function ImpactModal({ newsId, onClose }: ImpactModalProps) {
  const [impact, setImpact] = useState<ImpactAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (newsId !== null) {
      loadImpact(newsId);
    }
  }, [newsId]);

  const loadImpact = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getImpact(id);
      setImpact(data);
    } catch (err) {
      console.error('Failed to load impact:', err);
      setError('No se pudo cargar el análisis de impacto. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (newsId === null) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-blue-500/20 rounded-xl shadow-2xl shadow-blue-500/10 max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Bloomberg Style */}
          <div className="relative bg-gradient-to-r from-blue-600/10 via-cyan-600/10 to-blue-600/10 border-b border-blue-500/20 px-8 py-5">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <Zap className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    OMEGA IMPACT ANALYSIS
                  </h2>
                  <p className="text-xs text-blue-300 font-medium mt-0.5">
                    INSTITUTIONAL GRADE • REAL-TIME PREDICTION ENGINE
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-white/10 rounded-lg transition-colors group"
              >
                <X className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)] custom-scrollbar">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
                <p className="text-gray-400 text-lg">Analyzing market impact...</p>
                <p className="text-gray-600 text-sm mt-2">Computing predictive models</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold mb-1">Error al cargar impacto</p>
                  <p className="text-red-300/80 text-sm">{error}</p>
                </div>
              </div>
            )}

            {!isLoading && !error && impact && (
              <div className="space-y-6">
                {/* Main Impact Score - Hero Section */}
                <ImpactScoreCard impact={impact} />

                {/* Price Movement Timeline */}
                <MovementTimeline impact={impact} />

                {/* Probabilities & Volatility Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ProbabilityCard impact={impact} />
                  <VolatilityCard impact={impact} />
                </div>

                {/* Pattern Recognition & Duration */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PatternCard impact={impact} />
                  <DurationCard impact={impact} />
                </div>

                {/* Historical Context */}
                <HistoricalCard impact={impact} />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// SUB-COMPONENTS - Bloomberg Terminal Style
// ============================================================================

function ImpactScoreCard({ impact }: { impact: ImpactAnalysis }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-red-500 to-orange-500';
    if (score >= 60) return 'from-orange-500 to-yellow-500';
    if (score >= 35) return 'from-yellow-500 to-green-500';
    return 'from-green-500 to-cyan-500';
  };

  const getLevelColor = (level: string) => {
    if (level === 'CRITICAL') return 'text-red-400 border-red-500/40 bg-red-500/10';
    if (level === 'HIGH') return 'text-orange-400 border-orange-500/40 bg-orange-500/10';
    if (level === 'MEDIUM') return 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10';
    return 'text-green-400 border-green-500/40 bg-green-500/10';
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 rounded-xl p-8 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"></div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">IMPACT SCORE</h3>
        </div>
        <div className={`px-4 py-2 border rounded-lg font-bold text-sm ${getLevelColor(impact.impactLevel)}`}>
          {impact.impactLevel}
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="relative">
          <div className="text-7xl font-bold bg-gradient-to-br from-white to-blue-200 bg-clip-text text-transparent">
            {impact.impactScore}
          </div>
          <div className="text-2xl text-gray-500 font-medium">/100</div>
        </div>

        <div className="flex-1">
          <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${impact.impactScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${getScoreColor(impact.impactScore)} rounded-full`}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>LOW</span>
            <span>MEDIUM</span>
            <span>HIGH</span>
            <span>CRITICAL</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-sm text-gray-400">
          Calculated from: <span className="text-white font-medium">1h Movement ({impact.move1h.toFixed(2)}%)</span> +
          <span className="text-white font-medium"> Volatility ({impact.volatility1h.toFixed(2)}%)</span>
        </p>
      </div>
    </div>
  );
}

function MovementTimeline({ impact }: { impact: ImpactAnalysis }) {
  const movements = [
    { label: '1H', value: impact.move1h, vol: impact.volatility1h },
    { label: '4H', value: impact.move4h, vol: impact.volatility4h },
    { label: '24H', value: impact.move24h, vol: impact.volatility24h },
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white">PRICE MOVEMENT FORECAST</h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {movements.map((item, idx) => {
          const isPositive = item.value > 0;
          const color = isPositive ? 'green' : item.value < 0 ? 'red' : 'gray';

          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-${color}-500/5 border border-${color}-500/20 rounded-lg p-5`}
            >
              <div className="text-xs text-gray-400 mb-2 font-semibold">{item.label}</div>
              <div className={`text-3xl font-bold text-${color}-400 mb-1 flex items-center gap-2`}>
                {isPositive ? <TrendingUp className="w-6 h-6" /> : item.value < 0 ? <TrendingDown className="w-6 h-6" /> : null}
                {isPositive ? '+' : ''}{item.value.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500">
                Vol: <span className="text-white font-medium">{item.vol.toFixed(2)}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ProbabilityCard({ impact }: { impact: ImpactAnalysis }) {
  return (
    <div className="bg-gradient-to-br from-green-500/5 to-red-500/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">DIRECTIONAL PROBABILITIES</h3>
      </div>

      <div className="space-y-5">
        {/* UP Probability */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-300 font-medium">Probability UP</span>
            </div>
            <span className="text-3xl font-bold text-green-400">
              {impact.probabilityUp}%
            </span>
          </div>
          <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-green-500/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${impact.probabilityUp}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
            />
          </div>
        </div>

        {/* DOWN Probability */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <span className="text-sm text-gray-300 font-medium">Probability DOWN</span>
            </div>
            <span className="text-3xl font-bold text-red-400">
              {impact.probabilityDown}%
            </span>
          </div>
          <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-red-500/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${impact.probabilityDown}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Trend Direction</span>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
            impact.trendDirection === 'UP' ? 'bg-green-500/20 text-green-400' :
            impact.trendDirection === 'DOWN' ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {impact.trendDirection === 'UP' && <TrendingUp className="w-4 h-4" />}
            {impact.trendDirection === 'DOWN' && <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-bold">{impact.trendDirection}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VolatilityCard({ impact }: { impact: ImpactAnalysis }) {
  const avgVolatility = (impact.volatility1h + impact.volatility4h + impact.volatility24h) / 3;

  return (
    <div className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Gauge className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-bold text-white">VOLATILITY METRICS</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20">
          <div className="text-xs text-gray-400 mb-2">Average Volatility</div>
          <div className="text-4xl font-bold text-yellow-400">
            {avgVolatility.toFixed(2)}%
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-black/20 rounded-lg p-3 border border-white/10">
            <div className="text-xs text-gray-500 mb-1">1H</div>
            <div className="text-lg font-bold text-white">{impact.volatility1h.toFixed(1)}%</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 border border-white/10">
            <div className="text-xs text-gray-500 mb-1">4H</div>
            <div className="text-lg font-bold text-white">{impact.volatility4h.toFixed(1)}%</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 border border-white/10">
            <div className="text-xs text-gray-500 mb-1">24H</div>
            <div className="text-lg font-bold text-white">{impact.volatility24h.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PatternCard({ impact }: { impact: ImpactAnalysis }) {
  return (
    <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">PATTERN RECOGNITION</h3>
      </div>

      <div className="bg-black/30 rounded-lg p-5 border border-purple-500/20">
        <div className="text-sm text-gray-400 mb-2">Detected Pattern</div>
        <div className="text-2xl font-bold text-purple-300 uppercase tracking-wide">
          {impact.pattern}
        </div>
      </div>
    </div>
  );
}

function DurationCard({ impact }: { impact: ImpactAnalysis }) {
  return (
    <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white">EVENT DURATION</h3>
      </div>

      <div className="bg-black/30 rounded-lg p-5 border border-cyan-500/20">
        <div className="text-sm text-gray-400 mb-2">Estimated Impact Duration</div>
        <div className="text-4xl font-bold text-cyan-400">
          {impact.eventDuration}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {impact.durationMinutes} minutes total
        </div>
      </div>
    </div>
  );
}

function HistoricalCard({ impact }: { impact: ImpactAnalysis }) {
  return (
    <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold text-white">HISTORICAL CONTEXT</h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-black/30 rounded-lg p-4 border border-indigo-500/20">
          <div className="text-xs text-gray-400 mb-2">Avg Movement</div>
          <div className="text-2xl font-bold text-indigo-300">
            {impact.move1h >= 0 ? '+' : ''}{impact.move1h.toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">From this event</div>
        </div>

        <div className="bg-black/30 rounded-lg p-4 border border-indigo-500/20">
          <div className="text-xs text-gray-400 mb-2">Avg Duration</div>
          <div className="text-2xl font-bold text-indigo-300">
            {impact.eventDuration}
          </div>
          <div className="text-xs text-gray-500 mt-1">Time window</div>
        </div>

        <div className="bg-black/30 rounded-lg p-4 border border-indigo-500/20">
          <div className="text-xs text-gray-400 mb-2">Sample Size</div>
          <div className="text-2xl font-bold text-indigo-300">1</div>
          <div className="text-xs text-gray-500 mt-1">Individual event</div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
        <p className="text-sm text-indigo-200 leading-relaxed">
          <span className="font-bold">AI Analysis:</span> This event shows a {' '}
          <span className="text-white font-semibold">{Math.abs(impact.move1h).toFixed(2)}%</span> movement
          with <span className="text-white font-semibold">{impact.volatility1h.toFixed(2)}%</span> volatility.
          Pattern detected: <span className="text-white font-semibold uppercase">{impact.pattern}</span>.
          Expected duration: <span className="text-white font-semibold">{impact.eventDuration}</span>.
        </p>
      </div>
    </div>
  );
}
