// src/lib/auth.ts
import api from "@/lib/api";

// 🧩 Registro de usuario
export async function registerUser(email: string, password: string) {
  const res = await api.post("/auth/register", { email, password });
  return res.data; // { accessToken, user }
}

// 🧠 Inicio de sesión
export async function loginUser(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  return res.data; // { accessToken, user }
}

// 👤 Datos del usuario autenticado
export async function getCurrentUser() {
  const res = await api.get("/auth/me");
  return res.data; // { id, email, ... }
}
