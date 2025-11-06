// src/lib/api.ts — Cliente API para backend OMEGA
import axios from "axios";

/**
 * 🌐 Cliente API OMEGA
 * Configurado con variable de entorno para flexibilidad entre dev/prod
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://backtester-pro-1.onrender.com",
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // 🔒 Tokens manuales via Authorization header
});

export default api;
