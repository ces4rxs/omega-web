"""
Complete Backtest Engine with Risk Management Integration
==========================================================

This is a production-ready example showing how to integrate the RiskManager
into a complete backtesting engine.

This example demonstrates:
- Loading historical data
- Running strategy signals
- Managing positions with risk management
- Calculating performance metrics
- Generating API responses

Usage:
    python backtest_engine_example.py
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta
from risk_management import RiskManager, Position, Bar
import random


class Strategy:
    """Base strategy class - implement your own strategies by inheriting"""

    def generate_signal(self, bars: List[Bar], current_index: int) -> str:
        """
        Generate trading signal based on historical data

        Args:
            bars: List of historical bars
            current_index: Current bar index

        Returns:
            'buy', 'sell', or 'hold'
        """
        raise NotImplementedError


class SMAStrategy(Strategy):
    """Simple Moving Average Crossover Strategy"""

    def __init__(self, fast_period: int = 10, slow_period: int = 30):
        self.fast_period = fast_period
        self.slow_period = slow_period

    def calculate_sma(self, bars: List[Bar], period: int, end_index: int) -> float:
        """Calculate SMA for given period ending at end_index"""
        if end_index < period - 1:
            return 0.0

        prices = [bar.close for bar in bars[end_index - period + 1:end_index + 1]]
        return sum(prices) / len(prices)

    def generate_signal(self, bars: List[Bar], current_index: int) -> str:
        """Generate SMA crossover signals"""
        if current_index < self.slow_period:
            return 'hold'

        # Current SMAs
        fast_sma = self.calculate_sma(bars, self.fast_period, current_index)
        slow_sma = self.calculate_sma(bars, self.slow_period, current_index)

        # Previous SMAs
        prev_fast_sma = self.calculate_sma(bars, self.fast_period, current_index - 1)
        prev_slow_sma = self.calculate_sma(bars, self.slow_period, current_index - 1)

        # Crossover detection
        if prev_fast_sma <= prev_slow_sma and fast_sma > slow_sma:
            return 'buy'  # Golden cross
        elif prev_fast_sma >= prev_slow_sma and fast_sma < slow_sma:
            return 'sell'  # Death cross

        return 'hold'


class BacktestEngine:
    """
    Complete backtesting engine with integrated risk management

    This engine handles:
    - Historical data processing
    - Strategy signal generation
    - Position management with risk controls
    - Performance metrics calculation
    - Result formatting for API response
    """

    def __init__(
        self,
        strategy: Strategy,
        initial_capital: float = 10000.0,
        risk_params: Dict[str, Any] = None
    ):
        """
        Initialize backtest engine

        Args:
            strategy: Trading strategy instance
            initial_capital: Starting capital
            risk_params: Risk management parameters
        """
        self.strategy = strategy
        self.initial_capital = initial_capital
        self.capital = initial_capital

        # Initialize risk manager
        risk_params = risk_params or {}
        self.risk_manager = RiskManager(
            commission=risk_params.get('commission', 0),
            slippage=risk_params.get('slippage', 0),
            stop_loss=risk_params.get('stopLoss'),
            take_profit=risk_params.get('takeProfit'),
            position_size=risk_params.get('positionSize', 100),
            max_positions=risk_params.get('maxPositions', 1)
        )

        # Position tracking
        self.open_positions: List[Position] = []
        self.closed_trades: List[Position] = []
        self.equity_curve: List[Dict] = []

    def run(self, historical_data: List[Bar]) -> Dict[str, Any]:
        """
        Run backtest on historical data

        Args:
            historical_data: List of OHLC bars

        Returns:
            Complete backtest results
        """
        print(f"Running backtest on {len(historical_data)} bars...")
        print(f"Initial Capital: ${self.initial_capital:,.2f}")
        print(f"Risk Management: Commission=${self.risk_manager.commission}, "
              f"Slippage={self.risk_manager.slippage}%, "
              f"SL={self.risk_manager.stop_loss_pct}%, "
              f"TP={self.risk_manager.take_profit_pct}%")
        print("-" * 80)

        for i, bar in enumerate(historical_data):
            # 1. Check risk management exits FIRST
            self._check_exits(bar)

            # 2. Generate strategy signal
            signal = self.strategy.generate_signal(historical_data, i)

            # 3. Process signal
            if signal == 'buy':
                self._process_buy_signal(bar)
            elif signal == 'sell':
                self._process_sell_signal(bar)

            # 4. Update equity curve
            self._update_equity_curve(bar)

        # Close any remaining open positions
        if self.open_positions:
            last_bar = historical_data[-1]
            for position in self.open_positions[:]:
                self._close_position(position, last_bar.close, last_bar.date, 'end_of_backtest')

        # Calculate performance metrics
        results = self._calculate_performance()

        print("\n" + "=" * 80)
        print("BACKTEST COMPLETE")
        print("=" * 80)
        self._print_summary(results)

        return results

    def _check_exits(self, bar: Bar) -> None:
        """Check all open positions for risk management exits"""
        for position in self.open_positions[:]:
            should_exit, exit_price, reason = self.risk_manager.check_exit(position, bar)

            if should_exit:
                self._close_position(position, exit_price, bar.date, reason)
                print(f"[{bar.date}] {reason.upper()}: Closed at ${exit_price:.2f} "
                      f"(Entry: ${position.entry_price:.2f})")

    def _process_buy_signal(self, bar: Bar) -> None:
        """Process buy signal - open new position if allowed"""
        # Check if we can open a new position
        if len(self.open_positions) >= self.risk_manager.max_positions:
            return

        position = self.risk_manager.open_position(
            price=bar.close,
            capital=self.capital,
            date=bar.date,
            side='long',
            open_positions=len(self.open_positions)
        )

        if position:
            self.open_positions.append(position)
            self.capital -= position.commission_paid  # Deduct entry commission

            print(f"[{bar.date}] BUY: {position.shares} shares @ ${position.entry_price:.2f} "
                  f"(SL: ${position.stop_loss_price:.2f if position.stop_loss_price else 'N/A'}, "
                  f"TP: ${position.take_profit_price:.2f if position.take_profit_price else 'N/A'})")

    def _process_sell_signal(self, bar: Bar) -> None:
        """Process sell signal - close all open positions"""
        for position in self.open_positions[:]:
            self._close_position(position, bar.close, bar.date, 'strategy')
            print(f"[{bar.date}] SELL: Closed at ${bar.close:.2f} "
                  f"(Entry: ${position.entry_price:.2f})")

    def _close_position(self, position: Position, price: float, date: str, reason: str) -> None:
        """Close a position and update capital"""
        closed = self.risk_manager.close_position(position, price, date, reason)
        self.closed_trades.append(closed)
        self.open_positions.remove(position)

        # Update capital with P&L
        self.capital += closed.pnl + (closed.entry_price * closed.shares)

    def _update_equity_curve(self, bar: Bar) -> None:
        """Update equity curve with current market values"""
        # Calculate unrealized P&L from open positions
        unrealized_pnl = sum(
            pos.unrealized_pnl(bar.close) for pos in self.open_positions
        )

        # Calculate total equity
        total_equity = self.capital + unrealized_pnl

        self.equity_curve.append({
            'date': bar.date,
            'equity': total_equity,
            'drawdown': self._calculate_drawdown(total_equity)
        })

    def _calculate_drawdown(self, current_equity: float) -> float:
        """Calculate current drawdown percentage"""
        if not self.equity_curve:
            return 0.0

        peak = max(point['equity'] for point in self.equity_curve)
        if peak == 0:
            return 0.0

        drawdown = (current_equity - peak) / peak
        return drawdown

    def _calculate_performance(self) -> Dict[str, Any]:
        """Calculate comprehensive performance metrics"""
        if not self.closed_trades:
            return self._empty_results()

        # Basic metrics
        final_equity = self.equity_curve[-1]['equity']
        total_return = (final_equity - self.initial_capital) / self.initial_capital

        # Trade analysis
        winning_trades = [t for t in self.closed_trades if t.pnl > 0]
        losing_trades = [t for t in self.closed_trades if t.pnl < 0]

        win_rate = len(winning_trades) / len(self.closed_trades) if self.closed_trades else 0

        avg_win = sum(t.pnl for t in winning_trades) / len(winning_trades) if winning_trades else 0
        avg_loss = sum(t.pnl for t in losing_trades) / len(losing_trades) if losing_trades else 0

        total_wins = sum(t.pnl for t in winning_trades)
        total_losses = abs(sum(t.pnl for t in losing_trades))
        profit_factor = total_wins / total_losses if total_losses > 0 else 0

        # Calculate expectancy
        expectancy = (win_rate * avg_win) + ((1 - win_rate) * avg_loss)

        # Calculate max drawdown
        max_dd = min(point['drawdown'] for point in self.equity_curve)

        # Calculate Sharpe Ratio (simplified)
        returns = []
        for i in range(1, len(self.equity_curve)):
            ret = (self.equity_curve[i]['equity'] - self.equity_curve[i-1]['equity']) / \
                  self.equity_curve[i-1]['equity']
            returns.append(ret)

        if returns:
            avg_return = sum(returns) / len(returns)
            std_return = (sum((r - avg_return) ** 2 for r in returns) / len(returns)) ** 0.5
            sharpe = (avg_return / std_return * (252 ** 0.5)) if std_return > 0 else 0
        else:
            sharpe = 0

        # Calculate CAGR (simplified - assumes 1 year)
        days = len(self.equity_curve)
        years = days / 252  # Trading days
        cagr = ((final_equity / self.initial_capital) ** (1 / years) - 1) if years > 0 else 0

        # Get risk management stats
        risk_stats = self.risk_manager.get_statistics()

        return {
            'backtest': {
                'id': f'bt_{int(datetime.now().timestamp())}',
                'performance': {
                    'totalReturn': round(total_return, 4),
                    'cagr': round(cagr, 4),
                    'sharpeRatio': round(sharpe, 2),
                    'maxDrawdown': round(max_dd, 4),
                    'winRate': round(win_rate, 4),
                    'profitFactor': round(profit_factor, 2),
                    'totalTrades': len(self.closed_trades),
                    'winningTrades': len(winning_trades),
                    'losingTrades': len(losing_trades),
                    'avgWin': round(avg_win, 2),
                    'avgLoss': round(avg_loss, 2),
                    'expectancy': round(expectancy, 2),
                    # Risk management metrics
                    'totalCommissions': risk_stats['totalCommissionPaid'],
                    'totalSlippageCost': risk_stats['totalSlippageCost'],
                    'stopLossTrades': risk_stats['stopLossExits'],
                    'takeProfitTrades': risk_stats['takeProfitExits'],
                },
                'trades': [t.to_dict() for t in self.closed_trades],
                'equityCurve': self.equity_curve,
                'createdAt': datetime.now().isoformat()
            }
        }

    def _empty_results(self) -> Dict[str, Any]:
        """Return empty results structure"""
        return {
            'backtest': {
                'id': f'bt_{int(datetime.now().timestamp())}',
                'performance': {},
                'trades': [],
                'equityCurve': self.equity_curve,
                'createdAt': datetime.now().isoformat()
            }
        }

    def _print_summary(self, results: Dict[str, Any]) -> None:
        """Print backtest summary to console"""
        perf = results['backtest']['performance']

        print(f"\nPerformance Metrics:")
        print(f"  Total Return: {perf.get('totalReturn', 0) * 100:.2f}%")
        print(f"  CAGR: {perf.get('cagr', 0) * 100:.2f}%")
        print(f"  Sharpe Ratio: {perf.get('sharpeRatio', 0):.2f}")
        print(f"  Max Drawdown: {perf.get('maxDrawdown', 0) * 100:.2f}%")
        print(f"  Win Rate: {perf.get('winRate', 0) * 100:.2f}%")
        print(f"  Profit Factor: {perf.get('profitFactor', 0):.2f}")

        print(f"\nTrade Statistics:")
        print(f"  Total Trades: {perf.get('totalTrades', 0)}")
        print(f"  Winning Trades: {perf.get('winningTrades', 0)}")
        print(f"  Losing Trades: {perf.get('losingTrades', 0)}")
        print(f"  Avg Win: ${perf.get('avgWin', 0):.2f}")
        print(f"  Avg Loss: ${perf.get('avgLoss', 0):.2f}")
        print(f"  Expectancy: ${perf.get('expectancy', 0):.2f}")

        print(f"\nRisk Management Impact:")
        print(f"  Total Commissions: ${perf.get('totalCommissions', 0):.2f}")
        print(f"  Total Slippage Cost: ${perf.get('totalSlippageCost', 0):.2f}")
        print(f"  Stop Loss Exits: {perf.get('stopLossTrades', 0)}")
        print(f"  Take Profit Exits: {perf.get('takeProfitTrades', 0)}")

        total_cost = perf.get('totalCommissions', 0) + perf.get('totalSlippageCost', 0)
        cost_pct = (total_cost / self.initial_capital) * 100
        print(f"  Total Risk Cost: ${total_cost:.2f} ({cost_pct:.2f}% of initial capital)")


def generate_sample_data(days: int = 252) -> List[Bar]:
    """Generate sample OHLC data for testing"""
    bars = []
    base_price = 150.0
    date = datetime(2023, 1, 1)

    for _ in range(days):
        # Random walk
        change = random.uniform(-2, 2)
        open_price = base_price
        close_price = base_price + change
        high_price = max(open_price, close_price) + random.uniform(0, 1)
        low_price = min(open_price, close_price) - random.uniform(0, 1)

        bar = Bar(
            date=date.strftime('%Y-%m-%d'),
            open=round(open_price, 2),
            high=round(high_price, 2),
            low=round(low_price, 2),
            close=round(close_price, 2),
            volume=random.randint(1000000, 5000000)
        )
        bars.append(bar)

        base_price = close_price
        date += timedelta(days=1)

    return bars


if __name__ == "__main__":
    print("=" * 80)
    print("BACKTESTER PRO - Risk Management Example")
    print("=" * 80)

    # Generate sample data
    historical_data = generate_sample_data(days=252)  # 1 year of data

    # Create strategy
    strategy = SMAStrategy(fast_period=10, slow_period=30)

    # Define risk parameters (matching frontend)
    risk_params = {
        'commission': 0.50,      # $0.50 per trade
        'slippage': 0.05,        # 0.05% slippage
        'stopLoss': 2.0,         # 2% stop loss
        'takeProfit': 5.0,       # 5% take profit
        'positionSize': 100,     # 100% of capital
        'maxPositions': 1        # 1 position at a time
    }

    # Create and run backtest
    engine = BacktestEngine(
        strategy=strategy,
        initial_capital=10000,
        risk_params=risk_params
    )

    results = engine.run(historical_data)

    # Results are now in format ready for API response
    print("\n" + "=" * 80)
    print("API Response Format:")
    print("=" * 80)
    print(f"Backtest ID: {results['backtest']['id']}")
    print(f"Total Trades: {len(results['backtest']['trades'])}")
    print(f"Equity Points: {len(results['backtest']['equityCurve'])}")
