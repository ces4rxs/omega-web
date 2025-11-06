"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, TrendingUp, X, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PRICING_PLANS, createCheckoutSession, type PricingPlan } from "@/lib/stripe";
import PricingCard from "@/components/PricingCard";

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCanceledMessage, setShowCanceledMessage] = useState(false);

  useEffect(() => {
    if (searchParams.get("canceled") === "true") {
      setShowCanceledMessage(true);
      setTimeout(() => setShowCanceledMessage(false), 5000);
    }
  }, [searchParams]);

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/pricing&plan=${plan.id}`);
      return;
    }

    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      const checkoutUrl = await createCheckoutSession(plan.priceId);
      window.location.href = checkoutUrl;
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      alert("Error al iniciar el proceso de pago. Por favor intenta de nuevo.");
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Canceled Message */}
      <AnimatePresence>
        {showCanceledMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-orange-500/10 border border-orange-500/50 backdrop-blur-lg rounded-lg p-4 flex items-center gap-3 text-orange-400 shadow-xl"
          >
            <X className="w-5 h-5" />
            <span className="font-medium">Pago cancelado. Puedes intentar de nuevo cuando quieras.</span>
            <button
              onClick={() => setShowCanceledMessage(false)}
              className="ml-2 hover:text-orange-300"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
            Elige tu <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Plan Perfecto</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Potencia tu trading con IA avanzada. Todos los planes incluyen 7 días de prueba gratis.
          </p>
        </motion.div>

        {/* Features Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">IA Avanzada</h3>
            <p className="text-slate-400 text-sm">
              Módulos de IA de última generación para análisis predictivo
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center"
          >
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Backtesting Preciso</h3>
            <p className="text-slate-400 text-sm">
              Prueba tus estrategias con datos históricos de alta calidad
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Seguro y Confiable</h3>
            <p className="text-slate-400 text-sm">
              Infraestructura robusta con 99.9% de uptime garantizado
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {PRICING_PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PricingCard
                plan={plan}
                onSelect={handleSelectPlan}
                loading={loading && selectedPlan === plan.id}
              />
            </motion.div>
          ))}
        </div>

        {/* FAQ / Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                ¿Puedo cancelar en cualquier momento?
              </h3>
              <p className="text-slate-400 ml-7">
                Sí, puedes cancelar tu suscripción en cualquier momento desde tu panel de facturación.
                No hay contratos de permanencia.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                ¿Qué incluye la prueba gratuita?
              </h3>
              <p className="text-slate-400 ml-7">
                La prueba de 7 días te da acceso completo a todas las funcionalidades del plan elegido.
                No se te cobrará hasta que finalice el período de prueba.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                ¿Puedo cambiar de plan después?
              </h3>
              <p className="text-slate-400 ml-7">
                Por supuesto. Puedes actualizar o bajar de plan en cualquier momento desde tu
                configuración de facturación.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-12"
          >
            <p className="text-slate-400 mb-4">
              ¿Ya tienes cuenta?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                Inicia sesión
              </button>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <PricingContent />
    </Suspense>
  );
}
