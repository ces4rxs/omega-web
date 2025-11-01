"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

interface User {
  id: number;
  email: string;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  loading: false,
  login: async () => {},
  register: async () => {},
  refresh: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Garantiza encabezado base
  api.defaults.headers.common["Content-Type"] = "application/json";

  // ✅ Verifica si hay token guardado al iniciar
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    api.defaults.headers.Authorization = `Bearer ${token}`;
    api
      .get("/auth/me")
      .then((res) => {
        // Soporta ambas respuestas: { user } o { id, email }
        const userData = res.data.user || res.data;
        setUser(userData);
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ Login
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      api.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Registro
  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { email, password });
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      api.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Refresh token
  const refresh = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return logout();

    try {
      const { data } = await api.post("/auth/refresh", { token: refreshToken });
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        api.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
        setUser(data.user || null);
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        refresh,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
