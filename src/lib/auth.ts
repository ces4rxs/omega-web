// src/lib/auth.ts
import api from "@/lib/api";

// 🧩 Registro de usuario
export async function registerUser(email: string, password: string, name?: string) {
  const res = await api.post("/auth/register", { email, password, name });
  return res.data; // { accessToken, user }
}

// 🧠 Inicio de sesión
export async function loginUser(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  return res.data; // { accessToken, user }
}

// 🧩 Datos del usuario autenticado
export async function getCurrentUser() {
  const res = await api.get("/auth/me");
  return res.data; // { id, email, ... }
}

// 🔐 Recuperación de contraseña
export async function forgotPassword(email: string) {
  const res = await api.post("/auth/forgot", { email });
  return res.data; // { message, sent }
}

// 🔐 Restablecer contraseña
export async function resetPassword(token: string, password: string) {
  const res = await api.post("/auth/reset", { token, password });
  return res.data; // { message }
}