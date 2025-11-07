// src/types/api.ts
// 🧩 Tipos base usados por las funciones del cliente (auth, api, etc.)

export interface UserSubscription {
  id: string;
  plan: string;
  status: "active" | "canceled" | "expired";
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
}
