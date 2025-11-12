import type { CandleData, Timeframe } from '../types';

/**
 * Data Service for fetching market data
 * Can be connected to real APIs (Binance, Alpha Vantage, etc.) or use mock data
 */

// Generate realistic mock candle data
export function generateMockCandleData(
  symbol: string,
  timeframe: Timeframe,
  count: number = 500
): CandleData[] {
  const data: CandleData[] = [];
  const now = Date.now();
  const timeframeMs = getTimeframeMilliseconds(timeframe);

  let basePrice = 43000; // Starting price (adjust based on symbol)

  // Adjust base price based on symbol
  if (symbol.includes('ETH')) basePrice = 2250;
  if (symbol.includes('AAPL')) basePrice = 180;
  if (symbol.includes('TSLA')) basePrice = 240;

  for (let i = count - 1; i >= 0; i--) {
    const time = Math.floor((now - i * timeframeMs) / 1000);

    // Generate realistic OHLC data
    const volatility = basePrice * 0.002; // 0.2% volatility
    const trend = (Math.random() - 0.5) * volatility * 2; // Random trend
    const open = basePrice;

    // Add some randomness but keep it realistic
    const high = open + Math.abs(Math.random() * volatility);
    const low = open - Math.abs(Math.random() * volatility);
    const close = open + trend;

    // Ensure high is the highest and low is the lowest
    const realHigh = Math.max(open, close, high);
    const realLow = Math.min(open, close, low);

    // Volume (more volume on big moves)
    const priceMove = Math.abs(close - open);
    const baseVolume = 1000000;
    const volume = baseVolume + (priceMove / volatility) * baseVolume * 0.5;

    data.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(realHigh.toFixed(2)),
      low: Number(realLow.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Number(volume.toFixed(0)),
    });

    // Update base price for next candle
    basePrice = close;
  }

  return data;
}

// Convert timeframe string to milliseconds
function getTimeframeMilliseconds(timeframe: Timeframe): number {
  const map: Record<Timeframe, number> = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
  };
  return map[timeframe];
}

/**
 * Fetch candle data from API or generate mock data
 * In production, replace this with real API calls
 */
export async function fetchCandleData(
  symbol: string,
  timeframe: Timeframe,
  limit: number = 500
): Promise<CandleData[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // For now, return mock data
  // TODO: Connect to real API (Binance, Coinbase, Alpha Vantage, etc.)
  return generateMockCandleData(symbol, timeframe, limit);
}

/**
 * Fetch real-time price update
 * In production, this would connect to WebSocket
 */
export async function fetchRealtimePrice(symbol: string): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Mock real-time price update
  const basePrice = symbol.includes('BTC') ? 43000 : 2250;
  const change = (Math.random() - 0.5) * basePrice * 0.0005; // 0.05% change

  return Number((basePrice + change).toFixed(2));
}

/**
 * Example: Binance API integration (commented out for now)
 */
/*
export async function fetchBinanceData(
  symbol: string,
  interval: string,
  limit: number = 500
): Promise<CandleData[]> {
  const response = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  );

  const data = await response.json();

  return data.map((candle: any) => ({
    time: candle[0] / 1000, // Convert to seconds
    open: parseFloat(candle[1]),
    high: parseFloat(candle[2]),
    low: parseFloat(candle[3]),
    close: parseFloat(candle[4]),
    volume: parseFloat(candle[5]),
  }));
}
*/

/**
 * Convert timeframe to Binance interval format
 */
export function convertTimeframeToBinanceInterval(timeframe: Timeframe): string {
  const map: Record<Timeframe, string> = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '30m': '30m',
    '1h': '1h',
    '4h': '4h',
    '1d': '1d',
    '1w': '1w',
  };
  return map[timeframe];
}
