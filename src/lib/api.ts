// src/lib/api.ts
import axios from "axios";

/**
 * 🌐 Cliente API OMEGA — Versión exclusiva para Render
 * - Siempre apunta al backend en producción (Render)
 * - Sin soporte local, evita conflictos de entorno
 */

const api = axios.create({
  baseURL: "https://backtester-pro-1.onrender.com", // ✅ Backend Render
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // 🔒 tokens manuales, sin cookies
});

// 🧠 Header temporal (puedes quitarlo luego)
api.defaults.headers.common["x-user-id"] = "2";

export default api;
