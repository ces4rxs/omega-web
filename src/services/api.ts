// src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://backtester-pro-1.onrender.com",
  timeout: 15000,
});

export default api;
