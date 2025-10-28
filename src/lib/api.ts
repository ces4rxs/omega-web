// src/lib/api.ts
import axios from "axios";

// ✅ Detecta si estamos en producción o desarrollo
const isProd = process.env.NODE_ENV === "production";

// 🌍 Dirección base dinámica
const api = axios.create({
  baseURL: isProd
    ? "https://omega-ai-server.onrender.com" // 🔥 Servidor Render (Producción)
    : "http://192.168.1.90:4000",            // 💻 Local (Desarrollo)
  timeout: 15000, // ⏱️ más tolerancia para IA y cálculos complejos
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // 🚫 no usa cookies
});

export default api;
