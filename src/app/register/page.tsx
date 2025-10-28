"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(email, password);
      router.push("/dashboard");
    } catch {
      setError("⚠️ No se pudo crear la cuenta. Intenta con otro correo.");
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#050812] text-white">
      {/* Fondo animado neural */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-emerald-500/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)] animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm bg-slate-900/70 backdrop-blur-lg p-8 rounded-2xl border border-emerald-500/30 shadow-xl shadow-emerald-900/10"
      >
        <h1 className="text-3xl font-bold text-emerald-400 mb-2 text-center">
          Crear cuenta
        </h1>
        <p className="text-sm text-slate-400 text-center mb-6">
          Accede al universo <span className="text-emerald-300 font-semibold">OMEGA</span>
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-slate-300">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-800/80 rounded-lg px-3 py-2 outline-none border border-emerald-800/40 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 transition-all"
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
              className="w-full bg-slate-800/80 rounded-lg px-3 py-2 outline-none border border-emerald-800/40 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 transition-all"
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
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-lg py-2 mt-4 transition-all duration-300 shadow-md hover:shadow-emerald-700/30"
          >
            {loading ? "Creando cuenta..." : "Registrarme"}
          </motion.button>

          <p className="text-center text-sm text-slate-400 mt-4">
            ¿Ya tienes una cuenta?{" "}
            <a
              href="/login"
              className="text-emerald-400 hover:underline hover:text-emerald-300"
            >
              Inicia sesión
            </a>
          </p>
        </form>
      </motion.div>
    </main>
  );
}
