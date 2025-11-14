// News API Service - Perplexity Integration

const API_BASE_URL = 'https://backtester-pro-1.onrender.com';

export interface NewsAnalysisRequest {
  headline: string;
  content?: string;
}

export interface NewsAnalysisResponse {
  ok: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral';
  impact?: number; // 0.0 to 1.0
  confidence?: number; // 0.0 to 1.0
  keywords?: string[];
  timestamp?: string;
  error?: string;
}

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: number; // 1-5 stars
  confidence: number;
  assets: string[];
  keywords: string[];
  timestamp: number;
  source: string;
  isUrgent?: boolean;
}

/**
 * Analyze a single news headline with Perplexity AI
 */
export async function analyzeNews(
  headline: string,
  content?: string
): Promise<NewsAnalysisResponse> {
  try {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/ai/news/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ headline, content }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze news');
    }

    return data;
  } catch (error) {
    console.error('News analysis error:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract related assets from keywords using pattern matching
 */
function extractAssets(keywords: string[]): string[] {
  const assetPatterns: Record<string, string[]> = {
    BTC: ['bitcoin', 'btc', 'crypto'],
    ETH: ['ethereum', 'eth', 'ether'],
    SPX: ['s&p', 'sp500', 'spx', 'stocks', 'equities'],
    GOLD: ['gold', 'oro', 'precious metals'],
    USDJPY: ['usd', 'jpy', 'yen', 'dollar'],
    NASDAQ: ['nasdaq', 'tech stocks', 'technology'],
    OIL: ['oil', 'crude', 'petroleum', 'wti', 'brent'],
    TSLA: ['tesla', 'tsla', 'musk'],
    AAPL: ['apple', 'aapl'],
    NVDA: ['nvidia', 'nvda'],
  };

  const detected = new Set<string>();

  keywords.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    Object.entries(assetPatterns).forEach(([asset, patterns]) => {
      if (patterns.some(pattern => lowerKeyword.includes(pattern))) {
        detected.add(asset);
      }
    });
  });

  // If no assets detected, default to general market
  if (detected.size === 0) {
    detected.add('MARKET');
  }

  return Array.from(detected);
}

/**
 * Convert impact (0.0-1.0) to star rating (1-5)
 */
function impactToStars(impact: number): number {
  return Math.max(1, Math.min(5, Math.round(impact * 5)));
}

/**
 * Fetch and analyze multiple news items
 * This is a placeholder - you'll need to integrate with your actual news source
 */
export async function fetchAnalyzedNews(limit: number = 10): Promise<NewsItem[]> {
  // TODO: Replace with actual news source (RSS, API, etc)
  // For now, using mock headlines that will be analyzed

  const mockHeadlines = [
    {
      title: 'Bitcoin cae 7% por liquidaciones masivas en Binance Futures',
      summary: 'La caída fue causada por liquidaciones automáticas superiores a $120M.',
      source: 'Bloomberg',
    },
    {
      title: 'S&P 500 alcanza nuevo máximo histórico impulsado por sector tecnológico',
      summary: 'Apple, Microsoft y Nvidia lideran las ganancias.',
      source: 'Reuters',
    },
    {
      title: 'Oro sube 2% ante tensiones geopolíticas en Medio Oriente',
      summary: 'Inversores buscan refugio seguro.',
      source: 'Financial Times',
    },
    {
      title: 'Ethereum completa actualización Shanghai con éxito',
      summary: 'La red procesó 15% más transacciones post-upgrade.',
      source: 'CoinDesk',
    },
    {
      title: 'FED anuncia subida inesperada de tasas de interés',
      summary: 'El anuncio generó alta volatilidad en mercados globales.',
      source: 'WSJ',
    },
  ];

  const analyzedNews: NewsItem[] = [];

  for (let i = 0; i < Math.min(limit, mockHeadlines.length); i++) {
    const mock = mockHeadlines[i];
    const analysis = await analyzeNews(mock.title, mock.summary);

    if (analysis.ok && analysis.sentiment) {
      analyzedNews.push({
        id: i + 1,
        title: mock.title,
        summary: mock.summary,
        sentiment: analysis.sentiment,
        impact: impactToStars(analysis.impact || 0.5),
        confidence: analysis.confidence || 0.75,
        assets: extractAssets(analysis.keywords || []),
        keywords: analysis.keywords || [],
        timestamp: Date.now() - i * 600000, // Stagger timestamps
        source: mock.source,
        isUrgent: analysis.impact && analysis.impact > 0.7,
      });
    }
  }

  return analyzedNews;
}

/**
 * Get sentiment distribution from news items
 */
export function getSentimentDistribution(news: NewsItem[]) {
  const total = news.length;
  if (total === 0) {
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
    positive: Math.round((counts.positive / total) * 100),
    negative: Math.round((counts.negative / total) * 100),
    neutral: Math.round((counts.neutral / total) * 100),
  };
}

/**
 * Get asset-specific sentiment
 */
export function getAssetSentiment(news: NewsItem[], asset: string): 'bullish' | 'bearish' | 'neutral' {
  const assetNews = news.filter(item => item.assets.includes(asset));

  if (assetNews.length === 0) return 'neutral';

  const distribution = getSentimentDistribution(assetNews);

  if (distribution.positive > distribution.negative + 10) return 'bullish';
  if (distribution.negative > distribution.positive + 10) return 'bearish';
  return 'neutral';
}
