# Backtest Testing Checklist

## Pre-Testing Setup

### 1. Environment Configuration
- [ ] `.env.local` created with `NEXT_PUBLIC_POLYGON_API_KEY`
- [ ] Backend server running at `https://backtester-pro-1.onrender.com` (or configured in `src/lib/api.ts`)
- [ ] Valid authentication token (if required)

### 2. Start Development Server
```bash
npm run dev
```

Server should start at http://localhost:3000

## Testing Scenarios

### ✅ Scenario 1: Basic Backtest (No Risk Management)

**Steps:**
1. Navigate to `/dashboard/backtest`
2. Configure backtest:
   - Strategy: `smaCrossover`
   - Symbol: `AAPL`
   - Timeframe: `1 Día`
   - Start Date: `2023-01-01`
   - End Date: `2024-01-01`
   - Initial Capital: `10000`
3. Set strategy parameters:
   - Fast Period: `10`
   - Slow Period: `30`
4. Keep Risk Management section collapsed (OFF)
5. Click "Ejecutar Backtest"

**Expected Results:**
- [ ] Loading spinner appears
- [ ] Toast notification: "Iniciando backtest"
- [ ] No errors in console
- [ ] Results display after API call completes
- [ ] Performance metrics cards visible
- [ ] Equity curve chart renders
- [ ] Trade table shows trades

---

### ✅ Scenario 2: Backtest with Basic Risk Management

**Steps:**
1. Navigate to `/dashboard/backtest`
2. Configure same parameters as Scenario 1
3. Expand "Risk Management" section
4. Enable basic controls:
   - Commission: ON → `$0.50`
   - Slippage: ON → `0.05%`
   - Stop Loss: ON → `2%`
   - Take Profit: ON → `5%`
5. Click "Ejecutar Backtest"

**Expected Results:**
- [ ] Risk Calculator shows impact: ~$200 stop loss, ~$500 take profit
- [ ] Risk/Reward ratio displays: `2.50`
- [ ] Backtest executes successfully
- [ ] Performance metrics reflect risk management costs
- [ ] Trades show `exitReason` (stop_loss, take_profit, or strategy)
- [ ] Total return is lower than Scenario 1 (due to commission/slippage costs)

---

### ✅ Scenario 3: Backtest with Advanced Risk Management

**Steps:**
1. Navigate to `/dashboard/backtest`
2. Configure same base parameters
3. Expand "Risk Management" and "Controles Avanzados"
4. Enable advanced controls:
   - Commission: ON → `$0.50`
   - Slippage: ON → `0.05%`
   - Stop Loss: ON → `2%`
   - Take Profit: ON → `5%`
   - Trailing Stop: ON → `1.5%`
   - Daily Loss Limit: ON → `5%`
   - Max Drawdown Limit: ON → `15%`
   - Risk Per Trade: ON → `2%`
   - Volatility Sizing: ON → ATR Period: `14`, Multiplier: `2.0`
5. Click "Ejecutar Backtest"

**Expected Results:**
- [ ] Risk Calculator shows comprehensive impact
- [ ] Backend receives ALL risk parameters (check Network tab in DevTools)
- [ ] Backtest executes successfully
- [ ] If backend implements these features: Metrics reflect advanced controls
- [ ] If backend doesn't implement: Results same as Scenario 2 (parameters ignored gracefully)

**To Verify Payload:**
Open DevTools → Network → Find POST to `/api/backtest` → Check Request Payload contains:
```json
{
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
}
```

---

### ✅ Scenario 4: Educational Tooltips

**Steps:**
1. Hover over the ℹ️ icon next to "Comisión por Trade"
2. Hover over each risk control tooltip

**Expected Results:**
- [ ] Tooltip appears with title, description, example, and recommended values
- [ ] Tooltips work for all 10 risk controls
- [ ] No layout shifts or flickering

---

### ✅ Scenario 5: Risk Calculator Real-Time Updates

**Steps:**
1. Expand Risk Management section
2. Enable Stop Loss → `2%`
3. Change Initial Capital to `50000`
4. Observe Risk Calculator

**Expected Results:**
- [ ] Risk Calculator updates immediately (no delay)
- [ ] Shows: "Riesgo por trade: $1000.00 (2% del capital)"
- [ ] Enable Take Profit → `5%`
- [ ] Risk/Reward ratio appears: `2.50` with green checkmark
- [ ] Change Take Profit to `3%`
- [ ] Risk/Reward ratio updates: `1.50` with yellow warning

---

### ✅ Scenario 6: AI Risk Advisor (Professional/Enterprise Only)

**If you have Professional or Enterprise tier:**

**Steps:**
1. Expand Risk Management section
2. Enable Stop Loss: `1%` and Take Profit: `1.5%`
3. Observe AI Risk Advisor section

**Expected Results:**
- [ ] AI Risk Advisor appears below Risk Calculator
- [ ] Shows warning: "Risk/Reward ratio de 1:1.50 es bajo..."
- [ ] Provides actionable suggestions
- [ ] Sparkles icon indicates AI-powered feature

**If you have Free tier:**
- [ ] AI Risk Advisor does NOT appear

---

### ✅ Scenario 7: Results Display - Complete Features

**After successful backtest execution:**

**Expected Results:**
- [ ] **Performance Metrics:** 8 core metric cards display
- [ ] **Advanced Risk Metrics:** Additional 10+ advanced metrics (if available from backend)
- [ ] **Risk Alerts:** Intelligent alerts display based on performance
  - Critical alerts (red) for dangerous thresholds
  - Warning alerts (yellow) for suboptimal performance
  - Success alerts (green) for good performance
- [ ] **Equity Curve:** Line chart showing capital over time
- [ ] **Drawdown Chart:** Shows drawdown over time
- [ ] **Underwater Chart:** Shows time underwater (below peak equity)
- [ ] **Returns Distribution:** Histogram of trade returns
- [ ] **Candlestick Chart:** Price action with trade markers
- [ ] **Technical Indicators:** RSI, MACD, Bollinger Bands, ATR, Stochastic
- [ ] **Backtest Replay:** Interactive replay of trades
- [ ] **Performance Heatmaps:** Day-of-week and monthly heatmaps
- [ ] **Trade Table:** Scrollable table with all trades
- [ ] **Export PDF Button:** Functional PDF export

---

### ✅ Scenario 8: AI Features (Professional/Enterprise)

**If you have AI-enabled tier:**

**Expected Results:**
- [ ] **Predictive Score** (Enterprise only) appears BEFORE running backtest
- [ ] **AI Optimizer** (Professional+) shows optimization suggestions
- [ ] **AI Insights** (Professional+) provides strategy analysis AFTER backtest
- [ ] **Quantum Risk** (Professional+) shows risk analysis with probabilistic projections
- [ ] All AI cards show appropriate tier badges

---

### ✅ Scenario 9: Strategy Parameters

**Steps:**
1. Select strategy `smaCrossover`
2. Adjust sliders for Fast Period and Slow Period
3. Select strategy `rsiMeanRevert`
4. Adjust RSI parameters

**Expected Results:**
- [ ] Strategy parameters section appears dynamically based on selection
- [ ] Sliders work smoothly
- [ ] Values update in real-time
- [ ] Parameters are sent to backend correctly

---

### ✅ Scenario 10: Error Handling

**Test error scenarios:**

**A. Invalid Symbol:**
1. Enter symbol: `INVALID`
2. Run backtest

**Expected:**
- [ ] Error toast appears
- [ ] Descriptive error message from API
- [ ] Form remains usable (not stuck in loading state)

**B. Invalid Date Range:**
1. Set Start Date: `2024-01-01`
2. Set End Date: `2023-01-01` (end before start)
3. Run backtest

**Expected:**
- [ ] Backend error or validation message
- [ ] Error toast displays
- [ ] Form remains usable

**C. Backend Unavailable:**
1. Stop backend server
2. Run backtest

**Expected:**
- [ ] Network error caught gracefully
- [ ] Error toast: "No se pudo ejecutar el backtest"
- [ ] Console error logged (for debugging)
- [ ] Form remains usable

---

### ✅ Scenario 11: Mobile Responsiveness

**Test on mobile viewport (DevTools → Responsive Design Mode):**

**Expected Results:**
- [ ] Risk Management section is collapsible and works on mobile
- [ ] Forms adapt to single column on mobile
- [ ] Charts resize properly
- [ ] Tooltips work on mobile (tap instead of hover)
- [ ] All buttons are tappable (minimum 44x44px touch target)
- [ ] No horizontal scrolling
- [ ] Text remains readable

---

### ✅ Scenario 12: Performance

**Check performance metrics:**

**Expected Results:**
- [ ] Build size: ~541 kB for backtest page (acceptable for feature-rich page)
- [ ] Initial page load: < 3 seconds
- [ ] Backtest execution: Depends on backend response time
- [ ] No memory leaks (check DevTools → Performance → Memory)
- [ ] Charts render smoothly (60 FPS)
- [ ] Sliders respond instantly to input

---

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Console Checks

**Zero tolerance items (must fix):**
- [ ] No TypeScript errors
- [ ] No React key warnings
- [ ] No accessibility errors

**Acceptable items:**
- ⚠️ Warning: "NEXT_PUBLIC_POLYGON_API_KEY no está configurada" (if not configured)
- ⚠️ Info logs from development mode

---

## Network Tab Verification

**For a successful backtest, verify:**

1. **Request to `/api/backtest`:**
   - [ ] Method: POST
   - [ ] Status: 200
   - [ ] Request payload includes all parameters
   - [ ] Request payload includes complete `riskManagement` object

2. **Request to `/api/backtest/strategies`:**
   - [ ] Method: GET
   - [ ] Status: 200
   - [ ] Returns array of available strategies

3. **Polygon.io requests (if API key configured):**
   - [ ] Request to Polygon API for OHLC data
   - [ ] Status: 200
   - [ ] Candlestick data populates correctly

---

## Final Verification

Before considering the backtest section "complete":

### Core Functionality
- [ ] All 11 test scenarios pass
- [ ] Build compiles with no errors
- [ ] Zero critical console errors
- [ ] All charts render correctly

### Risk Management
- [ ] All 10 risk controls work
- [ ] Basic parameters are sent to backend
- [ ] Advanced parameters are sent to backend
- [ ] Risk Calculator updates in real-time
- [ ] Risk Alerts display intelligently
- [ ] AI Risk Advisor works (for Pro/Enterprise)

### Results Display
- [ ] All performance metrics display
- [ ] All charts render without errors
- [ ] Trade table is populated correctly
- [ ] PDF export works

### User Experience
- [ ] Tooltips are educational and helpful
- [ ] Forms are intuitive
- [ ] Loading states are clear
- [ ] Error messages are descriptive
- [ ] Mobile experience is solid

---

## Known Limitations

1. **Advanced Risk Management Backend Support:**
   - Frontend sends: ✅ Complete
   - Backend implements: 🚧 Partially (basic features only)
   - Action: Backend needs to implement advanced features (see `FRONTEND_BACKEND_INTEGRATION.md`)

2. **Polygon.io API:**
   - Requires paid API key for real data
   - Free tier: Uses simulated data
   - Action: Configure `NEXT_PUBLIC_POLYGON_API_KEY` in `.env.local`

3. **AI Features:**
   - Tier-gated (Professional & Enterprise only)
   - Free tier: AI features hidden
   - Action: This is by design (pricing strategy)

---

## Sign-Off

Once all checkboxes are complete, the backtest section is **production-ready** ✅

**Tested by:** _________________
**Date:** _________________
**Version:** _________________
**Notes:**
