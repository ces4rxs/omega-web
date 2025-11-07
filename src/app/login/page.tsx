"use client";

import Image from "next/image";
import { useState } from "react";
import { loginUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
    } catch (err: any) {
      console.error("❌ Login error:", err);
      const errorMessage = err.response?.data?.message || "Credenciales incorrectas o servidor no disponible";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white p-4">
      <div className="flex flex-col items-center mb-6">
        <Image
          src="/images/omega-logo.png"
          alt="Omega Quantum Logo"
          width={120}
          height={120}
          className="drop-shadow-lg animate-pulse-slow"
        />
        <h1 className="text-3xl font-bold mt-3 tracking-wide">Iniciar Sesión</h1>
      </div>

      <form
        onSubmit={handleLogin}
        className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-xl"
      >
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 w-full rounded-md bg-zinc-800/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 w-full rounded-md bg-zinc-800/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-700 font-semibold transition"
        >
          {loading ? "Conectando..." : "Entrar"}
        </button>

        {error && <p className="text-red-400 text-center">{error}</p>}

        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <a href="/forgot-password" className="hover:text-blue-400 transition">
            ¿Olvidaste tu contraseña?
          </a>
          <a href="/register" className="hover:text-blue-400 transition">
            Crear cuenta
          </a>
        </div>
      </form>
    </main>
  );
}
