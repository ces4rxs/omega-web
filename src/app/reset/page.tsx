"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/reset", { token, password });
      setSuccess("✅ Contraseña actualizada correctamente.");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("⚠️ El enlace no es válido o ha expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050812] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-900/10 via-sky-500/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15)_0%,transparent_70%)] animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm bg-slate-900/70 backdrop-blur-lg p-8 rounded-2xl border border-sky-500/30 shadow-lg shadow-sky-900/10"
      >
        <h1 className="text-2xl font-bold text-sky-400 mb-2 text-center">
          Nueva contraseña
        </h1>
        <p className="text-sm text-slate-400 text-center mb-6">
          Ingresa tu nueva contraseña para tu cuenta OMEGA
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
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
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
}
