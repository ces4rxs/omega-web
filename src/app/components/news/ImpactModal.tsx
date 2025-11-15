'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  Brain,
  Activity,
  BarChart3,
  Loader2,
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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gradient-to-br from-zinc-950 to-black border border-blue-500/30 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-blue-500/30 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">IMPACTO AI</h2>
                <p className="text-xs text-blue-300">Análisis Predictivo Institucional</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                <p className="ml-3 text-gray-400">Analizando impacto...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {!isLoading && !error && impact && (
              <div className="space-y-6">
                {/* Impact Timeline */}
                <div className="grid grid-cols-4 gap-4">
                  <ImpactCard
                    label="Inmediato"
                    value={impact.immediateImpact}
                    icon={<Zap className="w-5 h-5" />}
                    highlight={true}
                  />
                  <ImpactCard label="1h" value={impact.impact1h} />
                  <ImpactCard label="4h" value={impact.impact4h} />
                  <ImpactCard label="24h" value={impact.impact24h} />
                </div>

                {/* Probabilities */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    PROBABILIDADES
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">Alza (UP)</span>
                        </div>
                        <span className="text-2xl font-bold text-green-400">
                          {impact.probabilityUp}%
                        </span>
                      </div>
                      <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                          style={{ width: `${impact.probabilityUp}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-gray-300">Baja (DOWN)</span>
                        </div>
                        <span className="text-2xl font-bold text-red-400">
                          {impact.probabilityDown}%
                        </span>
                      </div>
                      <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                          style={{ width: `${impact.probabilityDown}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Volatility & Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-yellow-400" />
                      <h3 className="text-sm font-bold text-gray-400">
                        VOLATILIDAD ESPERADA
                      </h3>
                    </div>
                    <p className="text-3xl font-bold text-yellow-400">
                      {impact.expectedVolatility}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Movimiento predicho en precio
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-sm font-bold text-gray-400">
                        DURACIÓN DEL EVENTO
                      </h3>
                    </div>
                    <p className="text-3xl font-bold text-cyan-400">
                      {impact.eventDuration}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Tiempo estimado de efecto
                    </p>
                  </div>
                </div>

                {/* Historical Reactions */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-5">
                  <h3 className="text-sm font-bold text-purple-300 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    REACCIONES HISTÓRICAS
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Movimiento Promedio</p>
                      <p className="text-2xl font-bold text-purple-300">
                        {impact.historicalReactions.avgMove}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Duración Promedio</p>
                      <p className="text-2xl font-bold text-purple-300">
                        {impact.historicalReactions.avgDuration}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Tamaño de Muestra</p>
                      <p className="text-2xl font-bold text-purple-300">
                        {impact.historicalReactions.sampleSize}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-bold text-blue-300">
                      RESUMEN INTELIGENCIA ARTIFICIAL
                    </h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{impact.summary}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper Component: Impact Card
interface ImpactCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  highlight?: boolean;
}

function ImpactCard({ label, value, icon, highlight = false }: ImpactCardProps) {
  const getColor = (val: number) => {
    if (val >= 70) return 'text-red-400 border-red-500/30 bg-red-500/10';
    if (val >= 40) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    return 'text-green-400 border-green-500/30 bg-green-500/10';
  };

  const colorClass = getColor(value);

  return (
    <div
      className={`border rounded-lg p-4 ${
        highlight
          ? 'bg-blue-500/10 border-blue-500/30'
          : 'bg-white/5 border-white/10'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon && <div className="text-blue-400">{icon}</div>}
        <p className="text-xs text-gray-400 font-semibold uppercase">{label}</p>
      </div>
      <p className={`text-3xl font-bold ${highlight ? 'text-blue-400' : colorClass}`}>
        {value}
        <span className="text-lg">/100</span>
      </p>
    </div>
  );
}
