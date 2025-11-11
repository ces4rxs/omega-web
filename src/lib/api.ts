import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:10000",
  withCredentials: true,
})

let authToken: string | null = null

export const setAuthToken = (token: string | null) => {
  authToken = token
}

api.interceptors.request.use((config) => {
  if (authToken && config.headers) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

export const attachUnauthorizedHandler = (
  onUnauthorized: () => void,
) => {
  const interceptor = api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        onUnauthorized()
      }
      return Promise.reject(error)
    },
  )

  return () => {
    api.interceptors.response.eject(interceptor)
  }
}

export default api
