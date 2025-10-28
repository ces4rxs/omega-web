"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  mode: "login" | "register";
  onSubmit: (email: string, password: string) => Promise<void>;
}

export default function AuthForm({ mode, onSubmit }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al autenticar.");
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex flex-col bg-zinc-900 p-8 rounded-2xl shadow-2xl w-full max-w-md"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-bold mb-4 text-center text-white">
        {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
      </h2>

      <input
        className="p-3 rounded bg-zinc-800 mb-3 text-white outline-none"
        placeholder="Correo electrónico"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="p-3 rounded bg-zinc-800 mb-4 text-white outline-none"
        placeholder="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
      >
        {mode === "login" ? "Entrar" : "Registrarse"}
      </button>

      {error && <p className="text-red-400 text-center mt-3">{error}</p>}
    </motion.form>
  );
}
