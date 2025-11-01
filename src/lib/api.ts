// src/lib/api.ts
import axios from "axios";

/**
 * 🌐 Cliente API OMEGA — Versión exclusiva para Render
 * - Siempre apunta al backend en producción (Render)
 * - Sin soporte local, evita conflictos de entorno
 */

const api = axios.create({
<<<<<<< HEAD
  baseURL: "https://backtester-pro-1.onrender.com", // ✅ Backend Render
  timeout: 45000,
=======
  baseURL: isProd
    ? "https://omega-ai-server.onrender.com" // 🔥 Servidor Render (Producción)
  timeout: 15000, // ⏱️ más tolerancia para IA y cálculos complejos
>>>>>>> c6343c5b633e67c0e9d09ddafc64ff3ecca7f05e
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // 🔒 tokens manuales, sin cookies
});

// 🧠 Header temporal (puedes quitarlo luego)
api.defaults.headers.common["x-user-id"] = "2";

export default api;
