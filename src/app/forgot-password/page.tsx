"use client";

import Image from "next/image";
import { useState } from "react";
import { forgotPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const res = await forgotPassword(email);
      setMessage(res.message || "Correo enviado, revisa tu bandeja");
    } catch {
      setError("No se pudo enviar el correo");
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
          className="drop-shadow-lg"
        />
        <h1 className="text-3xl font-bold mt-3 tracking-wide">Recuperar Contraseña</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-xl"
      >
        <input
          type="email"
          placeholder="Correo registrado"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 w-full rounded-md bg-zinc-800/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
        <button
          type="submit"
          className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-700 font-semibold transition"
        >
          Enviar enlace
        </button>
        {message && <p className="text-green-400 text-center">{message}</p>}
        {error && <p className="text-red-400 text-center">{error}</p>}
      </form>

      <a href="/login" className="mt-4 text-blue-400 hover:underline text-sm">
        Volver al inicio de sesión
      </a>
    </main>
  );
}
