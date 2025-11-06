"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import api from "@/lib/api";
import type { ResetPasswordRequest } from "@/types/api";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token de recuperación no válido o expirado");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Token no válido");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const request: ResetPasswordRequest = {
        token,
        newPassword: password,
      };

      await api.post("/auth/reset-password", request);
      setSuccess(true);

      setTimeout(() => {
        router.push("/login?reset=success");
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al restablecer la contraseña. El token puede haber expirado."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="¡Contraseña Actualizada!" subtitle="Tu contraseña ha sido restablecida">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#10b981]/20">
            <span className="text-4xl text-[#10b981]">✓</span>
          </div>
          <p className="text-[#9ca3af]">
            Tu contraseña ha sido restablecida correctamente. Redirigiendo al login...
          </p>
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00d4ff]/20 border-t-[#00d4ff]" />
          </div>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Nueva Contraseña" subtitle="Ingresa tu nueva contraseña">
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label="Nueva Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          required
          disabled={!token || loading}
        />

        <AuthInput
          label="Confirmar Contraseña"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repite tu contraseña"
          required
          disabled={!token || loading}
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

        <AuthButton type="submit" loading={loading} disabled={!token}>
          Restablecer contraseña
        </AuthButton>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0e1a]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00d4ff]/20 border-t-[#00d4ff]" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
