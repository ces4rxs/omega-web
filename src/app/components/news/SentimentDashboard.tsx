'use client';

import { useMemo } from 'react';
import { Brain, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import {
  type NewsItem,
  getSentimentDistribution,
  getAssetSentiment,
} from '@/lib/api/news';

interface SentimentDashboardProps {
  news: NewsItem[];
}

export default function SentimentDashboard({ news }: SentimentDashboardProps) {
  const sentimentDist = useMemo(() => getSentimentDistribution(news), [news]);

  // Calculate sentiment for major asset classes
  const cryptoSymbols = ['BTC', 'ETH'];
  const stockSymbols = ['AAPL', 'TSLA', 'NVDA', 'SPX', 'NASDAQ'];

  const cryptoNews = news.filter((item) => cryptoSymbols.includes(item.symbol));
  const stockNews = news.filter((item) => stockSymbols.includes(item.symbol));

  const cryptoSentiment = useMemo(
    () => (cryptoNews.length > 0 ? getOverallSentiment(cryptoNews) : 'neutral'),
    [cryptoNews]
  );

  const stockSentiment = useMemo(
    () => (stockNews.length > 0 ? getOverallSentiment(stockNews) : 'neutral'),
    [stockNews]
  );

  // Get high-impact news count
  const highImpactCount = news.filter((item) => item.impactScore >= 0.7).length;

  return (
    <div className="space-y-6">
      {/* Global Sentiment Card */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-5">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-400" />
          Sentimiento Global
        </h3>

        <div className="space-y-3">
          {/* Positive */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-green-400 font-medium">Positivo</span>
              <span className="text-sm font-bold text-green-400">
                {sentimentDist.positive}%
              </span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                style={{ width: `${sentimentDist.positive}%` }}
              />
            </div>
          </div>

          {/* Negative */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-red-400 font-medium">Negativo</span>
              <span className="text-sm font-bold text-red-400">
                {sentimentDist.negative}%
              </span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                style={{ width: `${sentimentDist.negative}%` }}
              />
            </div>
          </div>

          {/* Neutral */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400 font-medium">Neutro</span>
              <span className="text-sm font-bold text-gray-400">
                {sentimentDist.neutral}%
              </span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gray-500 to-gray-400 rounded-full transition-all duration-500"
                style={{ width: `${sentimentDist.neutral}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Crypto Sentiment */}
      <SentimentCard
        title="Sentimiento Crypto"
        sentiment={cryptoSentiment}
        newsCount={cryptoNews.length}
      />

      {/* Stock Sentiment */}
      <SentimentCard
        title="Sentimiento Acciones"
        sentiment={stockSentiment}
        newsCount={stockNews.length}
      />

      {/* High Impact Alert */}
      {highImpactCount > 0 && (
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-bold text-red-400">ALERTAS DE ALTO IMPACTO</h3>
          </div>
          <p className="text-3xl font-bold text-red-400">{highImpactCount}</p>
          <p className="text-xs text-gray-400 mt-1">
            Noticias con impacto ≥ 70/100
          </p>
        </div>
      )}

      {/* Smart Alerts AI */}
      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-5">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          Smart Alerts AI
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-black/40 rounded-lg border border-blue-500/20">
            <p className="text-xs text-blue-300 mb-1 font-semibold">⚡ Momentum Alert</p>
            <p className="text-xs text-gray-300">
              Alto volumen + sentimiento positivo → posible rally
            </p>
          </div>
          <div className="p-3 bg-black/40 rounded-lg border border-yellow-500/20">
            <p className="text-xs text-yellow-300 mb-1 font-semibold">⚠️ Volatility Warning</p>
            <p className="text-xs text-gray-300">
              Impacto alto → esperarse movimientos en 15-30 min
            </p>
          </div>
          <div className="p-3 bg-black/40 rounded-lg border border-green-500/20">
            <p className="text-xs text-green-300 mb-1 font-semibold">📈 Bullish Signal</p>
            <p className="text-xs text-gray-300">
              Sentimiento crypto alcista → oportunidad de entrada
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component: Sentiment Card
interface SentimentCardProps {
  title: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  newsCount: number;
}

function SentimentCard({ title, sentiment, newsCount }: SentimentCardProps) {
  const getConfig = (sent: string) => {
    switch (sent) {
      case 'bullish':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          text: 'text-green-400',
          label: 'Bullish',
          icon: <TrendingUp className="w-6 h-6 text-green-400" />,
        };
      case 'bearish':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          label: 'Bearish',
          icon: <TrendingDown className="w-6 h-6 text-red-400" />,
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          label: 'Neutral',
          icon: <Activity className="w-6 h-6 text-gray-400" />,
        };
    }
  };

  const config = getConfig(sentiment);

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-5`}>
      <p className={`text-sm font-bold mb-1 ${config.text}`}>{title}</p>
      <p className={`text-2xl font-bold ${config.text}`}>{config.label}</p>
      <div className="flex items-center justify-between mt-3">
        {config.icon}
        <span className="text-xs text-gray-500">{newsCount} noticias</span>
      </div>
    </div>
  );
}

// Helper function to determine overall sentiment from news array
function getOverallSentiment(news: NewsItem[]): 'bullish' | 'bearish' | 'neutral' {
  const dist = getSentimentDistribution(news);

  if (dist.positive > dist.negative + 10) return 'bullish';
  if (dist.negative > dist.positive + 10) return 'bearish';
  return 'neutral';
}
