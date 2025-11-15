'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  RefreshCw,
  Search,
  Activity,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import NewsFeed from '@/app/components/news/NewsFeed';
import ImpactModal from '@/app/components/news/ImpactModal';
import SentimentDashboard from '@/app/components/news/SentimentDashboard';
import {
  getAllNews,
  filterBySymbol,
  filterBySearch,
  getUniqueSymbols,
  type NewsItem,
} from '@/lib/api/news';

export default function NewsPage() {
  // State
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null);

  // Available symbols (derived from news)
  const availableSymbols = getUniqueSymbols(allNews);

  // Load news on mount
  useEffect(() => {
    loadNews();
  }, []);

  // Filter news when filters change
  useEffect(() => {
    let filtered = allNews;

    // Apply symbol filter
    filtered = filterBySymbol(filtered, selectedSymbol);

    // Apply search filter
    filtered = filterBySearch(filtered, searchQuery);

    setFilteredNews(filtered);
  }, [selectedSymbol, searchQuery, allNews]);

  const loadNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const news = await getAllNews();
      setAllNews(news);
      setFilteredNews(news);
    } catch (err) {
      console.error('Failed to load news:', err);
      setError('No se pudieron cargar las noticias. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewImpact = (newsId: number) => {
    setSelectedNewsId(newsId);
  };

  const handleCloseModal = () => {
    setSelectedNewsId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Brain className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                OMEGA <span className="text-blue-400">NEWS</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full font-semibold">
                  AI-POWERED
                </span>
                <span className="text-xs px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 rounded-full font-semibold border border-purple-500/30">
                  ÉLITE
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={loadNews}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
        <p className="text-gray-400 text-sm">
          Noticias financieras analizadas por IA · Impacto predictivo · Sentimiento institucional
        </p>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título, resumen o símbolo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 focus:bg-white/10 text-white placeholder-gray-500 transition-all"
            />
          </div>
        </div>

        {/* Symbol Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
          <button
            onClick={() => setSelectedSymbol(null)}
            className={`px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedSymbol === null
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
            }`}
          >
            Todos
          </button>
          {availableSymbols.map((symbol) => (
            <button
              key={symbol}
              onClick={() => setSelectedSymbol(symbol)}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedSymbol === symbol
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* News Feed - Left Side (2/3) */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Feed de Noticias
                {selectedSymbol && (
                  <span className="text-sm text-blue-400 font-normal">
                    · Filtrando por {selectedSymbol}
                  </span>
                )}
              </h2>
              <span className="text-sm text-gray-500">
                {filteredNews.length} noticias
              </span>
            </div>

            <NewsFeed
              news={filteredNews}
              onViewImpact={handleViewImpact}
              isLoading={isLoading}
            />
          </motion.div>
        </div>

        {/* Sentiment Dashboard - Right Sidebar (1/3) */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isLoading && allNews.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
            ) : (
              <SentimentDashboard news={allNews} />
            )}
          </motion.div>
        </div>
      </div>

      {/* Impact Modal */}
      <ImpactModal newsId={selectedNewsId} onClose={handleCloseModal} />
    </div>
  );
}
