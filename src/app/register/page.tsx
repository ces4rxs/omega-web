"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import Link from "next/link";

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      await register(email, password);
      router.push("/dashboard");
    } catch {
      setError("No se pudo crear la cuenta. Intenta con otro correo.");
    }
  };

  return (
    <AuthLayout title="Crear Cuenta" subtitle="Únete a OMEGA Web">
      <form onSubmit={handleRegister} className="space-y-5">
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
          placeholder="Mínimo 6 caracteres"
          required
        />

        <AuthInput
          label="Confirmar Contraseña"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repite tu contraseña"
          required
        />

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

        <div className="text-xs text-[#9ca3af]">
          Al registrarte, aceptas nuestros{" "}
          <Link href="/terms" className="text-[#00d4ff] hover:underline">
            Términos de Servicio
          </Link>{" "}
          y{" "}
          <Link href="/privacy" className="text-[#00d4ff] hover:underline">
            Política de Privacidad
          </Link>
          .
        </div>

        <AuthButton type="submit" loading={loading}>
          Crear Cuenta
        </AuthButton>

        <p className="text-center text-sm text-[#9ca3af]">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-[#00d4ff] hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
