"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import Link from "next/link";

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
      setError("Credenciales inválidas o error en el servidor.");
    }
  };

  return (
    <AuthLayout title="Iniciar Sesión" subtitle="Bienvenido a OMEGA Web">
      <form onSubmit={handleLogin} className="space-y-5">
        <AuthInput
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
        />

        <AuthInput
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-[#9ca3af]">
            <input type="checkbox" className="rounded border-[#9ca3af]/30" />
            <span>Recordarme</span>
          </label>
          <Link href="/forgot" className="text-[#00d4ff] hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 p-3 text-sm text-[#ef4444]"
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AuthButton type="submit" loading={loading}>
          Entrar
        </AuthButton>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#9ca3af]/20"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#1a1f2e] px-2 text-[#9ca3af]">O continuar con</span>
          </div>
        </div>

        <AuthButton type="button" variant="secondary" disabled={loading}>
          <span className="flex items-center justify-center gap-2">
            🔒 <span>Face ID / Touch ID</span>
          </span>
        </AuthButton>

        <p className="text-center text-sm text-[#9ca3af]">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-[#00d4ff] hover:underline">
            Regístrate gratis
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
