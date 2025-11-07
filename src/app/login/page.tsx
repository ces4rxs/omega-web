"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.includes("@") || !email.includes(".")) {
      setError("Por favor ingresa un correo válido.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const authData = await loginUser(email, password);
      localStorage.setItem("accessToken", authData.accessToken);
      localStorage.setItem("user", JSON.stringify(authData.user));
      if (authData.refreshToken)
        localStorage.setItem("refreshToken", authData.refreshToken);

      router.push("/dashboard");
    } catch {
      setError("⚠️ Credenciales incorrectas o servidor no disponible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white px-4 relative overflow-hidden">
      {/* Fondo cuántico suave */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,122,255,0.15),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(140,0,255,0.12),transparent_60%)] animate-pulse-slow" />

      {/* 🌌 Halo cuántico detrás del logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center mb-8 z-10 relative"
      >
        {/* Halo animado con gradiente dinámico */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          className="absolute w-44 h-44 rounded-full border-[1.5px] animate-gradient-spin"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(0,120,255,0.25), rgba(140,0,255,0.25), rgba(0,255,255,0.2), rgba(0,120,255,0.25))",
            maskImage:
              "radial-gradient(circle, transparent 55%, black 56%)",
            WebkitMaskImage:
              "radial-gradient(circle, transparent 55%, black 56%)",
          }}
        ></motion.div>

        {/* Capa interna brillante */}
        <div className="absolute w-28 h-28 rounded-full blur-3xl bg-blue-600/25 animate-pulse-slow"></div>

        {/* 🌀 Logo sin fondo */}
        <Image
          src="/images/omega-logo-transparent.png"
          alt="Omega Quantum Logo"
          width={130}
          height={130}
          className="drop-shadow-[0_0_25px_rgba(0,120,255,0.4)] relative z-10"
        />

        <h1 className="text-3xl font-extrabold mt-4 tracking-wider text-center">
          Bienvenido a{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            OMEGA QUANTUM
          </span>
        </h1>
        <p className="text-sm text-gray-400 mt-2 text-center">
          Inicia sesión para acceder a tu panel de control inteligente.
        </p>
      </motion.div>

      {/* Formulario */}
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl w-full max-w-sm space-y-5 shadow-[0_0_25px_rgba(0,0,0,0.5)] hover:shadow-[0_0_35px_rgba(50,120,255,0.15)] transition-all duration-500"
      >
        <div>
          <label className="text-sm text-gray-300 mb-1 block">
            Correo electrónico
          </label>
          <input
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 w-full rounded-md bg-zinc-800/70 text-white placeholder-gray-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-300 mb-1 block">
            Contraseña
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 w-full rounded-md bg-zinc-800/70 text-white placeholder-gray-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-md font-semibold tracking-wide transition-all ${
            loading
              ? "bg-blue-800/60 cursor-wait"
              : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 active:scale-95"
          }`}
        >
          {loading ? "Conectando..." : "Entrar"}
        </button>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-center text-sm mt-2"
          >
            {error}
          </motion.p>
        )}

        <div className="flex justify-between text-sm text-gray-400 mt-3">
          <a href="/forgot-password" className="hover:text-blue-400 transition">
            ¿Olvidaste tu contraseña?
          </a>
          <a href="/register" className="hover:text-blue-400 transition">
            Crear cuenta
          </a>
        </div>
      </motion.form>
    </main>
  );
}
