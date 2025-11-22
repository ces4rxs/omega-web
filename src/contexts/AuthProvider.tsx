"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, AuthResponse } from "@/lib/types";
import { loginUser as apiLogin, getCurrentUser } from "@/lib/auth";

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

    // Bootstrapping session
    useEffect(() => {
        const bootstrap = async () => {
            const token = localStorage.getItem("accessToken");
            const storedUser = localStorage.getItem("user");

            if (token && storedUser) {
                try {
                    // Optimistic load
                    setUser(JSON.parse(storedUser));

                    // Optional: Verify with server if needed, but for now trust local + 401 interceptors
                    // await getCurrentUser(); 
                } catch (e) {
                    console.error("Session restore failed", e);
                    logout();
                }
            }
            setIsLoading(false);
        };

        bootstrap();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await apiLogin(email, password);

            localStorage.setItem("accessToken", response.accessToken);
            localStorage.setItem("user", JSON.stringify(response.user));
            if (response.refreshToken) {
                localStorage.setItem("refreshToken", response.refreshToken);
            }

            setUser(response.user);
            router.push("/dashboard");
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("sidebarCollapsed");
        setUser(null);
        router.push("/login");
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
