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

// Backend response from GET /api/news/:id/impact
export interface ImpactAnalysisRaw {
  move1h: number; // percentage
  move4h: number; // percentage
  move24h: number; // percentage
  volatility1h: number; // percentage
  volatility4h: number; // percentage
  volatility24h: number; // percentage
  durationMinutes: number;
  pattern: string;
  createdAt: string;
}

// Frontend-computed impact analysis for UI
export interface ImpactAnalysis {
  // Raw backend data
  move1h: number;
  move4h: number;
  move24h: number;
  volatility1h: number;
  volatility4h: number;
  volatility24h: number;
  durationMinutes: number;
  pattern: string;
  createdAt: string;

  // Computed frontend metrics
  impactScore: number; // 0-100 (calculated from move1h + volatility1h)
  probabilityUp: number; // percentage (calculated from move1h)
  probabilityDown: number; // percentage (100 - probabilityUp)
  eventDuration: string; // formatted "5h 12m"
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  trendDirection: 'UP' | 'DOWN' | 'NEUTRAL';
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
  return localStorage.getItem('AccessToken');
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

    const rawData: ImpactAnalysisRaw = await response.json();

    // Transform backend data to frontend format with computed metrics
    return computeImpactMetrics(rawData);
  } catch (error) {
    console.error('Error fetching impact:', error);
    throw error;
  }
}

// ============================================================================
// IMPACT CALCULATION FUNCTIONS (Frontend Formulas)
// ============================================================================

/**
 * Calculate impact score (0-100) based on price movement and volatility
 * Formula: Combines absolute movement with volatility to determine impact magnitude
 */
function calculateImpactScore(move1h: number, volatility1h: number): number {
  // Normalize movement and volatility to 0-100 scale
  const moveComponent = Math.min(Math.abs(move1h) * 10, 50); // Max 50 points from movement
  const volComponent = Math.min(volatility1h * 10, 50); // Max 50 points from volatility

  const score = moveComponent + volComponent;
  return Math.min(Math.round(score), 100);
}

/**
 * Calculate probability UP using logistic function based on move1h
 * Formula: sigmoid(move1h * sensitivity) * 100
 */
function calculateProbabilityUp(move1h: number): number {
  const sensitivity = 2.5; // Amplify small movements
  const sigmoid = 1 / (1 + Math.exp(-move1h * sensitivity));
  return Math.round(sigmoid * 100);
}

/**
 * Determine impact level category based on score
 */
function getImpactLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
}

/**
 * Determine trend direction based on move1h
 */
function getTrendDirection(move1h: number): 'UP' | 'DOWN' | 'NEUTRAL' {
  if (move1h > 0.5) return 'UP';
  if (move1h < -0.5) return 'DOWN';
  return 'NEUTRAL';
}

/**
 * Format duration from minutes to readable string (e.g., "5h 12m")
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Compute all frontend impact metrics from backend raw data
 */
function computeImpactMetrics(raw: ImpactAnalysisRaw): ImpactAnalysis {
  const impactScore = calculateImpactScore(raw.move1h, raw.volatility1h);
  const probabilityUp = calculateProbabilityUp(raw.move1h);
  const probabilityDown = 100 - probabilityUp;
  const eventDuration = formatDuration(raw.durationMinutes);
  const impactLevel = getImpactLevel(impactScore);
  const trendDirection = getTrendDirection(raw.move1h);

  return {
    // Raw backend data
    move1h: raw.move1h,
    move4h: raw.move4h,
    move24h: raw.move24h,
    volatility1h: raw.volatility1h,
    volatility4h: raw.volatility4h,
    volatility24h: raw.volatility24h,
    durationMinutes: raw.durationMinutes,
    pattern: raw.pattern || 'UNKNOWN',
    createdAt: raw.createdAt,

    // Computed frontend metrics
    impactScore,
    probabilityUp,
    probabilityDown,
    eventDuration,
    impactLevel,
    trendDirection,
  };
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
