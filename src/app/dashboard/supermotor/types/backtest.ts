// Backtest data types

export interface Trade {
  id: number;
  entryTime: number; // timestamp
  entryPrice: number;
  exitTime: number; // timestamp
  exitPrice: number;
  side: 'long' | 'short';
  quantity: number;
  pnl: number; // profit/loss in currency
  pnlPercent: number; // profit/loss in percentage
  duration: number; // in milliseconds
}

export interface EquityPoint {
  time: number; // timestamp
  value: number; // capital at this point
  trade?: number; // trade ID if this point corresponds to a trade
}

export interface BacktestMetrics {
  totalReturn: number; // percentage
  sharpeRatio: number;
  maxDrawdown: number; // percentage
  winRate: number; // percentage
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  // Buy & Hold comparison
  buyAndHoldReturn: number; // percentage
  alpha: number; // Strategy Return - Buy & Hold Return
  beta: number; // Volatility ratio (strategy vs market)
}

export interface BacktestResults {
  runId: string;
  symbol: string;
  timeframe: string;
  startDate: number;
  endDate: number;
  initialCapital: number;
  finalCapital: number;
  metrics: BacktestMetrics;
  trades: Trade[];
  equityCurve: EquityPoint[];
  buyAndHoldEquity: EquityPoint[]; // Buy & Hold comparison line
}

// Mock data generator
export function generateMockBacktestResults(
  symbol: string,
  timeframe: string,
  initialCapital: number = 10000
): BacktestResults {
  const trades: Trade[] = [];
  const equityCurve: EquityPoint[] = [];

  let currentCapital = initialCapital;
  let currentTime = Date.now() - 90 * 24 * 60 * 60 * 1000; // 90 days ago

  // Initial equity point
  equityCurve.push({
    time: currentTime,
    value: currentCapital,
  });

  // Generate 142 trades
  const numTrades = 142;
  let winningTrades = 0;
  let losingTrades = 0;
  let totalWins = 0;
  let totalLosses = 0;
  let largestWin = 0;
  let largestLoss = 0;

  for (let i = 0; i < numTrades; i++) {
    const side: 'long' | 'short' = Math.random() > 0.5 ? 'long' : 'short';

    // Entry
    const entryTime = currentTime;
    const entryPrice = 40000 + Math.random() * 10000; // BTC price range

    // Exit (random duration between 1-24 hours)
    const durationHours = 1 + Math.random() * 23;
    const duration = durationHours * 60 * 60 * 1000;
    const exitTime = entryTime + duration;

    // Win rate of ~62.5%
    const isWin = Math.random() < 0.625;

    // Price change
    const priceChangePercent = isWin
      ? 0.5 + Math.random() * 3 // Win: 0.5% to 3.5%
      : -(0.3 + Math.random() * 2.5); // Loss: -0.3% to -2.8%

    const exitPrice = entryPrice * (1 + priceChangePercent / 100);

    // Calculate PnL
    const quantity = currentCapital * 0.1 / entryPrice; // Use 10% of capital
    const pnl = side === 'long'
      ? quantity * (exitPrice - entryPrice)
      : quantity * (entryPrice - exitPrice);

    const pnlPercent = (pnl / currentCapital) * 100;

    // Update capital
    currentCapital += pnl;

    // Track statistics
    if (pnl > 0) {
      winningTrades++;
      totalWins += pnl;
      largestWin = Math.max(largestWin, pnl);
    } else {
      losingTrades++;
      totalLosses += Math.abs(pnl);
      largestLoss = Math.min(largestLoss, pnl);
    }

    // Create trade
    trades.push({
      id: i + 1,
      entryTime,
      entryPrice,
      exitTime,
      exitPrice,
      side,
      quantity,
      pnl,
      pnlPercent,
      duration,
    });

    // Add equity point
    equityCurve.push({
      time: exitTime,
      value: currentCapital,
      trade: i + 1,
    });

    // Advance time
    currentTime = exitTime + (Math.random() * 2 * 60 * 60 * 1000); // 0-2 hours between trades
  }

  // Calculate metrics
  const totalReturn = ((currentCapital - initialCapital) / initialCapital) * 100;
  const winRate = (winningTrades / numTrades) * 100;
  const avgWin = totalWins / winningTrades;
  const avgLoss = totalLosses / losingTrades;
  const profitFactor = totalWins / totalLosses;

  // Calculate max drawdown
  let peak = initialCapital;
  let maxDrawdown = 0;
  for (const point of equityCurve) {
    if (point.value > peak) {
      peak = point.value;
    }
    const drawdown = ((point.value - peak) / peak) * 100;
    if (drawdown < maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  // Simplified Sharpe Ratio calculation
  const returns = trades.map(t => t.pnlPercent);
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdDev = Math.sqrt(
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  );
  const sharpeRatio = avgReturn / stdDev;

  // Calculate Buy & Hold comparison
  const firstPrice = trades[0].entryPrice;
  const lastPrice = trades[trades.length - 1].exitPrice;
  const buyAndHoldReturn = ((lastPrice - firstPrice) / firstPrice) * 100;

  // Generate Buy & Hold equity curve (linear growth from first to last)
  const buyAndHoldEquity: EquityPoint[] = [];
  const buyAndHoldQuantity = initialCapital / firstPrice;

  // Match the equity curve points for better visualization
  for (const point of equityCurve) {
    // Calculate proportional price at this time
    const timeProgress = (point.time - equityCurve[0].time) / (equityCurve[equityCurve.length - 1].time - equityCurve[0].time);
    const priceAtTime = firstPrice + (lastPrice - firstPrice) * timeProgress;
    const valueAtTime = buyAndHoldQuantity * priceAtTime;

    buyAndHoldEquity.push({
      time: point.time,
      value: valueAtTime,
    });
  }

  // Calculate Alpha (excess return over market)
  const alpha = totalReturn - buyAndHoldReturn;

  // Calculate Beta (simplified: ratio of strategy volatility to market volatility)
  // Market returns (Buy & Hold linear interpolation)
  const marketReturns: number[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    const marketReturn = ((buyAndHoldEquity[i].value - buyAndHoldEquity[i - 1].value) / buyAndHoldEquity[i - 1].value) * 100;
    marketReturns.push(marketReturn);
  }

  const marketAvgReturn = marketReturns.reduce((a, b) => a + b, 0) / marketReturns.length;
  const marketStdDev = Math.sqrt(
    marketReturns.reduce((sum, r) => sum + Math.pow(r - marketAvgReturn, 2), 0) / marketReturns.length
  );

  // Beta = Strategy Volatility / Market Volatility
  const beta = marketStdDev > 0 ? stdDev / marketStdDev : 1;

  return {
    runId: `run-${Date.now()}`,
    symbol,
    timeframe,
    startDate: equityCurve[0].time,
    endDate: equityCurve[equityCurve.length - 1].time,
    initialCapital,
    finalCapital: currentCapital,
    metrics: {
      totalReturn,
      sharpeRatio,
      maxDrawdown,
      winRate,
      profitFactor,
      totalTrades: numTrades,
      winningTrades,
      losingTrades,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
      buyAndHoldReturn,
      alpha,
      beta,
    },
    trades,
    equityCurve,
    buyAndHoldEquity,
  };
}
