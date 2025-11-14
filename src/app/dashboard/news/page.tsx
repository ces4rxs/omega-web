'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Clock,
  Brain,
  Zap,
  ChevronRight,
  Star,
  Activity,
} from 'lucide-react';

// Mock data - will be replaced with Perplexity API
const MOCK_CRITICAL_ALERTS = [
  {
    id: 1,
    title: '⚡ FED anuncia subida inesperada de tasas',
    summary: 'El anuncio generó alta volatilidad en USDJPY y caída del Nikkei. Mercados en pánico.',
    sentiment: 'negative',
    impact: 5,
    assets: ['USDJPY', 'NKY', 'BTC', 'SPX'],
    timestamp: Date.now() - 300000,
  },
  {
    id: 2,
    title: '🔥 Bitcoin supera resistencia clave en $45K',
    summary: 'Volumen institucional elevado indica continuación alcista. Targets: $48K-$50K.',
    sentiment: 'positive',
    impact: 4,
    assets: ['BTC', 'ETH', 'CRYPTO'],
    timestamp: Date.now() - 600000,
  },
];

const MOCK_NEWS = [
  {
    id: 1,
    title: 'Bitcoin cae 7% por liquidaciones masivas en Binance Futures',
    summary: 'La caída fue causada por liquidaciones automáticas superiores a $120M en las últimas 2 horas.',
    sentiment: 'negative',
    impact: 4,
    assets: ['BTC', 'ETH', 'USDT'],
    timestamp: Date.now() - 900000,
    source: 'Bloomberg',
  },
  {
    id: 2,
    title: 'S&P 500 alcanza nuevo máximo histórico impulsado por sector tecnológico',
    summary: 'Apple, Microsoft y Nvidia lideran las ganancias. Analistas proyectan continuación.',
    sentiment: 'positive',
    impact: 3,
    assets: ['SPX', 'AAPL', 'MSFT', 'NVDA'],
    timestamp: Date.now() - 1800000,
    source: 'Reuters',
  },
  {
    id: 3,
    title: 'Oro sube 2% ante tensiones geopolíticas en Medio Oriente',
    summary: 'Inversores buscan refugio seguro. Expertos anticipan mayor volatilidad en commodities.',
    sentiment: 'neutral',
    impact: 3,
    assets: ['GOLD', 'SILVER', 'OIL'],
    timestamp: Date.now() - 3600000,
    source: 'Financial Times',
  },
  {
    id: 4,
    title: 'Ethereum completa actualización Shanghai con éxito',
    summary: 'La red procesó 15% más transacciones post-upgrade. Staking más accesible.',
    sentiment: 'positive',
    impact: 4,
    assets: ['ETH', 'BTC'],
    timestamp: Date.now() - 7200000,
    source: 'CoinDesk',
  },
];

const SYMBOLS = ['BTC', 'ETH', 'SPX', 'GOLD', 'USDJPY', 'NASDAQ', 'OIL', 'TSLA'];

export default function NewsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNews, setFilteredNews] = useState(MOCK_NEWS);

  useEffect(() => {
    let filtered = MOCK_NEWS;

    if (selectedSymbol) {
      filtered = filtered.filter((news) => news.assets.includes(selectedSymbol));
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (news) =>
          news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          news.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNews(filtered);
  }, [selectedSymbol, searchQuery]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'negative':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '🟢 Positivo';
      case 'negative':
        return '🔴 Negativo';
      default:
        return '⚪ Neutro';
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-2"
        >
          <Brain className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">
            OMEGA <span className="text-blue-400">NEWS</span>
          </h1>
          <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full font-semibold">
            AI-POWERED
          </span>
        </motion.div>
        <p className="text-gray-400 text-sm">Noticias financieras analizadas por IA en tiempo real</p>
      </div>

      {/* Critical Alerts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-bold text-red-400">ALERTAS CRÍTICAS</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_CRITICAL_ALERTS.map((alert) => (
              <div
                key={alert.id}
                className="bg-black/40 border border-red-500/20 rounded-lg p-4 hover:border-red-500/40 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-white text-sm flex-1">{alert.title}</h3>
                  <div className="flex gap-1">
                    {[...Array(alert.impact)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-3">{alert.summary}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {alert.assets.slice(0, 4).map((asset) => (
                      <span
                        key={asset}
                        className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded"
                      >
                        {asset}
                      </span>
                    ))}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded border ${getSentimentColor(alert.sentiment)}`}>
                    {getSentimentLabel(alert.sentiment)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar noticias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Symbol Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedSymbol(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedSymbol === null
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Todos
          </button>
          {SYMBOLS.map((symbol) => (
            <button
              key={symbol}
              onClick={() => setSelectedSymbol(symbol)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedSymbol === symbol
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      {/* News Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Feed de Noticias
            {selectedSymbol && (
              <span className="text-sm text-blue-400">
                · Filtrando por {selectedSymbol}
              </span>
            )}
          </h2>

          {filteredNews.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-lg p-5 hover:border-blue-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-white text-base flex-1 group-hover:text-blue-400 transition-colors">
                  {news.title}
                </h3>
                <div className="flex items-center gap-2 ml-4">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">{getTimeAgo(news.timestamp)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 mb-4">
                <Brain className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300">{news.summary}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  {news.assets.map((asset) => (
                    <span
                      key={asset}
                      className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                    >
                      {asset}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded border ${getSentimentColor(news.sentiment)}`}>
                    {getSentimentLabel(news.sentiment)}
                  </span>
                  <div className="flex gap-1">
                    {[...Array(news.impact)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-gray-500">Fuente: {news.source}</span>
                <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  Leer más <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sentiment Dashboard Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              Sentiment Dashboard
            </h3>

            {/* Overall Sentiment */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">Sentimiento Global</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-400">Positivo</span>
                  <span className="text-xs font-bold text-green-400">40%</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '40%' }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-400">Negativo</span>
                  <span className="text-xs font-bold text-red-400">35%</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '35%' }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Neutro</span>
                  <span className="text-xs font-bold text-gray-400">25%</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-500 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>

            {/* Crypto Sentiment */}
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm font-bold mb-1 text-red-400">Sentimiento Crypto</p>
              <p className="text-2xl font-bold text-red-400">Muy Bearish</p>
              <TrendingDown className="w-6 h-6 text-red-400 mt-2" />
            </div>

            {/* Stocks Sentiment */}
            <div className="p-3 bg-gray-500/10 border border-gray-500/30 rounded-lg">
              <p className="text-sm font-bold mb-1 text-gray-400">Sentimiento Acciones</p>
              <p className="text-2xl font-bold text-gray-400">Neutral</p>
              <Activity className="w-6 h-6 text-gray-400 mt-2" />
            </div>
          </div>

          {/* Smart Alerts AI */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Smart Alerts AI
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-black/40 rounded-lg border border-blue-500/20">
                <p className="text-xs text-blue-300 mb-1">⚡ RSI Alert</p>
                <p className="text-xs text-gray-300">RSI &lt; 30 + noticia negativa → posible caída</p>
              </div>
              <div className="p-3 bg-black/40 rounded-lg border border-green-500/20">
                <p className="text-xs text-green-300 mb-1">📈 Volume Spike</p>
                <p className="text-xs text-gray-300">BTC subiendo con noticia positiva + aumento de volumen</p>
              </div>
              <div className="p-3 bg-black/40 rounded-lg border border-yellow-500/20">
                <p className="text-xs text-yellow-300 mb-1">⚠️ High Volatility</p>
                <p className="text-xs text-gray-300">Impact Score alto → volatilidad en 15 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
