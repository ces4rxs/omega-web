// src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.90:4000", // 🧠 Servidor Omega AI local
  timeout: 10000,
});

export default api;
