"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import type { PricingPlan } from "@/lib/stripe";

interface PricingCardProps {
  plan: PricingPlan;
  onSelect: (plan: PricingPlan) => void;
  loading?: boolean;
}

export default function PricingCard({ plan, onSelect, loading }: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-slate-900/80 backdrop-blur-lg rounded-2xl border-2 p-8 ${
        plan.popular
          ? "border-emerald-500 shadow-lg shadow-emerald-500/20"
          : "border-slate-700"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Más Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent from-white to-slate-300">
            ${plan.price}
          </span>
          <span className="text-slate-400">/{plan.interval === "month" ? "mes" : "año"}</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3 text-slate-300"
          >
            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{feature}</span>
          </motion.li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan)}
        disabled={loading}
        className={`w-full py-3 rounded-lg font-semibold transition-all ${
          plan.popular
            ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            : "bg-slate-800 hover:bg-slate-700 text-white"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? "Procesando..." : "Seleccionar Plan"}
      </button>

      {plan.interval === "month" && (
        <p className="text-center text-xs text-slate-500 mt-3">
          7 días de prueba gratis
        </p>
      )}
    </motion.div>
  );
}
