// src/lib/stripe.ts - Stripe integration

import api from "@/lib/api";
import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  UserSubscription,
  CancelSubscriptionResponse,
} from "@/types/api";

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  interval: "month" | "year";
  features: string[];
  popular?: boolean;
  color: string;
}

// 💳 Plans configuration
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "trader",
    name: "Trader",
    price: 99.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_TRADER_PRICE_ID || "price_trader",
    interval: "month",
    popular: false,
    color: "from-blue-500 to-cyan-500",
    features: [
      "5 estrategias activas",
      "Backtesting ilimitado",
      "AI Neural Advisor v11",
      "Optimización básica",
      "Datos históricos 1 año",
      "Soporte por email",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 199.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID || "price_professional",
    interval: "month",
    popular: true,
    color: "from-emerald-500 to-teal-500",
    features: [
      "20 estrategias activas",
      "Backtesting ilimitado",
      "Todos los módulos AI (v11-v15)",
      "Optimización avanzada",
      "Monte Carlo 10,000 runs",
      "Datos históricos 5 años",
      "API access",
      "Soporte prioritario",
    ],
  },
  {
    id: "institutional",
    name: "Institutional",
    price: 499.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_INSTITUTIONAL_PRICE_ID || "price_institutional",
    interval: "month",
    popular: false,
    color: "from-purple-500 to-pink-500",
    features: [
      "Estrategias ilimitadas",
      "Backtesting ilimitado",
      "Todos los módulos AI",
      "Optimización quantum",
      "Monte Carlo ilimitado",
      "Datos históricos completos",
      "API access ilimitado",
      "White-label disponible",
      "Soporte 24/7 dedicado",
      "Custom integrations",
    ],
  },
];

/**
 * Create a Stripe Checkout session
 */
export async function createCheckoutSession(priceId: string): Promise<string> {
  const request: CreateCheckoutSessionRequest = {
    priceId,
    successUrl: `${window.location.origin}/dashboard?subscription=success`,
    cancelUrl: `${window.location.origin}/pricing?canceled=true`,
  };

  const { data } = await api.post<CreateCheckoutSessionResponse>(
    "/stripe/create-checkout-session",
    request
  );

  return data.url;
}

/**
 * Get user's subscription details
 */
export async function getUserSubscription(): Promise<UserSubscription | null> {
  try {
    const { data } = await api.get<UserSubscription>("/stripe/subscription");
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Create a Stripe Billing Portal session
 */
export async function createBillingPortalSession(): Promise<string> {
  const { data } = await api.post<{ url: string }>(
    "/stripe/create-portal-session",
    {
      returnUrl: `${window.location.origin}/dashboard/billing`,
    }
  );

  return data.url;
}

/**
 * Cancel user's subscription (at period end)
 */
export async function cancelSubscription(): Promise<UserSubscription> {
  const { data } = await api.post<CancelSubscriptionResponse>(
    "/stripe/cancel-subscription"
  );

  return data.subscription;
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(): Promise<UserSubscription> {
  const { data } = await api.post<{ ok: boolean; subscription: UserSubscription }>(
    "/stripe/reactivate-subscription"
  );

  return data.subscription;
}

/**
 * Get plan details by ID
 */
export function getPlanById(planId: string): PricingPlan | undefined {
  return PRICING_PLANS.find((plan) => plan.id === planId);
}

/**
 * Get plan name display
 */
export function getPlanName(plan: string | null): string {
  if (!plan) return "Free";
  const planObj = getPlanById(plan);
  return planObj?.name || plan;
}

/**
 * Format subscription status for display
 */
export function formatSubscriptionStatus(
  status: string | null
): { text: string; color: string } {
  switch (status) {
    case "active":
      return { text: "Activa", color: "text-emerald-400" };
    case "trialing":
      return { text: "Período de prueba", color: "text-blue-400" };
    case "canceled":
      return { text: "Cancelada", color: "text-orange-400" };
    case "past_due":
      return { text: "Pago pendiente", color: "text-red-400" };
    case "unpaid":
      return { text: "Impaga", color: "text-red-400" };
    case "incomplete":
      return { text: "Incompleta", color: "text-yellow-400" };
    default:
      return { text: "Sin suscripción", color: "text-slate-400" };
  }
}
