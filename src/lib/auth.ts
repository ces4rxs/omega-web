// src/lib/auth.ts
import { api } from "@/lib/api"
import type { AuthResponse, User } from "@/lib/types"

// Registro de usuario
export async function registerUser(email: string, password: string, name?: string): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/register", { email, password, name })
}

// Inicio de sesión
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/login", { email, password })
}

// Datos del usuario autenticado
export async function getCurrentUser(): Promise<User> {
  return api.get<User>("/auth/me")
}

// Recuperación de contraseña
export async function forgotPassword(email: string): Promise<{ message: string; sent: boolean }> {
  return api.post("/auth/forgot", { email })
}

// Restablecer contraseña
export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  return api.post("/auth/reset", { token, password })
}