// src/types/api.ts - Complete TypeScript types for backend API

// ==================== AUTHENTICATION ====================

export interface User {
  id: number;
  email: string;
  createdAt?: string;
  subscription?: UserSubscription;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ==================== SUBSCRIPTION ====================

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "unpaid"
  | "incomplete"
  | null;

export type SubscriptionPlan = "trader" | "professional" | "institutional" | null;

export interface UserSubscription {
  id: number;
  userId: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface CancelSubscriptionResponse {
  ok: boolean;
  subscription: UserSubscription;
}

// ==================== STRATEGIES ====================

export interface Strategy {
  id: number;
  userId: number;
  name: string;
  description?: string;
  symbol: string;
  timeframe: string;
  parameters: Record<string, any>;
  metrics?: StrategyMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface StrategyMetrics {
  sharpe?: number;
  sortino?: number;
  profitFactor?: number;
  mdd?: number;
  add?: number;
  winRate?: number;
  cagr?: number;
  robustness?: number;
  stability?: number;
  alpha?: number;
  antiOverfit?: number;
}

export interface CreateStrategyRequest {
  name: string;
  description?: string;
  symbol: string;
  timeframe: string;
  parameters: Record<string, any>;
}

// ==================== AI MODULES ====================

export interface AIManifest {
  ok: boolean;
  mode: "real" | "mock";
  version: string;
  timestamp?: string;
  marketData?: MarketData;
  note?: string;
}

export interface MarketData {
  BTCUSD?: number;
  ETHUSD?: number;
  XAUUSD?: number;
  SP500?: number;
  timestamp?: string;
}

export interface MarketPrice {
  price: number;
  source: string;
}

export interface LiveMarketData {
  BTCUSD?: MarketPrice;
  ETHUSD?: MarketPrice;
  XAUUSD?: MarketPrice;
  SP500?: MarketPrice;
  timestamp: string;
}

export interface ReflectiveMarketResponse {
  ok: boolean;
  version: string;
  lastUpdated: string;
  data: MarketData;
  correlations?: Record<string, number>;
  insights?: string[];
}

export interface NeuralAdvisorResponse {
  ok: boolean;
  version: string;
  grade: "A" | "B" | "C";
  metrics: StrategyMetrics;
  classification: string;
  reasoning: string;
}

export interface StrategicAdvisorResponse {
  ok: boolean;
  version: string;
  decision: "BUY" | "SELL" | "HOLD" | "ADAPT";
  confidence: number;
  reasoning: string;
  marketConditions?: Record<string, any>;
}

export interface RiskAnalysisResponse {
  ok: boolean;
  version: string;
  riskScore: number;
  var95: number;
  var99: number;
  expectedShortfall: number;
  scenarios: RiskScenario[];
}

export interface RiskScenario {
  name: string;
  probability: number;
  impact: number;
  description: string;
}

export interface SymbiontResponse {
  ok: boolean;
  mode: string;
  result: {
    summary: string;
    stats: Record<string, any>;
    frontier?: any[];
  };
}

export interface MonteCarloResponse {
  ok: boolean;
  runs: number;
  simulated: boolean;
  meanReturn: number;
  volatility: number;
  percentiles?: {
    p5: number;
    p25: number;
    p50: number;
    p75: number;
    p95: number;
  };
  note?: string;
}

export interface OptimizationRequest {
  strategy: string;
  goal?: "sharpe" | "robustness" | "return";
}

export interface OptimizationResponse {
  ok: boolean;
  version: string;
  optimized: boolean;
  originalParams: Record<string, any>;
  optimizedParams: Record<string, any>;
  improvement: {
    sharpe?: number;
    robustness?: number;
    return?: number;
  };
}

export interface PredictionResponse {
  ok: boolean;
  version: string;
  prediction: {
    expectedReturn: number;
    risk: number;
    signal: "BUY" | "SELL" | "HOLD";
    confidence?: number;
  };
  note?: string;
}

// ==================== MARKET HISTORY ====================

export interface MarketHistoryPoint {
  time: string;
  price: number;
}

export type MarketSymbol = "BTCUSD" | "XAUUSD" | "ETHUSD" | "SP500";

// ==================== GENERIC API RESPONSE ====================

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}
