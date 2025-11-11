"use client"

import { motion } from "framer-motion"
import Link from "next/link"

import { Button } from "@/components/ui/button"

const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export const HeroSection = () => {
  const features = ["Latencia < 40ms", "IA Predictiva", "Cobertura Multi-asset", "Render Ready"]

  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col gap-10 rounded-3xl border border-dark-border bg-gradient-to-br from-dark-bg via-dark-bg-secondary to-[#020617] p-10 shadow-2xl"
    >
      <div className="max-w-2xl space-y-6">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300"
        >
          Omega Quantum Intelligence
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-4xl font-bold leading-tight text-white sm:text-5xl"
        >
          Arquitectura de trading cuantitativo con latencia ultrabaja.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-base text-dark-text-secondary sm:text-lg"
        >
          Conecta tu cuenta profesional al motor Omega v6.2, automatiza backtests de alto rendimiento y
          ejecuta análisis maestros con IA sobre mercados globales.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-wrap items-center gap-4"
        >
          <Button asChild size="lg" className="bg-amber-400 text-black hover:bg-amber-300">
            <Link href="/dashboard">Ir al dashboard</Link>
          </Button>
          <Button
            variant="outline"
            asChild
            size="lg"
            className="border-amber-400/40 text-amber-300 hover:bg-amber-500/10"
          >
            <Link href="/docs">Ver documentación</Link>
          </Button>
        </motion.div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {features.map((item, index) => (
          <motion.div
            key={item}
            variants={featureVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4, delay: 0.55 + index * 0.05 }}
            className="rounded-2xl border border-amber-400/20 bg-dark-bg-secondary/60 p-6 text-sm text-dark-text-secondary shadow-lg"
          >
            <p className="text-lg font-semibold text-amber-200">{item}</p>
            <p className="mt-2 text-xs leading-relaxed">
              Validado para despliegues en Render, con autenticación JWT y análisis maestros conectados a
              /api/ai/master-analysis.
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
