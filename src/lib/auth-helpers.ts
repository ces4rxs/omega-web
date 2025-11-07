// src/lib/auth-helpers.ts
// 🔐 Utilidades para manejo de autenticación en el cliente

import type { AuthResponse } from "@/types/api";

/**
 * Guarda la sesión del usuario en localStorage
 */
export function saveAuthSession(authData: AuthResponse): void {
  if (typeof window === "undefined") return;

  localStorage.setItem("accessToken", authData.accessToken);
  localStorage.setItem("user", JSON.stringify(authData.user));

  // Si hay refreshToken, también lo guardamos
  if (authData.refreshToken) {
    localStorage.setItem("refreshToken", authData.refreshToken);
  }
}

/**
 * Limpia la sesión del usuario (logout)
 */
export function clearAuthSession(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

/**
 * Obtiene el token de acceso actual
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

/**
 * Obtiene los datos del usuario guardados
 */
export function getStoredUser(): AuthResponse["user"] | null {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Verifica si hay una sesión activa
 */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}
