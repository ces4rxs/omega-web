import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backtester-pro-1.onrender.com';

export const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Errors
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (typeof window !== 'undefined') {
                // Prevent infinite loops on public paths
                const publicPaths = ['/login', '/register', '/forgot-password', '/'];
                if (!publicPaths.includes(window.location.pathname)) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login?session=expired';
                }
            }
        }

        return Promise.reject(error.response?.data || error.message || 'Something went wrong');
    }
);
