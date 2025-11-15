// OMEGA NEWS API Client - Elite News Intelligence

const API_BASE_URL = 'https://backtester-pro-1.onrender.com';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  symbol: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impactScore: number; // 0.0 - 1.0
  confidence: number; // 0.0 - 1.0
  createdAt: string; // ISO date
  source?: string;
  keywords?: string[];
}

export interface ImpactAnalysis {
  immediateImpact: number; // 0-100
  impact1h: number; // 0-100
  impact4h: number; // 0-100
  impact24h: number; // 0-100
  probabilityUp: number; // percentage
  probabilityDown: number; // percentage
  expectedVolatility: number; // percentage
  eventDuration: string; // e.g., "5h 12m"
  historicalReactions: {
    avgMove: string; // e.g., "+1.6%"
    avgDuration: string; // e.g., "120m"
    sampleSize: number;
  };
  summary: string; // AI summary
}

export interface SentimentDistribution {
  positive: number; // percentage
  negative: number; // percentage
  neutral: number; // percentage
}

export interface AssetSentiment {
  asset: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Fetch all news items
 * GET /api/news
 */
export async function getAllNews(): Promise<NewsItem[]> {
  try {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/news`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}

/**
 * Get impact analysis for a specific news item
 * GET /api/news/:id/impact
 */
export async function getImpact(newsId: number): Promise<ImpactAnalysis> {
  try {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/news/${newsId}/impact`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch impact: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching impact:', error);
    throw error;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate sentiment distribution from news items
 */
export function getSentimentDistribution(news: NewsItem[]): SentimentDistribution {
  if (news.length === 0) {
    return { positive: 0, negative: 0, neutral: 0 };
  }

  const counts = news.reduce(
    (acc, item) => {
      acc[item.sentiment]++;
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0 }
  );

  return {
    positive: Math.round((counts.positive / news.length) * 100),
    negative: Math.round((counts.negative / news.length) * 100),
    neutral: Math.round((counts.neutral / news.length) * 100),
  };
}

/**
 * Get asset-specific sentiment
 */
export function getAssetSentiment(news: NewsItem[], asset: string): 'bullish' | 'bearish' | 'neutral' {
  const assetNews = news.filter(item => item.symbol === asset);

  if (assetNews.length === 0) return 'neutral';

  const distribution = getSentimentDistribution(assetNews);

  if (distribution.positive > distribution.negative + 10) return 'bullish';
  if (distribution.negative > distribution.positive + 10) return 'bearish';
  return 'neutral';
}

/**
 * Get all unique symbols from news items
 */
export function getUniqueSymbols(news: NewsItem[]): string[] {
  const symbols = new Set(news.map(item => item.symbol));
  return Array.from(symbols).sort();
}

/**
 * Filter news by symbol
 */
export function filterBySymbol(news: NewsItem[], symbol: string | null): NewsItem[] {
  if (!symbol) return news;
  return news.filter(item => item.symbol === symbol);
}

/**
 * Filter news by search query
 */
export function filterBySearch(news: NewsItem[], query: string): NewsItem[] {
  if (!query) return news;

  const lowerQuery = query.toLowerCase();
  return news.filter(
    item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.summary.toLowerCase().includes(lowerQuery) ||
      item.symbol.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Format time ago (e.g., "5m", "2h", "3d")
 */
export function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  return `${days}d`;
}

/**
 * Get sentiment color classes
 */
export function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'positive':
      return 'text-green-400 bg-green-500/10 border-green-500/30';
    case 'negative':
      return 'text-red-400 bg-red-500/10 border-red-500/30';
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  }
}

/**
 * Get sentiment icon
 */
export function getSentimentIcon(sentiment: string): string {
  switch (sentiment) {
    case 'positive':
      return '🟢';
    case 'negative':
      return '🔴';
    default:
      return '⚪';
  }
}

/**
 * Get sentiment label
 */
export function getSentimentLabel(sentiment: string): string {
  switch (sentiment) {
    case 'positive':
      return 'Positivo';
    case 'negative':
      return 'Negativo';
    default:
      return 'Neutro';
  }
}

/**
 * Get impact color based on score
 */
export function getImpactColor(score: number): string {
  if (score >= 0.7) return 'text-red-400';
  if (score >= 0.4) return 'text-yellow-400';
  return 'text-green-400';
}

/**
 * Convert impact score (0-1) to stars (1-5)
 */
export function impactToStars(score: number): number {
  return Math.max(1, Math.min(5, Math.round(score * 5)));
}
