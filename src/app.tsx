"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <main className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-zinc-900 text-white px-6">
      {/* Fondo sutil con resplandor cuántico */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_70%)] blur-3xl" />

      {/* Contenido principal */}
      <div className="relative z-10 grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto items-center">
        {/* Columna de texto */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
            Domina el mercado con{" "}
            <span className="text-blue-400">Inteligencia Cuántica</span>
          </h1>

          <p className="text-lg text-gray-300 max-w-md leading-relaxed">
            Análisis predictivo y estrategias optimizadas, impulsadas por
            nuestra IA de próxima generación.  
            Diseñada para traders, analistas y mentes visionarias.
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition shadow-[0_0_12px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]"
            >
              Prueba Quantum IA
            </Link>
            <Link
              href="/login"
              className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Empezar Gratis
            </Link>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Sin tarjeta de crédito. Cancela en cualquier momento.
          </p>
        </motion.div>

        {/* Imagen lateral */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="relative flex justify-center"
        >
          <div className="absolute -inset-8 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)] blur-2xl" />
          <Image
            src="/images/quantum-hologram.png"
            alt="Omega Quantum IA"
            width={480}
            height={480}
            className="relative drop-shadow-[0_0_20px_rgba(59,130,246,0.4)] animate-float"
          />
        </motion.div>
      </div>
    </main>
  );
}
