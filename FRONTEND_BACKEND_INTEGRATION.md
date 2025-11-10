# Frontend-Backend Integration Guide

## Backtest API Endpoint

### Endpoint
```
POST /api/backtest
```

### Request Payload

The frontend sends the following complete payload structure:

```typescript
{
  strategy: string,              // e.g., "smaCrossover", "rsiMeanRevert", "trend"
  symbol: string,                // e.g., "AAPL", "TSLA", "GOOGL"
  timeframe: string,             // Backend format: "minute", "hour", "day", "week", "month"
  startDate: string,             // ISO date: "2023-01-01"
  endDate: string,               // ISO date: "2024-01-01"
  initialCapital: number,        // e.g., 10000
  parameters: {                  // Strategy-specific parameters
    // For smaCrossover:
    fastPeriod?: number,         // e.g., 10
    slowPeriod?: number,         // e.g., 30

    // For rsiMeanRevert:
    rsiPeriod?: number,          // e.g., 14
    overbought?: number,         // e.g., 70
    oversold?: number            // e.g., 30
  },
  riskManagement?: {             // Optional risk management parameters
    // Basic Risk Management
    commission?: number,         // Fixed cost per trade (USD), e.g., 0.50
    slippage?: number,           // Percentage, e.g., 0.05 (0.05%)
    stopLoss?: number,           // Percentage from entry, e.g., 2.0 (2%)
    takeProfit?: number,         // Percentage from entry, e.g., 5.0 (5%)
    positionSize?: number,       // Percentage of capital per trade, e.g., 100 (100%)
    maxPositions?: number,       // Maximum concurrent positions, e.g., 1

    // Advanced Risk Controls (NEW)
    trailingStop?: number,       // Percentage trailing distance, e.g., 1.5 (1.5%)
    dailyLossLimit?: number,     // Daily loss limit as percentage of capital, e.g., 5.0 (5%)
    maxDrawdownLimit?: number,   // Stop trading if drawdown exceeds this, e.g., 15.0 (15%)
    riskPerTrade?: number,       // Maximum risk per trade as % of capital, e.g., 2.0 (2%)
    volatilitySizing?: {         // ATR-based position sizing
      enabled: boolean,
      atrPeriod: number,         // ATR calculation period, e.g., 14
      atrMultiplier: number      // ATR multiplier for stop distance, e.g., 2.0
    }
  }
}
```

### Example Request

```json
{
  "strategy": "smaCrossover",
  "symbol": "AAPL",
  "timeframe": "day",
  "startDate": "2023-01-01",
  "endDate": "2024-01-01",
  "initialCapital": 10000,
  "parameters": {
    "fastPeriod": 10,
    "slowPeriod": 30
  },
  "riskManagement": {
    "commission": 0.50,
    "slippage": 0.05,
    "stopLoss": 2.0,
    "takeProfit": 5.0,
    "positionSize": 100,
    "maxPositions": 1,
    "trailingStop": 1.5,
    "dailyLossLimit": 5.0,
    "maxDrawdownLimit": 15.0,
    "riskPerTrade": 2.0,
    "volatilitySizing": {
      "enabled": true,
      "atrPeriod": 14,
      "atrMultiplier": 2.0
    }
  }
}
```

### Expected Response

The backend should return:

```typescript
{
  backtest: {
    id: string,
    performance: {
      // Core Metrics
      totalReturn: number,        // Decimal, e.g., 0.1245 for 12.45%
      cagr: number,               // Compound Annual Growth Rate
      sharpeRatio: number,
      maxDrawdown: number,        // Decimal, e.g., 0.0823 for 8.23%
      winRate: number,            // Decimal, e.g., 0.5747 for 57.47%
      profitFactor: number,
      totalTrades: number,
      avgWin: number,             // Average winning trade (USD)
      avgLoss: number,            // Average losing trade (USD)
      expectancy: number,         // Expected value per trade (USD)

      // Advanced Metrics (Optional but recommended)
      sortinoRatio?: number,
      calmarRatio?: number,
      recoveryFactor?: number,
      riskRewardRatio?: number,
      maxAdverseExcursion?: number,
      maxFavorableExcursion?: number,
      consecutiveWins?: number,
      consecutiveLosses?: number,
      avgTradeDuration?: number,
      largestWin?: number,
      largestLoss?: number,

      // Risk Management Metrics (If implemented)
      totalCommissions?: number,
      totalSlippageCost?: number,
      stopLossTrades?: number,
      takeProfitTrades?: number,
      trailingStopTrades?: number
    },
    trades: [
      {
        entryDate: string,        // ISO date
        exitDate: string,
        entryPrice: number,
        exitPrice: number,
        shares: number,
        pnl: number,              // Profit/Loss in USD
        pnlPercent: number,       // Profit/Loss as percentage
        commissionCost?: number,  // Commission paid for this trade
        slippageCost?: number,    // Slippage cost for this trade
        exitReason?: string       // "strategy" | "stop_loss" | "take_profit" | "trailing_stop"
      }
    ],
    equityCurve: [
      {
        date: string,             // ISO date
        equity: number,           // Account equity at this date
        drawdown: number          // Drawdown percentage at this date
      }
    ]
  }
}
```

## Backend Implementation Status

### ✅ Currently Implemented (Basic)
- Commission costs
- Slippage simulation
- Stop Loss
- Take Profit
- Position Sizing
- Max Positions

### 🚧 Pending Implementation (Advanced)
The frontend now sends these parameters, but backend implementation is required:

1. **Trailing Stop** (`trailingStop`)
   - Move stop loss up as price moves in favor
   - Distance from current price (percentage)

2. **Daily Loss Limit** (`dailyLossLimit`)
   - Stop trading for the day if losses exceed this threshold
   - Measured as percentage of starting capital

3. **Max Drawdown Limit** (`maxDrawdownLimit`)
   - Halt strategy execution if drawdown exceeds limit
   - Protects against catastrophic losses

4. **Risk Per Trade** (`riskPerTrade`)
   - Calculate position size based on max risk amount
   - Works with stop loss distance

5. **Volatility-Based Sizing** (`volatilitySizing`)
   - ATR-based position sizing
   - Adjust position size based on market volatility
   - Larger positions in low volatility, smaller in high volatility

## Testing

### Test Case 1: Basic Backtest (No Risk Management)
```bash
curl -X POST http://localhost:3000/api/backtest \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": "smaCrossover",
    "symbol": "AAPL",
    "timeframe": "day",
    "startDate": "2023-01-01",
    "endDate": "2024-01-01",
    "initialCapital": 10000,
    "parameters": {
      "fastPeriod": 10,
      "slowPeriod": 30
    }
  }'
```

### Test Case 2: With Basic Risk Management
```bash
curl -X POST http://localhost:3000/api/backtest \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": "smaCrossover",
    "symbol": "AAPL",
    "timeframe": "day",
    "startDate": "2023-01-01",
    "endDate": "2024-01-01",
    "initialCapital": 10000,
    "parameters": {
      "fastPeriod": 10,
      "slowPeriod": 30
    },
    "riskManagement": {
      "commission": 0.50,
      "slippage": 0.05,
      "stopLoss": 2.0,
      "takeProfit": 5.0
    }
  }'
```

### Test Case 3: With Advanced Risk Management
```bash
curl -X POST http://localhost:3000/api/backtest \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": "smaCrossover",
    "symbol": "AAPL",
    "timeframe": "day",
    "startDate": "2023-01-01",
    "endDate": "2024-01-01",
    "initialCapital": 10000,
    "parameters": {
      "fastPeriod": 10,
      "slowPeriod": 30
    },
    "riskManagement": {
      "commission": 0.50,
      "slippage": 0.05,
      "stopLoss": 2.0,
      "takeProfit": 5.0,
      "trailingStop": 1.5,
      "dailyLossLimit": 5.0,
      "maxDrawdownLimit": 15.0,
      "riskPerTrade": 2.0,
      "volatilitySizing": {
        "enabled": true,
        "atrPeriod": 14,
        "atrMultiplier": 2.0
      }
    }
  }'
```

## Notes

- If the backend doesn't implement a specific risk management feature, it should ignore that parameter
- The backend should return the same response structure regardless of which risk features are used
- Frontend will display whatever metrics the backend provides
- All percentage values are sent as whole numbers (e.g., 2.0 for 2%, not 0.02)

## Reference Implementation

See `/backend-reference/risk_management.py` for a complete Python implementation of the risk management system.
