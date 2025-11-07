"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, TrendingUp, X, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PRICING_PLANS, createCheckoutSession, type PricingPlan } from "@/lib/stripe";
import PricingCard from "@/components/PricingCard";
import { colors } from "@/styles/theme";

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
    <div className="min-h-screen" style={{
      background: `linear-gradient(to bottom right, ${colors.bgPrimary}, ${colors.bgSecondary}, ${colors.bgPrimary})`
    }}>
      {/* Canceled Message */}
      <AnimatePresence>
        {showCanceledMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 backdrop-blur-lg rounded-lg p-4 flex items-center gap-3 shadow-xl border"
            style={{
              backgroundColor: `${colors.goldDark}1a`,
              borderColor: `${colors.goldDark}80`,
              color: colors.yellowAccent
            }}
          >
            <X className="w-5 h-5" />
            <span className="font-medium">Pago cancelado. Puedes intentar de nuevo cuando quieras.</span>
            <button
              onClick={() => setShowCanceledMessage(false)}
              className="ml-2"
              style={{ color: colors.yellowAccent }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.goldDark}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.yellowAccent}
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
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4" style={{ color: colors.textPrimary }}>
            Elige tu <span className="bg-gradient-to-r bg-clip-text text-transparent" style={{
              backgroundImage: `linear-gradient(to right, ${colors.cyanPrimary}, ${colors.greenBullish})`
            }}>Plan Perfecto</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: colors.textSecondary }}>
            Potencia tu trading con IA avanzada. Todos los planes incluyen 7 días de prueba gratis.
          </p>
        </motion.div>

        {/* Features Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-sm border rounded-xl p-6 text-center"
            style={{
              backgroundColor: `${colors.bgCard}80`,
              borderColor: colors.borderPrimary
            }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{
              backgroundColor: `${colors.cyanPrimary}33`
            }}>
              <Zap className="w-6 h-6" style={{ color: colors.cyanPrimary }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>IA Avanzada</h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Módulos de IA de última generación para análisis predictivo
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-sm border rounded-xl p-6 text-center"
            style={{
              backgroundColor: `${colors.bgCard}80`,
              borderColor: colors.borderPrimary
            }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{
              backgroundColor: `${colors.greenBullish}33`
            }}>
              <TrendingUp className="w-6 h-6" style={{ color: colors.greenBullish }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>Backtesting Preciso</h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Prueba tus estrategias con datos históricos de alta calidad
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="backdrop-blur-sm border rounded-xl p-6 text-center"
            style={{
              backgroundColor: `${colors.bgCard}80`,
              borderColor: colors.borderPrimary
            }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{
              backgroundColor: `${colors.yellowAccent}33`
            }}>
              <Shield className="w-6 h-6" style={{ color: colors.yellowAccent }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>Seguro y Confiable</h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
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
          className="backdrop-blur-sm border rounded-xl p-8 max-w-3xl mx-auto"
          style={{
            backgroundColor: `${colors.bgCard}80`,
            borderColor: colors.borderPrimary
          }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: colors.textPrimary }}>
            Preguntas Frecuentes
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                <Check className="w-5 h-5" style={{ color: colors.greenBullish }} />
                ¿Puedo cancelar en cualquier momento?
              </h3>
              <p className="ml-7" style={{ color: colors.textSecondary }}>
                Sí, puedes cancelar tu suscripción en cualquier momento desde tu panel de facturación.
                No hay contratos de permanencia.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                <Check className="w-5 h-5" style={{ color: colors.greenBullish }} />
                ¿Qué incluye la prueba gratuita?
              </h3>
              <p className="ml-7" style={{ color: colors.textSecondary }}>
                La prueba de 7 días te da acceso completo a todas las funcionalidades del plan elegido.
                No se te cobrará hasta que finalice el período de prueba.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                <Check className="w-5 h-5" style={{ color: colors.greenBullish }} />
                ¿Puedo cambiar de plan después?
              </h3>
              <p className="ml-7" style={{ color: colors.textSecondary }}>
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
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              ¿Ya tienes cuenta?{" "}
              <button
                onClick={() => router.push("/login")}
                className="font-semibold"
                style={{ color: colors.cyanPrimary }}
                onMouseEnter={(e) => e.currentTarget.style.color = colors.cyanLight}
                onMouseLeave={(e) => e.currentTarget.style.color = colors.cyanPrimary}
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
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: colors.bgPrimary }} />}>
      <PricingContent />
    </Suspense>
  );
}
