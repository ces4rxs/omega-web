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

    // Validación rápida antes de enviar
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

      // 🔐 Guardar token y datos del usuario en localStorage
      localStorage.setItem("accessToken", authData.accessToken);
      localStorage.setItem("user", JSON.stringify(authData.user));

      if (authData.refreshToken) {
        localStorage.setItem("refreshToken", authData.refreshToken);
      }

      console.log("✅ Login success:", authData.user);
      router.push("/dashboard");
    } catch (err) {
      setError("⚠️ Credenciales incorrectas o servidor no disponible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center mb-8"
      >
        <Image
          src="/images/omega-logo.png"
          alt="Omega Quantum Logo"
          width={130}
          height={130}
          className="drop-shadow-xl animate-pulse-slow"
        />
        <h1 className="text-3xl font-extrabold mt-4 tracking-wider">
          Bienvenido a <span className="text-blue-500">OMEGA</span>
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Inicia sesión para acceder a tu panel de control.
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl w-full max-w-sm space-y-5 shadow-2xl"
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
            className="p-3 w-full rounded-md bg-zinc-800/70 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
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
            className="p-3 w-full rounded-md bg-zinc-800/70 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-md font-semibold tracking-wide transition-all ${
            loading
              ? "bg-blue-800/60 cursor-wait"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
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
