"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  startTransition,
  type ReactNode,
} from "react"

import api, { attachUnauthorizedHandler, setAuthToken } from "@/lib/api"

export type AuthUser = {
  id: string
  email: string
  fullName?: string
  roles?: string[]
}

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (params: { email: string; password: string }) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_STORAGE_KEY = "omega-quantum-token"

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const persistToken = useCallback((value: string | null) => {
    if (typeof window === "undefined") return

    if (value) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, value)
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }, [])

  const handleLogout = useCallback(() => {
    setToken(null)
    setUser(null)
    setAuthToken(null)
    persistToken(null)
  }, [persistToken])

  useEffect(() => {
    const detach = attachUnauthorizedHandler(handleLogout)
    return () => {
      detach()
    }
  }, [handleLogout])

  const refreshProfile = useCallback(
    async (overrideToken?: string) => {
      const activeToken = overrideToken ?? token
      if (!activeToken) return

      try {
        const response = await api.get<{ user: AuthUser }>("/auth/me")
        setUser(response.data.user)
      } catch (error) {
        console.error("Unable to refresh user profile", error)
      }
    },
    [token],
  )

  useEffect(() => {
    if (typeof window === "undefined") return

    const bootstrap = async () => {
      const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY)
      if (!storedToken) {
        startTransition(() => setLoading(false))
        return
      }

      setAuthToken(storedToken)
      startTransition(() => {
        setToken(storedToken)
      })

      try {
        await refreshProfile(storedToken)
      } finally {
        startTransition(() => setLoading(false))
      }
    }

    void bootstrap()
  }, [refreshProfile])

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const response = await api.post<{
        token: string
        user: AuthUser
      }>("/auth/login", { email, password })

      setToken(response.data.token)
      setAuthToken(response.data.token)
      persistToken(response.data.token)
      setUser(response.data.user)
      setLoading(false)
    },
    [persistToken],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      logout: handleLogout,
      refreshProfile,
    }),
    [handleLogout, loading, login, refreshProfile, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider")
  }

  return context
}
