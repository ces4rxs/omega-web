// src/lib/stripe.ts
// Funciones para Stripe Checkout y manejo de suscripciones
import { api } from "@/lib/api";
import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  UserSubscription,
  CancelSubscriptionResponse,
  PricingPlan,
} from "@/types/api";

// Placeholder plans - Replace with actual Stripe Price IDs
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
  },
  {
    id: "professional",
    name: "Professional",
    price: 29,
  },
];

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(
  priceId: string
): Promise<string> {
  const request: CreateCheckoutSessionRequest = {
    priceId,
    successUrl: `${window.location.origin}/dashboard?success=true`,
    cancelUrl: `${window.location.origin}/pricing?canceled=true`,
  };

  const data = await api.post<CreateCheckoutSessionResponse>(
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
    const data = await api.get<UserSubscription>("/stripe/subscription");
    return data;
  } catch (error: any) {
    return null;
  }
}

/**
 * Create a Stripe Billing Portal session
 */
export async function createBillingPortalSession(): Promise<string> {
  const data = await api.post<{ url: string }>(
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
  const data = await api.post<CancelSubscriptionResponse>(
    "/stripe/cancel-subscription"
  );

  return data.subscription;
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(): Promise<UserSubscription> {
  const data = await api.post<{ ok: boolean; subscription: UserSubscription }>(
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
      return { text: "Active", color: "text-emerald-400" };
    case "trialing":
      return { text: "Trial Period", color: "text-blue-400" };
    case "canceled":
      return { text: "Canceled", color: "text-orange-400" };
    case "past_due":
      return { text: "Payment Pending", color: "text-red-400" };
    case "unpaid":
      return { text: "Unpaid", color: "text-red-400" };
    case "incomplete":
      return { text: "Incomplete", color: "text-yellow-400" };
    default:
      return { text: "No Subscription", color: "text-slate-400" };
  }
}
