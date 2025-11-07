"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import OmegaFeatures from "@/components/OmegaFeatures";
import OmegaDifferentiators from "@/components/OmegaDifferentiators";
import OmegaPricing from "@/components/OmegaPricing"; // 🧩 agregado

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col bg-gradient-to-b from-black via-zinc-950 to-zinc-900 text-white overflow-hidden">
      {/* === NAVBAR === */}
      <header className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-md border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/omega-logo.png"
              alt="Omega Quantum Logo"
              width={36}
              height={36}
              className="drop-shadow-lg"
            />
            <h1 className="text-lg font-bold tracking-wider">
              OMEGA <span className="text-blue-400">QUANTUM</span>
            </h1>
          </div>

          {/* LINKS */}
          <ul className="hidden md:flex gap-8 text-sm text-gray-300">
            <li>
              <a href="#features" className="hover:text-white transition">
                Características
              </a>
            </li>
            <li>
              <a href="#differentiators" className="hover:text-white transition">
                Diferenciadores
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-white transition">
                Planes
              </a>
            </li>
            <li>
              <a href="#community" className="hover:text-white transition">
                Comunidad
              </a>
            </li>
          </ul>

          {/* BOTONES */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold px-4 py-2 rounded-md border border-white/20 hover:bg-white/10 transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 shadow-[0_0_15px_rgba(59,130,246,0.4)] transition"
            >
              Comenzar Gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* === HERO === */}
      <section className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left flex-grow px-6 lg:px-24 pt-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="max-w-2xl"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Domina el mercado con{" "}
            <span className="text-blue-400">Inteligencia Cuántica</span>
          </h1>

          <p className="text-lg text-gray-300 mt-5 leading-relaxed">
            Análisis predictivo y estrategias optimizadas, impulsadas por
            nuestra IA de próxima generación. Diseñada para traders, analistas y
            mentes visionarias.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            >
              Prueba Quantum IA
            </Link>
            <Link
              href="#pricing"
              className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Ver Planes
            </Link>
          </div>
        </motion.div>

        {/* IMAGEN */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1 }}
          className="mt-12 lg:absolute lg:right-20 lg:top-40"
        >
          <Image
            src="/images/quantum-hologram.png"
            alt="Omega Quantum IA"
            width={480}
            height={480}
            className="drop-shadow-[0_0_25px_rgba(59,130,246,0.5)] animate-float"
          />
        </motion.div>
      </section>

      {/* === SECCIONES NUEVAS === */}
      <OmegaFeatures />
      <OmegaDifferentiators />
      <OmegaPricing /> {/* 🧠 sección de planes añadida */}

      {/* EFECTO FONDO */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.08),transparent_60%)] blur-2xl" />
    </main>
  );
}
