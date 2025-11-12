# OMEGA Frontend - Quick Reference Guide

## Overview Summary

The OMEGA trading web application is a **Next.js 15 + React 18** professional trading backtesting platform with integrated AI analysis. It's fully Spanish-language and uses a modern, dark-themed UI.

---

## Key Numbers

- **11 UI Component Types** (Shadcn/Radix primitives)
- **30+ Specialized Components** (trading, charting, AI)
- **9 Charting Components** (technical indicators)
- **19 Pages/Routes** total (9 dashboard pages)
- **3 Subscription Tiers** (Free, Professional, Enterprise)
- **3 Main Charting Libraries** (Recharts, Lightweight-charts, Chart.js)

---

## Most Important Files

### Core Pages (Most Traffic)
1. `/src/app/dashboard/backtest/page.tsx` (1,425 lines) - Main feature
2. `/src/app/dashboard/page.tsx` (458 lines) - Dashboard home
3. `/src/app/dashboard/layout.tsx` - Navigation & sidebar

### Core Libraries
1. `/src/lib/types.ts` - TypeScript interfaces
2. `/src/lib/api.ts` - HTTP client
3. `/src/lib/transformBacktest.ts` - Data transformation
4. `/src/lib/omega.ts` - AI client

### Key Components
1. `/src/components/charts/equity-curve.tsx` - Main chart
2. `/src/components/ai/ai-insights.tsx` - AI analysis
3. `/src/components/risk-*.tsx` (4 files) - Risk management

---

## Tech Stack (Simplified)

```
Frontend Framework:    Next.js 15 + React 18 + TypeScript
Styling:              TailwindCSS + Framer Motion (animations)
Charts:               Recharts (primary), Lightweight-charts (pro)
Icons:                Lucide React (550+)
UI Library:           Shadcn/Radix (primitives)
HTTP:                 Axios
State:                React Context + React Query
Forms:                Zod (validation)
PDF Export:           jsPDF + html2canvas
```

---

## Page Structure (19 Routes)

### Authentication (5)
```
/login
/register
/forgot-password
/pricing
/ (landing)
```

### Dashboard (9)
```
/dashboard (home)
/dashboard/backtest ⭐ MAIN
/dashboard/strategies [PRO]
/dashboard/optimizer [PRO]
/dashboard/history
/dashboard/watchlist
/dashboard/settings
/dashboard/ai-copilot [ENTERPRISE]
/dashboard/auto-loop [ENTERPRISE]
```

### Analysis (4) [PRO]
```
/dashboard/analysis/monte-carlo
/dashboard/analysis/walk-forward
/dashboard/analysis/risk-metrics
/dashboard/analysis/correlation
```

---

## Component Categories (30+)

### UI Primitives (11)
Button, Card, Input, Label, Select, Slider, Table, Tabs, Tooltip, Skeleton, Toast

### Charts (9)
1. Equity Curve (Recharts)
2. Candlestick (lightweight-charts)
3. Drawdown (Recharts)
4. Returns Distribution
5. Underwater Chart
6. RSI Chart
7. MACD Chart
8. Bollinger Bands
9. ATR & Stochastic

### AI Components (4)
- AIInsights (A+ to F grading, 10-layer analysis)
- QuantumRisk (0-100 score)
- AIOptimizer (parameter suggestions)
- PredictiveScore (pre-backtest prediction)

### Risk Management (4)
- RiskAlerts (critical/warning/success)
- RiskCalculator (dynamic impact)
- RiskAIAdvisor (recommendations)
- RiskTooltip (explanations)

### Trading (5)
- MetricCard (KPI display)
- TradeTable (history)
- PerformanceHeatmap
- BacktestReplay (animated)
- StrategyComparison

### Utility (3)
- SymbolLogo
- ProFeature (gating)
- DevTierSwitcher

---

## Subscription Tiers

### FREE
- Basic backtest
- Standard metrics
- Equity curve & drawdown
- Trade table
- 5 backtests/month
- 5 watchlist symbols

### PROFESSIONAL ($29/mo)
- Unlimited backtests
- AI Insights ⭐
- Advanced indicators
- Analysis tools (Monte Carlo, Walk-forward)
- Parameter optimizer
- 50 watchlist symbols

### ENTERPRISE ($99/mo)
- Everything in Professional
- AI Copilot (24/7 chat)
- Auto-Loop (100 auto-backtests)
- Quantum Risk assessment
- Predictive Score
- Unlimited everything

---

## Feature Highlights

### 1. Comprehensive Backtesting
- Strategy selection (SMA, RSI, Trend)
- Dynamic parameters (sliders)
- Symbol selection with logos
- Timeframe selection (1min - 1d)
- Date range with presets
- Initial capital input

### 2. Advanced Risk Management
- Commission & slippage
- Stop loss & take profit
- Position sizing
- Trailing stops
- Daily loss limits
- Max drawdown limits
- Risk per trade
- Volatility-based sizing (ATR)

### 3. Results Visualization
- 8+ performance metrics
- 9 technical indicator charts
- Trade-by-trade replay
- Performance heatmaps
- Detailed trade table
- PDF export

### 4. AI Integration
- Master-analysis endpoint (10 layers)
- Strategy grading (A+ to F)
- Risk scoring (0-100)
- Parameter optimization
- Pre-backtest predictions
- Real-time recommendations

---

## Data Flow

```
User Form Input
    ↓
Validation (Zod)
    ↓
POST /api/backtest
    ↓
transformBacktest.ts (format response)
    ↓
setResult() (React state)
    ↓
Polygon.io API (load OHLC)
    ↓
AI Endpoints (optional)
    ↓
Render Charts & Metrics
```

---

## External APIs

1. **Polygon.io** - Market data (OHLC candlesticks)
2. **Stripe** - Payment processing
3. **OMEGA AI v6.1** - Master analysis (10-layer)
4. **Custom Backend** - Backtesting engine

---

## Development Notes

- **Language**: Spanish UI (es-ES)
- **Mode**: Client-heavy (use client directives)
- **Animations**: Framer Motion extensive
- **Responsive**: Mobile-first TailwindCSS
- **Dark Theme**: Always dark (no light mode)
- **Performance**: Lazy loading, skeletons, optimized renders

---

## File Size Reference

- Backtest Page: 1,425 lines (largest)
- Dashboard Page: 458 lines
- Equity Curve: ~120 lines
- AI Insights: ~150 lines
- Risk Components: 80-150 lines each

---

## Key Hooks

```typescript
use-tier()          // currentTier, canUseAI, isProfessional, isEnterprise
useAIEvents()      // AI event handling
useRouter()        // Next.js navigation
usePathname()      // Current route
useState()         // Form state, UI state
useEffect()        // Data fetching, subscriptions
```

---

## Color Palette

```
Primary:   Blue (bg-blue-600, text-blue-400)
Success:   Green (bg-green-500/20)
Warning:   Orange (bg-orange-500/20)
Error:     Red (bg-red-500/20)
Premium:   Purple/Pink (gradient)
Neutral:   Gray with transparency (bg-white/5)
```

---

## Performance Tips

1. Charts use Recharts (responsive)
2. Candlestick uses lightweight-charts (performant)
3. Skeleton loaders during fetch
4. Toast for async feedback
5. LazyLoad advanced indicators
6. Memoized component renders

---

## Common Import Paths

```typescript
// Components
@/components/ui/button
@/components/charts/equity-curve
@/components/ai/ai-insights
@/components/risk-alerts

// Libraries
@/lib/api
@/lib/types
@/lib/omega
@/lib/polygon

// Hooks
@/hooks/use-tier
@/contexts/AuthContext

// Icons
lucide-react
```

---

## Next Steps for Developers

1. Review `/src/app/dashboard/backtest/page.tsx` for main flow
2. Check `/src/lib/types.ts` for data structures
3. Study `/src/components/ui/` for base components
4. Look at `/src/components/charts/` for charting patterns
5. Review `/src/lib/api.ts` for API client setup

---

## Support Files Created

- `FRONTEND_STRUCTURE_ANALYSIS.md` - Detailed 11-section analysis
- `FRONTEND_COMPONENT_DIAGRAM.txt` - ASCII architecture diagram
- `QUICK_FRONTEND_REFERENCE.md` - This file

All files are in the project root directory.
