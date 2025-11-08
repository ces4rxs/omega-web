"""
Risk Management Module for Backtester Pro
==========================================

This module provides production-ready risk management functionality for backtesting.
It handles:
- Commission costs
- Slippage simulation
- Stop Loss execution
- Take Profit execution
- Position sizing
- Concurrent position limits

Usage:
    from risk_management import RiskManager, Position

    risk_manager = RiskManager(
        commission=0.50,
        slippage=0.05,
        stop_loss=2.0,
        take_profit=5.0,
        position_size=100,
        max_positions=1
    )

    # In backtest loop
    position = risk_manager.open_position(
        price=150.00,
        capital=10000,
        date='2024-01-15'
    )

    # Check exits on each bar
    should_exit, exit_price, reason = risk_manager.check_exit(position, bar)
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Tuple, List
import math


@dataclass
class Bar:
    """OHLC Bar data structure"""
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int = 0


@dataclass
class Position:
    """Trading position with risk management tracking"""
    entry_price: float
    shares: int
    entry_date: str
    side: str = 'long'  # 'long' or 'short'

    # Risk management fields
    stop_loss_price: Optional[float] = None
    take_profit_price: Optional[float] = None
    commission_paid: float = 0.0
    slippage_cost: float = 0.0

    # Exit tracking
    exit_price: Optional[float] = None
    exit_date: Optional[str] = None
    exit_reason: Optional[str] = None  # 'strategy', 'stop_loss', 'take_profit'

    # Performance
    pnl: float = 0.0
    pnl_percent: float = 0.0

    @property
    def is_closed(self) -> bool:
        return self.exit_price is not None

    def unrealized_pnl(self, current_price: float) -> float:
        """Calculate unrealized P&L at current price"""
        if self.is_closed:
            return self.pnl

        if self.side == 'long':
            return (current_price - self.entry_price) * self.shares
        else:  # short
            return (self.entry_price - current_price) * self.shares

    def calculate_pnl(self) -> None:
        """Calculate final P&L after position is closed"""
        if not self.is_closed:
            raise ValueError("Cannot calculate PnL for open position")

        if self.side == 'long':
            gross_pnl = (self.exit_price - self.entry_price) * self.shares
        else:  # short
            gross_pnl = (self.entry_price - self.exit_price) * self.shares

        # Deduct costs
        self.pnl = gross_pnl - self.commission_paid - self.slippage_cost
        self.pnl_percent = (self.pnl / (self.entry_price * self.shares)) * 100

    def to_dict(self) -> dict:
        """Convert position to API response format"""
        return {
            'entryDate': self.entry_date,
            'exitDate': self.exit_date,
            'entryPrice': self.entry_price,
            'exitPrice': self.exit_price,
            'shares': self.shares,
            'side': self.side,
            'pnl': round(self.pnl, 2),
            'pnlPercent': round(self.pnl_percent, 2),
            'commissionCost': round(self.commission_paid, 2),
            'slippageCost': round(self.slippage_cost, 2),
            'exitReason': self.exit_reason
        }


class RiskManager:
    """
    Risk Management Engine for Backtesting

    Handles all risk management features including commission, slippage,
    stop loss, take profit, and position sizing.
    """

    def __init__(
        self,
        commission: float = 0.0,
        slippage: float = 0.0,
        stop_loss: Optional[float] = None,
        take_profit: Optional[float] = None,
        position_size: float = 100.0,
        max_positions: int = 1
    ):
        """
        Initialize Risk Manager

        Args:
            commission: Dollar amount per trade (e.g., 0.50)
            slippage: Percentage slippage (e.g., 0.05 = 0.05%)
            stop_loss: Stop loss percentage (e.g., 2.0 = 2%)
            take_profit: Take profit percentage (e.g., 5.0 = 5%)
            position_size: Percentage of capital per trade (e.g., 100 = 100%)
            max_positions: Maximum concurrent positions allowed
        """
        self.commission = commission
        self.slippage = slippage
        self.stop_loss_pct = stop_loss
        self.take_profit_pct = take_profit
        self.position_size_pct = position_size
        self.max_positions = max_positions

        # Statistics tracking
        self.total_commission_paid = 0.0
        self.total_slippage_cost = 0.0
        self.stop_loss_exits = 0
        self.take_profit_exits = 0

    def apply_slippage(self, price: float, direction: str) -> float:
        """
        Apply slippage to execution price

        Slippage always works against the trader:
        - Buying: pay more
        - Selling: receive less

        Args:
            price: Intended execution price
            direction: 'buy' or 'sell'

        Returns:
            Actual execution price with slippage
        """
        if self.slippage == 0:
            return price

        slippage_multiplier = self.slippage / 100.0

        if direction == 'buy':
            return price * (1 + slippage_multiplier)
        else:  # sell
            return price * (1 - slippage_multiplier)

    def calculate_position_size(
        self,
        capital: float,
        price: float,
        open_positions: int = 0
    ) -> int:
        """
        Calculate number of shares to buy based on position sizing rules

        Args:
            capital: Current account equity
            price: Entry price per share
            open_positions: Number of currently open positions

        Returns:
            Number of shares to purchase (floor to avoid fractional shares)
        """
        # Check if we can open a new position
        if open_positions >= self.max_positions:
            return 0

        # Calculate capital allocation per position
        capital_per_position = capital * (self.position_size_pct / 100.0)

        # If max_positions > 1, divide capital among positions
        if self.max_positions > 1:
            capital_per_position /= self.max_positions

        # Calculate shares (floor to integer)
        shares = int(capital_per_position / price)

        return shares

    def calculate_stop_loss_price(self, entry_price: float, side: str) -> Optional[float]:
        """Calculate stop loss price based on entry price and side"""
        if self.stop_loss_pct is None:
            return None

        if side == 'long':
            return entry_price * (1 - self.stop_loss_pct / 100.0)
        else:  # short
            return entry_price * (1 + self.stop_loss_pct / 100.0)

    def calculate_take_profit_price(self, entry_price: float, side: str) -> Optional[float]:
        """Calculate take profit price based on entry price and side"""
        if self.take_profit_pct is None:
            return None

        if side == 'long':
            return entry_price * (1 + self.take_profit_pct / 100.0)
        else:  # short
            return entry_price * (1 - self.take_profit_pct / 100.0)

    def open_position(
        self,
        price: float,
        capital: float,
        date: str,
        side: str = 'long',
        open_positions: int = 0
    ) -> Optional[Position]:
        """
        Open a new position with risk management

        Args:
            price: Current market price
            capital: Available capital
            date: Entry date
            side: 'long' or 'short'
            open_positions: Number of currently open positions

        Returns:
            Position object if opened, None if position limit reached
        """
        # Calculate position size
        shares = self.calculate_position_size(capital, price, open_positions)

        if shares == 0:
            return None

        # Apply slippage to entry price
        entry_price_with_slippage = self.apply_slippage(price, 'buy' if side == 'long' else 'sell')

        # Calculate slippage cost
        slippage_cost = abs(entry_price_with_slippage - price) * shares

        # Create position
        position = Position(
            entry_price=entry_price_with_slippage,
            shares=shares,
            entry_date=date,
            side=side,
            stop_loss_price=self.calculate_stop_loss_price(entry_price_with_slippage, side),
            take_profit_price=self.calculate_take_profit_price(entry_price_with_slippage, side),
            commission_paid=self.commission,  # Entry commission
            slippage_cost=slippage_cost
        )

        # Track statistics
        self.total_commission_paid += self.commission
        self.total_slippage_cost += slippage_cost

        return position

    def check_stop_loss(self, position: Position, bar: Bar) -> Tuple[bool, Optional[float]]:
        """
        Check if stop loss should be triggered

        Uses LOW for long positions, HIGH for short positions

        Args:
            position: Open position
            bar: Current OHLC bar

        Returns:
            (should_exit, exit_price) tuple
        """
        if position.stop_loss_price is None:
            return (False, None)

        if position.side == 'long':
            # Check if LOW hit stop loss
            if bar.low <= position.stop_loss_price:
                return (True, position.stop_loss_price)
        else:  # short
            # Check if HIGH hit stop loss
            if bar.high >= position.stop_loss_price:
                return (True, position.stop_loss_price)

        return (False, None)

    def check_take_profit(self, position: Position, bar: Bar) -> Tuple[bool, Optional[float]]:
        """
        Check if take profit should be triggered

        Uses HIGH for long positions, LOW for short positions

        Args:
            position: Open position
            bar: Current OHLC bar

        Returns:
            (should_exit, exit_price) tuple
        """
        if position.take_profit_price is None:
            return (False, None)

        if position.side == 'long':
            # Check if HIGH hit take profit
            if bar.high >= position.take_profit_price:
                return (True, position.take_profit_price)
        else:  # short
            # Check if LOW hit take profit
            if bar.low <= position.take_profit_price:
                return (True, position.take_profit_price)

        return (False, None)

    def check_exit(
        self,
        position: Position,
        bar: Bar
    ) -> Tuple[bool, Optional[float], Optional[str]]:
        """
        Check all exit conditions for a position

        Priority order:
        1. Stop Loss (risk management first)
        2. Take Profit

        Args:
            position: Open position
            bar: Current OHLC bar

        Returns:
            (should_exit, exit_price, exit_reason) tuple
        """
        # Priority 1: Stop Loss
        sl_triggered, sl_price = self.check_stop_loss(position, bar)
        if sl_triggered:
            self.stop_loss_exits += 1
            return (True, sl_price, 'stop_loss')

        # Priority 2: Take Profit
        tp_triggered, tp_price = self.check_take_profit(position, bar)
        if tp_triggered:
            self.take_profit_exits += 1
            return (True, tp_price, 'take_profit')

        return (False, None, None)

    def close_position(
        self,
        position: Position,
        price: float,
        date: str,
        reason: str = 'strategy'
    ) -> Position:
        """
        Close an open position

        Args:
            position: Position to close
            price: Exit price (before slippage)
            date: Exit date
            reason: Exit reason ('strategy', 'stop_loss', 'take_profit')

        Returns:
            Closed position with P&L calculated
        """
        # Apply slippage to exit price
        exit_price_with_slippage = self.apply_slippage(
            price,
            'sell' if position.side == 'long' else 'buy'
        )

        # Calculate exit slippage cost
        exit_slippage = abs(exit_price_with_slippage - price) * position.shares

        # Update position
        position.exit_price = exit_price_with_slippage
        position.exit_date = date
        position.exit_reason = reason
        position.commission_paid += self.commission  # Add exit commission
        position.slippage_cost += exit_slippage

        # Calculate final P&L
        position.calculate_pnl()

        # Track statistics
        self.total_commission_paid += self.commission
        self.total_slippage_cost += exit_slippage

        return position

    def get_statistics(self) -> dict:
        """
        Get risk management statistics

        Returns:
            Dictionary with risk management stats
        """
        return {
            'totalCommissionPaid': round(self.total_commission_paid, 2),
            'totalSlippageCost': round(self.total_slippage_cost, 2),
            'stopLossExits': self.stop_loss_exits,
            'takeProfitExits': self.take_profit_exits,
            'totalRiskCost': round(self.total_commission_paid + self.total_slippage_cost, 2)
        }


# Example usage
if __name__ == "__main__":
    # Initialize risk manager
    risk_mgr = RiskManager(
        commission=0.50,
        slippage=0.05,
        stop_loss=2.0,
        take_profit=5.0,
        position_size=100,
        max_positions=1
    )

    # Simulate opening a position
    capital = 10000
    entry_bar = Bar(
        date='2024-01-15',
        open=150.0,
        high=152.0,
        low=149.0,
        close=151.0
    )

    position = risk_mgr.open_position(
        price=entry_bar.close,
        capital=capital,
        date=entry_bar.date,
        side='long',
        open_positions=0
    )

    print(f"Position opened:")
    print(f"  Entry Price: ${position.entry_price:.2f}")
    print(f"  Shares: {position.shares}")
    print(f"  Stop Loss: ${position.stop_loss_price:.2f}")
    print(f"  Take Profit: ${position.take_profit_price:.2f}")
    print(f"  Entry Commission: ${position.commission_paid:.2f}")
    print(f"  Entry Slippage: ${position.slippage_cost:.2f}")

    # Simulate some bars
    bars = [
        Bar('2024-01-16', 151.5, 153.0, 150.0, 152.0),
        Bar('2024-01-17', 152.0, 154.0, 151.0, 153.5),
        Bar('2024-01-18', 153.5, 159.0, 153.0, 158.5),  # Should hit take profit
    ]

    for bar in bars:
        should_exit, exit_price, reason = risk_mgr.check_exit(position, bar)
        if should_exit:
            print(f"\nExit triggered on {bar.date}:")
            print(f"  Reason: {reason}")
            print(f"  Exit Price: ${exit_price:.2f}")

            # Close position
            closed_position = risk_mgr.close_position(position, exit_price, bar.date, reason)

            print(f"\nPosition closed:")
            print(f"  P&L: ${closed_position.pnl:.2f} ({closed_position.pnl_percent:.2f}%)")
            print(f"  Total Commission: ${closed_position.commission_paid:.2f}")
            print(f"  Total Slippage: ${closed_position.slippage_cost:.2f}")
            break

    # Print statistics
    print("\nRisk Management Statistics:")
    stats = risk_mgr.get_statistics()
    for key, value in stats.items():
        print(f"  {key}: {value}")
