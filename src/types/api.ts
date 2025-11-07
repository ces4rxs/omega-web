// src/types/api.ts
// 🧩 Tipos base usados por las funciones del cliente (auth, api, stripe, etc.)

// ----- Stripe Checkout -----
export interface CreateCheckoutSessionRequest {
  priceId: string;     // ID del plan o precio de Stripe
  userId?: string;     // opcional: ID del usuario autenticado
  successUrl?: string; // URL de redirección tras pago exitoso
  cancelUrl?: string;  // URL de redirección si se cancela el pago
}

export interface CreateCheckoutSessionResponse {
  url: string;       // URL a la sesión de pago
}

// ----- Suscripciones -----
export interface UserSubscription {
  id: string;
  plan: string;
  status: "active" | "canceled" | "expired";
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message?: string;
  subscription: UserSubscription; // Datos actualizados de la suscripción cancelada
}

// ----- Planes de precios -----
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
}

// ----- Autenticación -----
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}
