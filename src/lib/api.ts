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

/**
 * 🔐 Interceptor de Request - Agrega el token JWT automáticamente
 */
api.interceptors.request.use(
  (config) => {
    // Obtener el token del localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    // Si existe un token, agregarlo al header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 🔐 Interceptor de Response - Maneja errores de autenticación
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token expiró o es inválido (401), limpiamos el localStorage
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        // Redirigir al login solo si no estamos ya en páginas públicas
        const publicPaths = ["/login", "/register", "/forgot-password", "/"];
        const currentPath = window.location.pathname;

        if (!publicPaths.includes(currentPath)) {
          window.location.href = "/login?session=expired";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
