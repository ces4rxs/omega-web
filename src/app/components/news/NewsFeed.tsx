'use client';

import { Brain, Loader2 } from 'lucide-react';
import { type NewsItem } from '@/lib/api/news';
import NewsCard from './NewsCard';

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
            className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse"
          >
            {/* Top border */}
            <div className="h-1 bg-white/10 rounded mb-4 w-full"></div>
            {/* Header */}
            <div className="flex gap-3 mb-4">
              <div className="h-8 bg-white/10 rounded w-20"></div>
              <div className="h-8 bg-white/10 rounded w-24"></div>
            </div>
            {/* Title */}
            <div className="h-6 bg-white/10 rounded mb-3 w-3/4"></div>
            {/* Summary */}
            <div className="h-4 bg-white/10 rounded mb-2 w-full"></div>
            <div className="h-4 bg-white/10 rounded mb-5 w-5/6"></div>
            {/* Metrics grid */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-16 bg-white/10 rounded"></div>
              ))}
            </div>
            {/* Footer */}
            <div className="h-10 bg-white/10 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-16 text-center">
        <Brain className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400 text-xl font-semibold mb-2">No hay noticias disponibles</p>
        <p className="text-gray-500 text-sm">Ajusta los filtros o intenta actualizar el feed</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {news.map((item, index) => (
        <NewsCard
          key={item.id}
          item={item}
          onViewImpact={onViewImpact}
          index={index}
        />
      ))}
    </div>
  );
}
