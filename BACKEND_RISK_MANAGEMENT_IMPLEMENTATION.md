# Backend Risk Management Implementation Guide

## Overview
This document provides the complete implementation guide for processing risk management parameters in the backtest engine. The frontend now sends these parameters, and the backend must apply them to generate realistic, production-grade backtest results.

## Frontend Contract
The frontend sends risk management parameters as part of the backtest request:

```typescript
POST /api/backtest
{
  strategy: string,
  symbol: string,
  timeframe: string,
  startDate: string,
  endDate: string,
  initialCapital: number,
  parameters: {...},
  riskManagement?: {
    commission?: number,      // $ per trade (e.g., 0.50)
    slippage?: number,        // % slippage (e.g., 0.05 = 0.05%)
    stopLoss?: number,        // % stop loss (e.g., 2.0 = 2%)
    takeProfit?: number,      // % take profit (e.g., 5.0 = 5%)
    positionSize?: number,    // % of capital per trade (e.g., 100 = 100%)
    maxPositions?: number     // max concurrent positions (e.g., 1)
  }
}
```

## Implementation Strategy

### 1. Commission Processing
**When to Apply:** On every trade entry AND exit

```python
def apply_commission(trade, commission_per_trade):
    """
    Apply commission costs to a trade.
    Commission is applied TWICE: once on entry, once on exit.

    Args:
        trade: Trade object with entry/exit prices
        commission_per_trade: Dollar amount per trade (e.g., 0.50)

    Returns:
        Modified trade with commission costs included
    """
    # Deduct commission from PnL
    trade.pnl -= (commission_per_trade * 2)  # Entry + Exit
    trade.commission_cost = commission_per_trade * 2

    # Update equity
    trade.final_equity -= trade.commission_cost

    return trade
```

**Example Impact:**
- Commission: $0.50/trade
- 100 trades = $100 in costs
- On a $10,000 account = -1% performance impact

### 2. Slippage Processing
**When to Apply:** On every trade entry AND exit (affects fill price)

```python
def apply_slippage(price, direction, slippage_percent):
    """
    Apply slippage to execution price.
    Slippage ALWAYS works against the trader.

    Args:
        price: Intended execution price
        direction: 'buy' or 'sell'
        slippage_percent: Percentage slippage (e.g., 0.05 = 0.05%)

    Returns:
        Actual execution price with slippage
    """
    slippage_multiplier = slippage_percent / 100

    if direction == 'buy':
        # Buying: pay MORE than intended
        return price * (1 + slippage_multiplier)
    else:  # sell
        # Selling: receive LESS than intended
        return price * (1 - slippage_multiplier)

# Application in backtest engine:
entry_price = apply_slippage(signal_price, 'buy', slippage)
exit_price = apply_slippage(signal_price, 'sell', slippage)
```

**Example Impact:**
- Slippage: 0.05%
- Entry at $100: actual fill at $100.05
- Exit at $105: actual fill at $104.95
- Round-trip slippage: ~0.10% or $0.10 per $100 traded

### 3. Stop Loss Implementation
**When to Check:** On EVERY bar/candle during an open position

```python
def check_stop_loss(position, current_bar, stop_loss_percent):
    """
    Check if stop loss should be triggered on current bar.
    Uses the LOW price of the bar for long positions.

    Args:
        position: Open position object
        current_bar: Current OHLC bar
        stop_loss_percent: Stop loss percentage (e.g., 2.0 = 2%)

    Returns:
        (should_exit, exit_price) tuple
    """
    if position.side == 'long':
        stop_price = position.entry_price * (1 - stop_loss_percent / 100)

        # Check if LOW of bar hit stop loss
        if current_bar.low <= stop_price:
            # Exit at stop price (assuming limit order filled)
            return (True, stop_price)

    elif position.side == 'short':
        stop_price = position.entry_price * (1 + stop_loss_percent / 100)

        # Check if HIGH of bar hit stop loss
        if current_bar.high >= stop_price:
            return (True, stop_price)

    return (False, None)

# Integration in backtest loop:
for bar in historical_data:
    for position in open_positions:
        should_exit, exit_price = check_stop_loss(position, bar, stop_loss_percent)
        if should_exit:
            close_position(position, exit_price, reason='stop_loss')
```

**Critical Implementation Details:**
- Use the LOW price for long positions (most conservative)
- Use the HIGH price for short positions
- Exit at the stop price, not the close price
- Stop loss checks happen BEFORE strategy signals
- Mark trades with `exit_reason: 'stop_loss'` for analysis

### 4. Take Profit Implementation
**When to Check:** On EVERY bar/candle during an open position

```python
def check_take_profit(position, current_bar, take_profit_percent):
    """
    Check if take profit should be triggered on current bar.
    Uses the HIGH price of the bar for long positions.

    Args:
        position: Open position object
        current_bar: Current OHLC bar
        take_profit_percent: Take profit percentage (e.g., 5.0 = 5%)

    Returns:
        (should_exit, exit_price) tuple
    """
    if position.side == 'long':
        target_price = position.entry_price * (1 + take_profit_percent / 100)

        # Check if HIGH of bar hit take profit
        if current_bar.high >= target_price:
            return (True, target_price)

    elif position.side == 'short':
        target_price = position.entry_price * (1 - take_profit_percent / 100)

        # Check if LOW of bar hit take profit
        if current_bar.low <= target_price:
            return (True, target_price)

    return (False, None)
```

**Priority Order:**
1. Check Stop Loss FIRST
2. Then check Take Profit
3. Then check strategy exit signals

This prevents unrealistic scenarios where both are hit on the same bar.

### 5. Position Sizing Implementation
**When to Apply:** When entering a new position

```python
def calculate_position_size(capital, position_size_percent, price, max_positions):
    """
    Calculate the number of shares/units to buy based on position sizing rules.

    Args:
        capital: Current account equity
        position_size_percent: Percentage of capital to risk (e.g., 100 = 100%)
        price: Entry price
        max_positions: Maximum concurrent positions allowed

    Returns:
        Number of shares to buy
    """
    # Available capital per position
    capital_per_position = capital * (position_size_percent / 100) / max_positions

    # Calculate shares (floor to avoid fractional shares)
    shares = int(capital_per_position / price)

    return shares

# Example with diversification:
capital = 10000
position_size = 50  # 50% of capital
max_positions = 2   # Allow 2 concurrent positions
price = 100

shares = calculate_position_size(capital, position_size, price, max_positions)
# Result: (10000 * 0.5 / 2) / 100 = 25 shares
```

**Max Positions Logic:**
```python
def can_open_position(open_positions, max_positions):
    """
    Check if new position can be opened based on max positions limit.

    Args:
        open_positions: List of currently open positions
        max_positions: Maximum allowed concurrent positions

    Returns:
        Boolean indicating if new position can be opened
    """
    return len(open_positions) < max_positions
```

## Complete Backtest Loop Integration

```python
def run_backtest_with_risk_management(
    strategy,
    symbol,
    historical_data,
    initial_capital,
    risk_params
):
    """
    Complete backtest engine with all risk management features.
    """
    # Initialize
    capital = initial_capital
    open_positions = []
    closed_trades = []
    equity_curve = []

    # Extract risk parameters (with defaults)
    commission = risk_params.get('commission', 0)
    slippage = risk_params.get('slippage', 0)
    stop_loss_pct = risk_params.get('stopLoss', None)
    take_profit_pct = risk_params.get('takeProfit', None)
    position_size_pct = risk_params.get('positionSize', 100)
    max_positions = risk_params.get('maxPositions', 1)

    for i, bar in enumerate(historical_data):
        # 1. Check risk management exits FIRST (before strategy signals)
        for position in open_positions[:]:  # Copy list to safely modify

            # Check Stop Loss
            if stop_loss_pct:
                should_exit_sl, sl_price = check_stop_loss(position, bar, stop_loss_pct)
                if should_exit_sl:
                    exit_price = apply_slippage(sl_price, 'sell', slippage)
                    close_position(position, exit_price, commission, 'stop_loss')
                    closed_trades.append(position)
                    open_positions.remove(position)
                    capital = update_capital(position)
                    continue

            # Check Take Profit
            if take_profit_pct:
                should_exit_tp, tp_price = check_take_profit(position, bar, take_profit_pct)
                if should_exit_tp:
                    exit_price = apply_slippage(tp_price, 'sell', slippage)
                    close_position(position, exit_price, commission, 'take_profit')
                    closed_trades.append(position)
                    open_positions.remove(position)
                    capital = update_capital(position)
                    continue

        # 2. Run strategy signals
        signal = strategy.generate_signal(historical_data[:i+1])

        # 3. Entry signal
        if signal == 'buy' and can_open_position(open_positions, max_positions):
            # Calculate position size
            shares = calculate_position_size(
                capital,
                position_size_pct,
                bar.close,
                max_positions
            )

            if shares > 0:
                # Apply slippage to entry
                entry_price = apply_slippage(bar.close, 'buy', slippage)

                # Create position
                position = Position(
                    entry_price=entry_price,
                    shares=shares,
                    entry_date=bar.date
                )
                open_positions.append(position)

                # Deduct entry commission immediately
                capital -= commission

        # 4. Exit signal (strategy-based)
        elif signal == 'sell':
            for position in open_positions[:]:
                exit_price = apply_slippage(bar.close, 'sell', slippage)
                close_position(position, exit_price, commission, 'strategy')
                closed_trades.append(position)
                open_positions.remove(position)
                capital = update_capital(position)

        # 5. Update equity curve
        total_equity = capital + sum(p.unrealized_pnl(bar.close) for p in open_positions)
        equity_curve.append({
            'date': bar.date,
            'equity': total_equity
        })

    return {
        'trades': closed_trades,
        'equity_curve': equity_curve,
        'final_equity': equity_curve[-1]['equity'],
        'total_return': (equity_curve[-1]['equity'] - initial_capital) / initial_capital
    }
```

## Performance Metrics Adjustments

After applying risk management, recalculate all metrics:

```python
def calculate_performance_with_risk(trades, equity_curve, initial_capital):
    """
    Calculate performance metrics including risk management costs.
    """
    # Total commission paid
    total_commissions = sum(t.commission_cost for t in trades)

    # Total slippage impact (estimated)
    total_slippage_cost = sum(t.slippage_cost for t in trades)

    # Trades closed by stop loss vs strategy
    stop_loss_trades = [t for t in trades if t.exit_reason == 'stop_loss']
    take_profit_trades = [t for t in trades if t.exit_reason == 'take_profit']

    # Standard metrics
    total_return = (equity_curve[-1]['equity'] - initial_capital) / initial_capital
    win_rate = len([t for t in trades if t.pnl > 0]) / len(trades)

    # Risk-adjusted metrics
    return {
        'totalReturn': total_return,
        'sharpeRatio': calculate_sharpe(equity_curve),
        'maxDrawdown': calculate_max_drawdown(equity_curve),
        'winRate': win_rate,
        'totalTrades': len(trades),
        'profitFactor': calculate_profit_factor(trades),

        # Risk management specific
        'totalCommissions': total_commissions,
        'totalSlippageCost': total_slippage_cost,
        'stopLossTrades': len(stop_loss_trades),
        'takeProfitTrades': len(take_profit_trades),
        'avgWin': calculate_avg_win(trades),
        'avgLoss': calculate_avg_loss(trades),
        'expectancy': calculate_expectancy(trades)
    }
```

## Testing Scenarios

### Scenario 1: Commission Impact
```
Initial Capital: $10,000
Commission: $1.00/trade
Strategy: 100 trades
Expected Impact: -$200 (-2% return)
```

### Scenario 2: Slippage Impact
```
Initial Capital: $10,000
Slippage: 0.10%
Strategy: 100 trades @ avg $5,000 position
Expected Impact: ~$100 (-1% return)
```

### Scenario 3: Stop Loss Protection
```
Initial Capital: $10,000
Stop Loss: 2%
Without SL: Max Drawdown 15%
With SL: Max Drawdown ~8-10% (limited losses)
```

### Scenario 4: Position Sizing
```
Initial Capital: $10,000
Position Size: 50% (instead of 100%)
Effect: Half the gains, half the losses, lower volatility
```

## Database Schema for Trades

Add these fields to trade records:

```sql
CREATE TABLE trades (
    id VARCHAR PRIMARY KEY,
    backtest_id VARCHAR,
    entry_date TIMESTAMP,
    exit_date TIMESTAMP,
    entry_price DECIMAL,
    exit_price DECIMAL,
    shares INTEGER,
    pnl DECIMAL,
    pnl_percent DECIMAL,

    -- Risk Management Fields
    commission_cost DECIMAL DEFAULT 0,
    slippage_cost DECIMAL DEFAULT 0,
    exit_reason VARCHAR, -- 'strategy', 'stop_loss', 'take_profit'

    -- Position Sizing
    capital_at_entry DECIMAL,
    position_size_percent INTEGER,

    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Response Format

Return extended trade data with risk management details:

```json
{
  "backtest": {
    "id": "bt_123",
    "performance": {
      "totalReturn": 0.145,
      "sharpeRatio": 1.8,
      "maxDrawdown": -0.08,
      "winRate": 0.58,
      "totalTrades": 87,
      "totalCommissions": 87.00,
      "totalSlippageCost": 43.50,
      "stopLossTrades": 12,
      "takeProfitTrades": 18
    },
    "trades": [
      {
        "id": "trade_1",
        "entryDate": "2024-01-15",
        "exitDate": "2024-01-20",
        "entryPrice": 150.25,
        "exitPrice": 148.10,
        "shares": 66,
        "pnl": -141.90,
        "pnlPercent": -1.43,
        "commissionCost": 1.00,
        "slippageCost": 0.15,
        "exitReason": "stop_loss"
      }
    ],
    "equityCurve": [...]
  }
}
```

## Implementation Checklist

- [ ] Add risk management parameter parsing to backtest endpoint
- [ ] Implement commission deduction on entry/exit
- [ ] Implement slippage adjustment to fill prices
- [ ] Implement stop loss checking on every bar
- [ ] Implement take profit checking on every bar
- [ ] Implement position sizing calculations
- [ ] Implement max positions limit
- [ ] Add exit_reason field to trades
- [ ] Update performance metrics calculations
- [ ] Update database schema
- [ ] Add risk management fields to API response
- [ ] Write unit tests for each risk feature
- [ ] Test with realistic parameters
- [ ] Document API changes

## Recommended Default Values

For a realistic backtest, use these defaults if parameters not provided:

```python
DEFAULT_RISK_PARAMS = {
    'commission': 0.50,      # $0.50/trade (typical retail broker)
    'slippage': 0.05,        # 0.05% (conservative for liquid stocks)
    'stopLoss': None,        # Optional - user must enable
    'takeProfit': None,      # Optional - user must enable
    'positionSize': 100,     # 100% of capital (full Kelly)
    'maxPositions': 1        # One position at a time
}
```

## Impact Estimation

Create a function to estimate impact before running backtest:

```python
def estimate_risk_impact(expected_trades, avg_trade_value, risk_params):
    """
    Estimate the impact of risk management on performance.
    Returns a dictionary with estimated costs.
    """
    commission_cost = expected_trades * risk_params['commission'] * 2
    slippage_cost = expected_trades * avg_trade_value * (risk_params['slippage'] / 100) * 2

    return {
        'estimatedCommissions': commission_cost,
        'estimatedSlippage': slippage_cost,
        'totalEstimatedCost': commission_cost + slippage_cost,
        'percentOfCapital': (commission_cost + slippage_cost) / avg_trade_value * 100
    }
```

---

## Summary

Implementing these risk management features will transform the backtest from optimistic simulations to realistic, tradeable strategies. The key impacts are:

1. **Commission**: -1% to -3% on typical strategies
2. **Slippage**: -0.5% to -2% depending on trading frequency
3. **Stop Loss**: Reduces max drawdown by 30-50%
4. **Take Profit**: Improves consistency, may reduce total return
5. **Position Sizing**: Controls risk exposure and volatility

**Total realistic cost**: Expect 2-5% performance reduction on high-frequency strategies, but with much more accurate, tradeable results.
