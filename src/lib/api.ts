// src/lib/api.ts — Cliente API para Backtester Pro (Refactored to use Axios)
import { axiosInstance } from "@/lib/axios";
import { AxiosRequestConfig } from "axios";

/**
 * Wrapper genérico sobre la instancia de Axios para mantener compatibilidad
 */
export async function apiClient<T>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> {
  const response = await axiosInstance.request<T>({
    url: endpoint,
    ...options,
  });
  return response.data;
}

/**
 * Objeto API con métodos HTTP estandarizados
 */
export const api = {
  get: <T>(endpoint: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<T>(endpoint, config).then(res => res.data),

  post: <T, D = unknown>(endpoint: string, data?: D, config?: AxiosRequestConfig) =>
    axiosInstance.post<T>(endpoint, data, config).then(res => res.data),

  put: <T, D = unknown>(endpoint: string, data?: D, config?: AxiosRequestConfig) =>
    axiosInstance.put<T>(endpoint, data, config).then(res => res.data),

  delete: <T>(endpoint: string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<T>(endpoint, config).then(res => res.data)
};

export default api;
