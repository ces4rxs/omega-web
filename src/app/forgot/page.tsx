"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import Link from "next/link";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot", { email });
      setSuccess(true);
    } catch {
      setError("No se pudo enviar el correo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Correo Enviado" subtitle="Revisa tu bandeja de entrada">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#10b981]/20">
            <span className="text-4xl text-[#10b981]">✓</span>
          </div>
          <p className="text-[#9ca3af]">
            Hemos enviado un enlace de recuperación a <strong className="text-[#f9fafb]">{email}</strong>
          </p>
          <p className="text-sm text-[#9ca3af]">
            El enlace expirará en 1 hora. Si no ves el correo, revisa tu carpeta de spam.
          </p>
          <div className="pt-4">
            <Link href="/login">
              <AuthButton type="button">Volver al inicio de sesión</AuthButton>
            </Link>
          </div>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recuperar Contraseña"
      subtitle="Te enviaremos un enlace para restablecer tu contraseña"
    >
      <form onSubmit={handleReset} className="space-y-5">
        <AuthInput
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
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

        <AuthButton type="submit" loading={loading}>
          Enviar enlace de recuperación
        </AuthButton>

        <p className="text-center text-sm text-[#9ca3af]">
          <Link href="/login" className="font-medium text-[#00d4ff] hover:underline">
            ← Volver al inicio de sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
