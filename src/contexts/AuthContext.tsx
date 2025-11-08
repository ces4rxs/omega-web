"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser, getCurrentUser } from "@/lib/auth";
import { saveAuthSession, clearAuthSession, getStoredUser, isAuthenticated } from "@/lib/auth-helpers";
import type { AuthResponse } from "@/types/api";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 🔄 Cargar usuario al iniciar la app
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated()) {
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }

        // Opcional: Verificar con el backend que el token sigue siendo válido
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Si falla, el interceptor ya limpió el localStorage
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // 🔐 Login
  const login = async (email: string, password: string) => {
    const authData: AuthResponse = await loginUser(email, password);
    saveAuthSession(authData);
    setUser(authData.user);
  };

  // 📝 Register
  const register = async (email: string, password: string, name?: string) => {
    const authData: AuthResponse = await registerUser(email, password, name);
    saveAuthSession(authData);
    setUser(authData.user);
  };

  // 🚪 Logout
  const logout = () => {
    clearAuthSession();
    setUser(null);
    router.push("/login");
  };

  // 🔄 Refrescar datos del usuario
  const refreshUser = async () => {
    if (isAuthenticated()) {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
