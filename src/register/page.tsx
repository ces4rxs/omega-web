"use client";

import Image from "next/image";
import { useState } from "react";
import { registerUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerUser(email, password, name);
      router.push("/login");
    } catch {
      setError("Error al registrarse, intenta de nuevo");
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
          className="drop-shadow-lg"
        />
        <h1 className="text-3xl font-bold mt-3 tracking-wide">Crear Cuenta</h1>
      </div>

      <form
        onSubmit={handleRegister}
        className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-xl"
      >
        <input
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-3 w-full rounded-md bg-zinc-800/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 w-full rounded-md bg-zinc-800/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 w-full rounded-md bg-zinc-800/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-md bg-green-600 hover:bg-green-700 font-semibold transition"
        >
          {loading ? "Creando..." : "Registrarse"}
        </button>

        {error && <p className="text-red-400 text-center">{error}</p>}
      </form>

      <p className="mt-4 text-gray-400 text-sm">
        ¿Ya tienes cuenta?{" "}
        <a href="/login" className="text-blue-400 hover:underline">
          Inicia sesión
        </a>
      </p>
    </main>
  );
}
