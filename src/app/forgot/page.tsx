"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/forgot", { email });
      setSuccess("✅ Se ha enviado un enlace de recuperación a tu correo.");
    } catch {
      setError("⚠️ No se pudo enviar el correo. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050812] text-white relative overflow-hidden">
      {/* Fondo IA */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-900/10 via-sky-500/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15)_0%,transparent_70%)] animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm bg-slate-900/70 backdrop-blur-lg p-8 rounded-2xl border border-sky-500/30 shadow-lg shadow-sky-900/10"
      >
        <h1 className="text-2xl font-bold text-sky-400 mb-2 text-center">
          Recuperar contraseña
        </h1>
        <p className="text-sm text-slate-400 text-center mb-6">
          Ingresa tu correo y te enviaremos un enlace seguro
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            className="w-full bg-slate-800/80 rounded-lg px-3 py-2 outline-none border border-sky-800/40 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 transition-all"
          />

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-400 text-sm"
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-green-400 text-sm"
              >
                {success}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-semibold rounded-lg py-2 mt-4 transition-all duration-300 shadow-md hover:shadow-sky-700/30"
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </motion.button>

          <p className="text-center text-sm text-slate-400 mt-4">
            <a
              href="/login"
              className="text-sky-400 hover:underline hover:text-sky-300"
            >
              ← Volver al inicio de sesión
            </a>
          </p>
        </form>
      </motion.div>
    </main>
  );
}
