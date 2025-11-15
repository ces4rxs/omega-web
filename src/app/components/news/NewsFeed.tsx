'use client';

import { motion } from 'framer-motion';
import { Clock, Brain, Star, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import {
  type NewsItem,
  formatTimeAgo,
  getSentimentColor,
  getSentimentIcon,
  getSentimentLabel,
  impactToStars,
  getImpactColor,
} from '@/lib/api/news';

interface NewsFeedProps {
  news: NewsItem[];
  onViewImpact: (newsId: number) => void;
  isLoading?: boolean;
}

export default function NewsFeed({ news, onViewImpact, isLoading = false }: NewsFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-lg p-5 animate-pulse"
          >
            <div className="h-6 bg-white/10 rounded mb-3 w-3/4"></div>
            <div className="h-4 bg-white/10 rounded mb-2 w-full"></div>
            <div className="h-4 bg-white/10 rounded mb-4 w-5/6"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-white/10 rounded w-16"></div>
              <div className="h-6 bg-white/10 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
        <Brain className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">No hay noticias disponibles</p>
        <p className="text-gray-500 text-sm mt-2">Ajusta los filtros para ver más resultados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {news.map((item, index) => {
        const stars = impactToStars(item.impactScore);
        const impactColor = getImpactColor(item.impactScore);
        const isHighImpact = item.impactScore >= 0.7;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white/5 border rounded-lg p-5 hover:border-blue-500/50 transition-all group relative ${
              isHighImpact
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-white/10'
            }`}
          >
            {/* High Impact Badge */}
            {isHighImpact && (
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/40 rounded text-xs text-red-400 font-bold">
                  <Zap className="w-3 h-3" />
                  ALTO IMPACTO
                </div>
              </div>
            )}

            {/* Header: Symbol + Title */}
            <div className="flex items-start gap-3 mb-3">
              <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded font-bold text-blue-400 text-sm">
                {item.symbol}
              </div>
              <h3 className="font-bold text-white text-base flex-1 group-hover:text-blue-400 transition-colors leading-tight">
                {item.title}
              </h3>
            </div>

            {/* AI Summary */}
            <div className="flex items-start gap-2 mb-4 pl-1">
              <Brain className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-300 leading-relaxed">{item.summary}</p>
            </div>

            {/* Metrics Row */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              {/* Sentiment */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Sentimiento:</span>
                <span className={`text-xs px-3 py-1 rounded border font-medium ${getSentimentColor(item.sentiment)}`}>
                  {getSentimentIcon(item.sentiment)} {getSentimentLabel(item.sentiment)}
                </span>
              </div>

              {/* Impact Score */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Impacto:</span>
                <div className="flex items-center gap-1">
                  <span className={`text-sm font-bold ${impactColor}`}>
                    {(item.impactScore * 100).toFixed(0)}/100
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < stars
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Confidence */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Confianza:</span>
                <span className="text-sm font-bold text-cyan-400">
                  {(item.confidence * 100).toFixed(0)}%
                </span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">{formatTimeAgo(item.createdAt)}</span>
              </div>
            </div>

            {/* Footer: Source + Action */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {item.source ? `Fuente: ${item.source}` : 'OMEGA News'}
              </span>
              <button
                onClick={() => onViewImpact(item.id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 group/btn"
              >
                <Zap className="w-4 h-4 group-hover/btn:text-yellow-300 transition-colors" />
                Ver Impacto AI
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
