// src/lib/api.ts — Cliente API para Backtester Pro
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backtester-pro-1.onrender.com'

/**
 * Cliente API genérico usando fetch nativo
 */
export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  })

  // Manejo de autenticación
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      const publicPaths = ['/login', '/register', '/forgot-password', '/']
      const currentPath = window.location.pathname
      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/login?session=expired'
      }
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  return res.json()
}

/**
 * Objeto API con métodos HTTP
 */
export const api = {
  get: <T>(endpoint: string) => apiClient<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data?: any) => apiClient<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined
  }),
  put: <T>(endpoint: string, data?: any) => apiClient<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined
  }),
  delete: <T>(endpoint: string) => apiClient<T>(endpoint, { method: 'DELETE' })
}

export default api
