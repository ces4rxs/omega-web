"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, AuthResponse } from "@/lib/types";
import { loginUser as apiLogin, getCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Bootstrap: Validate session with backend
    useEffect(() => {
        const bootstrap = async () => {
            try {
                // Call backend to validate session
                const userData = await getCurrentUser();
                setUser(userData);
            } catch (error) {
                // Session invalid or user not authenticated
                setUser(null);
                // Clear any stale tokens
                if (typeof window !== 'undefined') {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("user");
                }
            } finally {
                setIsLoading(false);
            }
        };

        bootstrap();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            // Step 1: Authenticate with backend
            const response = await apiLogin(email, password);

            // Step 2: Store tokens
            localStorage.setItem("accessToken", response.accessToken);
            localStorage.setItem("user", JSON.stringify(response.user));
            if (response.refreshToken) {
                localStorage.setItem("refreshToken", response.refreshToken);
            }

            // Step 3: Fetch full user profile from backend
            const userData = await getCurrentUser();
            setUser(userData);

            router.push("/dashboard");
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            // Call backend logout endpoint
            await api.post("/auth/logout");
        } catch (error) {
            // Log but don't block logout on error
            console.warn("Logout endpoint failed:", error);
        } finally {
            // Clear local state regardless
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            localStorage.removeItem("sidebarCollapsed");
            setUser(null);
            router.push("/login");
        }
    };

    // Protect routes
    useEffect(() => {
        if (!isLoading && !user && pathname.startsWith("/dashboard")) {
            router.push("/login");
        }
    }, [user, isLoading, pathname, router]);

    const value = useMemo(() => ({
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
    }), [user, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
