# OMEGA Trading Web Application - Frontend Structure Summary

## 1. TECH STACK

### Core Framework & Libraries
- **Framework**: Next.js 15.0.3 (React 18.3.1)
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 3.4.13 + TailwindCSS Animate
- **Build Tool**: Next.js with TypeScript support

### UI & Component Libraries
- **Radix UI**: React Tooltip (@radix-ui/react-tooltip)
- **Icons**: Lucide React (550+ icons)
- **Animations**: Framer Motion 12.23.24
- **Class Utils**: clsx, tailwind-merge, class-variance-authority

### Charting Libraries
1. **Recharts 3.3.0** - Main charting library (Area, Line, Bar charts)
2. **Chart.js 4.5.1** + **React-ChartJS-2 5.3.0** - Alternative charting
3. **Lightweight-charts 5.0.9** - Professional candlestick/OHLC charts

### Data & State Management
- **React Query**: @tanstack/react-query 5.90.7 (Server state)
- **SWR**: 2.3.6 (Alternative data fetching)
- **Axios**: 1.12.2 (HTTP client)

### Additional Libraries
- **PDF Export**: jspdf 3.0.3 + html2canvas 1.4.1
- **Validation**: Zod 3.25.76 (Schema validation)

---

## 2. PROJECT STRUCTURE

```
/src
├── /app                          # Next.js 15 App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home/landing page
│   │
│   ├── /dashboard               # Protected dashboard area
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   ├── page.tsx            # Dashboard home
│   │   │
│   │   ├── /backtest           # Backtest execution page
│   │   ├── /strategies         # Custom strategies management
│   │   ├── /optimizer          # Parameter optimizer (PRO)
│   │   ├── /history            # Backtest history
│   │   ├── /watchlist          # Symbol watchlist
│   │   ├── /settings           # User settings
│   │   ├── /ai-copilot         # AI copilot chat (ENTERPRISE)
│   │   ├── /auto-loop          # Auto backtest runner (ENTERPRISE)
│   │   │
│   │   └── /analysis           # Advanced analysis (PRO)
│   │       ├── /monte-carlo    # Monte Carlo simulation
│   │       ├── /walk-forward   # Walk-forward analysis
│   │       ├── /risk-metrics   # Risk metric analysis
│   │       └── /correlation    # Correlation analysis
│   │
│   ├── /auth
│   │   ├── /login              # Login page
│   │   ├── /register           # Registration page
│   │   └── /forgot-password    # Password reset
│   │
│   ├── /pricing                # Pricing page
│   └── /analysis               # Public analysis page
│
├── /components                  # Reusable React components
│   ├── /ui                     # Shadcn/Radix UI components library
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── slider.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── tooltip.tsx
│   │   ├── skeleton.tsx
│   │   └── toast.tsx
│   │
│   ├── /charts                 # Charting components (specialized)
│   │   ├── equity-curve.tsx        (Recharts - Area chart)
│   │   ├── candlestick-chart.tsx   (Lightweight-charts)
│   │   ├── drawdown-chart.tsx      (Recharts - Area)
│   │   ├── returns-distribution.tsx
│   │   ├── underwater-chart.tsx    (Drawdown over time)
│   │   ├── rsi-chart.tsx          (Technical indicator)
│   │   ├── macd-chart.tsx         (Technical indicator)
│   │   ├── bollinger-bands-chart.tsx
│   │   ├── atr-chart.tsx          (Average True Range)
│   │   └── stochastic-chart.tsx   (Stochastic indicator)
│   │
│   ├── /ai                     # AI-powered components
│   │   ├── ai-insights.tsx        (Strategy analysis - 10 layers)
│   │   ├── quantum-risk.tsx       (Advanced risk assessment 0-100)
│   │   ├── ai-optimizer.tsx       (Parameter optimization)
│   │   └── predictive-score.tsx   (Pre-backtest prediction)
│   │
│   ├── backtest-replay.tsx    # Animated backtest replay
│   ├── strategy-comparison.tsx # Side-by-side comparison
│   ├── performance-heatmap.tsx # Monthly/daily heatmaps
│   ├── metric-card.tsx        # KPI display cards
│   ├── trade-table.tsx        # Trade history table
│   ├── risk-alerts.tsx        # Risk warning alerts
│   ├── risk-calculator.tsx    # Risk impact calculator
│   ├── risk-ai-advisor.tsx    # AI risk recommendations
│   ├── risk-tooltip.tsx       # Risk metric tooltips
│   ├── symbol-logo.tsx        # Stock symbol logos
│   ├── theme-toggle.tsx       # Dark/light mode toggle
│   ├── dev-tier-switcher.tsx  # Subscription tier selector
│   ├── pro-feature.tsx        # Feature gating component
│   ├── providers.tsx          # Context/provider setup
│   │
│   ├── OmegaFeatures.tsx      # Landing page features
│   ├── OmegaPricing.tsx       # Pricing page component
│   ├── OmegaDifferentiators.tsx
│   └── OptimizerOverlay.tsx
│
├── /contexts                   # React Context API
│   ├── AuthContext.tsx        # Authentication state
│   └── theme-context.tsx      # Theme management
│
├── /hooks                      # Custom React hooks
│   ├── use-tier.tsx          # Subscription tier logic
│   └── useAIEvents.ts        # AI event handling
│
├── /lib                        # Utility functions & services
│   ├── api.ts                # Axios instance & HTTP client
│   ├── auth.ts               # Authentication utilities
│   ├── auth-helpers.ts       # Auth helper functions
│   ├── types.ts              # TypeScript interfaces
│   ├── omega.ts              # Omega AI client (v10.3-B)
│   ├── grades.ts             # AI grading system (A+ to F)
│   ├── polygon.ts            # Polygon.io market data API
│   ├── marketData.ts         # Market data utilities
│   ├── strategies.ts         # Strategy definitions
│   ├── stripe.ts             # Stripe payment integration
│   ├── pdf-export.ts         # PDF export functionality
│   ├── transformBacktest.ts  # Backtest data transformation
│   └── utils.ts              # General utilities
│
├── /styles
│   └── globals.css           # Global Tailwind styles
│
└── /public                    # Static assets
    └── [images, icons, etc]
```

---

## 3. UI COMPONENTS CATALOG

### Base Components (Shadcn/Radix)
These are fully customized versions of Shadcn UI primitives:
- **Button**: Multiple variants (default, outline, ghost, etc.)
- **Card**: CardHeader, CardTitle, CardDescription, CardContent
- **Input**: Text input with custom styling
- **Label**: Form labels with styling
- **Select**: Dropdown select component
- **Slider**: Range slider for numeric inputs
- **Table**: Styled table component
- **Tabs**: Tab navigation component
- **Tooltip**: Hover tooltips (Radix-based)
- **Skeleton**: Loading placeholder skeletons
- **Toast**: Notification system

### Feature-Specific Components

#### Charting Components (9 types)
1. **Equity Curve** - Portfolio value over time (Recharts)
2. **Candlestick Chart** - OHLC price data (lightweight-charts)
3. **Drawdown Chart** - Maximum loss from peak
4. **Returns Distribution** - Win/loss histogram
5. **Underwater Chart** - Time spent in drawdown
6. **RSI Chart** - Relative Strength Index indicator
7. **MACD Chart** - Moving Average Convergence/Divergence
8. **Bollinger Bands Chart** - Volatility bands visualization
9. **ATR & Stochastic Charts** - Advanced technical indicators

#### Trading & Backtest Components
- **MetricCard**: KPI display (returns, Sharpe ratio, win rate, etc.)
- **TradeTable**: Detailed trade history with entry/exit points
- **PerformanceHeatmap**: Daily/monthly return heatmaps
- **BacktestReplay**: Animated playback of trades
- **StrategyComparison**: Side-by-side metric comparison

#### Risk Management Components
- **RiskAlerts**: Critical/warning/success alert boxes
- **RiskCalculator**: Calculate impact of risk settings
- **RiskAIAdvisor**: AI recommendations for risk management
- **RiskTooltip**: Explanatory tooltips for risk metrics

#### AI Components
- **AIInsights**: Strategy analysis with A+ to F grading
- **QuantumRisk**: Risk score 0-100 assessment
- **AIOptimizer**: Parameter optimization suggestions
- **PredictiveScore**: Pre-backtest performance prediction

#### Utility Components
- **SymbolLogo**: Stock ticker logos
- **ProFeature**: Feature gating for premium features
- **DevTierSwitcher**: Dev-only tier switching tool
- **ThemeToggle**: Dark/light mode switcher

---

## 4. PAGE STRUCTURE & ROUTING

### Authentication Pages
- `GET /` → Landing page
- `GET /login` → User login
- `GET /register` → User registration
- `GET /forgot-password` → Password reset
- `GET /pricing` → Pricing page

### Dashboard (Protected Routes)
- `GET /dashboard` → Dashboard home with metrics
- `GET /dashboard/backtest` → Backtest execution
- `GET /dashboard/strategies` → Strategy management (PRO)
- `GET /dashboard/optimizer` → Parameter optimization (PRO)
- `GET /dashboard/history` → Backtest history
- `GET /dashboard/watchlist` → Symbol watchlist
- `GET /dashboard/settings` → User settings
- `GET /dashboard/ai-copilot` → AI assistant chat (ENTERPRISE)
- `GET /dashboard/auto-loop` → Auto-runner (ENTERPRISE)

### Analysis Pages (PRO)
- `GET /dashboard/analysis/monte-carlo` → Monte Carlo simulation
- `GET /dashboard/analysis/walk-forward` → Walk-forward testing
- `GET /dashboard/analysis/risk-metrics` → Risk analysis
- `GET /dashboard/analysis/correlation` → Correlation matrix

---

## 5. TRADING STRATEGY UI

### Strategy Configuration
- **Strategy Selection**: Dropdown to choose from available strategies
  - smaCrossover (Simple Moving Average)
  - rsiMeanRevert (RSI Mean Reversion)
  - trend (Trend following)

### Strategy Parameters (Dynamic)
For **SMA Crossover**:
- Fast Period slider (5-50)
- Slow Period slider (20-200)

For **RSI Mean Reversion**:
- RSI Period slider (7-28)
- Overbought threshold (60-90)
- Oversold threshold (10-40)

### Risk Management Panel (Collapsible)
- **Basic Controls**:
  - Commission per trade ($)
  - Slippage (%)
  - Stop Loss (%)
  - Take Profit (%)
  - Position Sizing (% of capital)
  - Max Concurrent Positions

- **Advanced Controls**:
  - Trailing Stop (%)
  - Daily Loss Limit (%)
  - Max Drawdown Limit (%)
  - Risk Per Trade (%)
  - Volatility-Based Sizing (ATR)

### Backtest Configuration
- Symbol selection (AAPL, TSLA, GOOGL, etc.)
- Timeframe (1min, 5min, 15min, 1h, 1d)
- Date range picker with presets:
  - Last Month / 3 Months / 6 Months / 1 Year / YTD
- Initial capital input

---

## 6. CHARTING LIBRARIES USAGE

### Recharts (Primary - 70% of charts)
Used for:
- Equity curves (Area charts)
- Drawdown visualization
- Returns distribution (Bar charts)
- RSI indicator
- MACD indicator
- General time-series data

**Why Recharts**: 
- Responsive, mobile-friendly
- Easy to customize with TailwindCSS
- Great documentation
- Supports multiple chart types

### Lightweight-charts (Professional - 20%)
Used for:
- Candlestick charts (OHLC data)
- High-performance charting
- Trading platform-like experience

**Why Lightweight-charts**:
- Industry-standard for trading apps
- Lightweight (small bundle size)
- Highly performant
- Great for real-time data

### Chart.js (Fallback - 10%)
- Included but less commonly used
- Available for bar/pie charts if needed

---

## 7. KEY FEATURES BY SUBSCRIPTION TIER

### FREE Tier
- Basic backtest execution
- Standard metrics (Return, Sharpe, Win Rate, etc.)
- Equity curve & drawdown charts
- Trade history table
- 5 backtests/month limit
- Up to 5 watchlist symbols
- Limited analysis features

### PROFESSIONAL Tier
- Unlimited backtests
- AI Insights (10-layer analysis)
- Risk management with advanced controls
- Parameter optimizer
- Strategy comparison
- Advanced technical indicators (Bollinger, ATR, Stochastic)
- Monte Carlo simulation
- Walk-forward analysis
- Correlation analysis
- Risk metrics analysis
- Up to 50 watchlist symbols

### ENTERPRISE Tier
- All Professional features
- AI Copilot (24/7 chat)
- Auto-Loop (100 backtests automated)
- Quantum Risk assessment
- Predictive Score (pre-backtest prediction)
- Unlimited everything
- Priority support

---

## 8. DATA FLOW & API INTEGRATION

### Frontend → Backend Communication
```
User Input (Form)
    ↓
Form Validation (Zod)
    ↓
API Call (Axios) → /api/backtest
    ↓
Transform Response (transformBacktest.ts)
    ↓
Update State & Display Results
```

### External APIs Integrated
1. **Polygon.io** - Market data (OHLC candlestick data)
2. **Stripe** - Payment processing
3. **OMEGA AI v6.1** - Master analysis endpoint
4. **Custom Backend** - Backtesting engine

### Data Types
- `BacktestParams` - Input configuration
- `BacktestResult` - Results with performance metrics
- `EquityPoint` - Time-series equity data
- `Trade` - Individual trade details
- `PerformanceMetrics` - 20+ metric types

---

## 9. STYLING & THEMING

### Tailwind Configuration
- **Dark mode**: Class-based (always dark by default)
- **Custom colors**: Dark theme optimized
- **Breakpoints**: Mobile-first responsive design
- **Animations**: Using tailwindcss-animate plugin

### Color Palette
- Primary: Blues (bg-blue-600, text-blue-400)
- Success: Greens (bg-green-500/20)
- Warning/Risk: Oranges & Reds
- Neutral: Grays (bg-white/5 for transparency)
- Accents: Purples, Pinks (premium features)

### Animation Framework
- **Framer Motion** for:
  - Page transitions
  - Component entrance animations
  - Hover effects (whileHover, whileTap)
  - Staggered list animations
  - Loading states

---

## 10. DEVELOPMENT NOTES

### Language
- Fully Spanish language UI (es-ES)
- Spanish form labels, messages, errors

### Client Components
- Uses "use client" directive extensively (Next.js 15)
- Heavy client-side state management with React hooks

### Performance Considerations
- Lazy loading of advanced charts
- Skeleton loaders during data fetch
- Toast notifications for async operations
- Optimized re-renders with proper memoization

### Browser Support
- Modern browsers only (ES2020+)
- No IE11 support
- Mobile-responsive design

---

## 11. COMPONENT DEPENDENCIES SUMMARY

```
Core Dependencies:
├── next & react
├── typescript
├── framer-motion (animations)
├── tailwindcss (styling)
├── recharts (charting)
├── lightweight-charts (candlesticks)
├── lucide-react (icons)
├── axios (HTTP)
├── zod (validation)
└── @tanstack/react-query (state)

UI Library:
├── radix-ui (primitives)
├── class-variance-authority
├── clsx & tailwind-merge
└── tailwindcss-animate

Utility:
├── jspdf & html2canvas (PDF export)
└── [custom hooks & contexts]
```

