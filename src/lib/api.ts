// src/lib/api.ts — Cliente fijo para backend Render (OMEGA AI)
import axios from "axios";

/**
 * 🌐 Cliente API OMEGA (Producción fija)
 * Siempre apunta al backend desplegado en Render.
 * No depende de variables de entorno ni del entorno local.
 */
const api = axios.create({
  baseURL: "https://backtester-pro-1.onrender.com", // 🔗 Backend Render fijo
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // 🔒 Tokens manuales, sin cookies
});

// 🔧 Header temporal opcional (para debugging o trazabilidad)
api.defaults.headers.common["x-user-id"] = "2";

export default api;
