"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      setError("⚠️ Credenciales inválidas o error en el servidor.");
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#050812] text-white">
      {/* Fondo animado azul IA */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-900/10 via-sky-500/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15)_0%,transparent_70%)] animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm bg-slate-900/70 backdrop-blur-lg p-8 rounded-2xl border border-sky-500/30 shadow-xl shadow-sky-900/10"
      >
        <h1 className="text-3xl font-bold text-sky-400 mb-2 text-center">
          Iniciar sesión
        </h1>
        <p className="text-sm text-slate-400 text-center mb-6">
          Bienvenido a <span className="text-sky-300 font-semibold">OMEGA Web</span>
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-slate-300">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-800/80 rounded-lg px-3 py-2 outline-none border border-sky-800/40 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 transition-all"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-800/80 rounded-lg px-3 py-2 outline-none border border-sky-800/40 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 transition-all"
              placeholder="••••••••"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-400 text-sm mt-2"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-semibold rounded-lg py-2 mt-4 transition-all duration-300 shadow-md hover:shadow-sky-700/30"
          >
            {loading ? "Cargando..." : "Entrar"}
          </motion.button>

          {/* Botón Face ID (placeholder) */}
          <button
            type="button"
            disabled={loading}
            className="w-full mt-3 py-2 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 border border-sky-400/20 text-sky-300 text-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>🔒 Iniciar con Face ID</span>
          </button>

          <p className="text-center text-sm text-slate-400 mt-4">
            ¿No tienes cuenta?{" "}
            <a
              href="/register"
              className="text-sky-400 hover:underline hover:text-sky-300"
            >
              Regístrate
            </a>
          </p>
        </form>
      </motion.div>
    </main>
  );
}
