"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Calendar,
  AlertCircle,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserSubscription,
  createBillingPortalSession,
  cancelSubscription,
  reactivateSubscription,
  getPlanName,
  formatSubscriptionStatus,
} from "@/lib/stripe";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { UserSubscription } from "@/types/api";

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("subscription") === "success") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
    loadSubscription();
  }, [searchParams]);

  const loadSubscription = async () => {
    setLoading(true);
    try {
      const sub = await getUserSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error("Error loading subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setActionLoading(true);
    try {
      const portalUrl = await createBillingPortalSession();
      window.location.href = portalUrl;
    } catch (error: any) {
      console.error("Error opening billing portal:", error);
      alert("Error al abrir el portal de facturación. Por favor intenta de nuevo.");
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres cancelar tu suscripción? Tendrás acceso hasta el final del período actual."
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const updatedSub = await cancelSubscription();
      setSubscription(updatedSub);
      alert("Suscripción cancelada. Tendrás acceso hasta el final del período actual.");
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      alert("Error al cancelar la suscripción. Por favor intenta de nuevo.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading(true);
    try {
      const updatedSub = await reactivateSubscription();
      setSubscription(updatedSub);
      alert("¡Suscripción reactivada correctamente!");
    } catch (error: any) {
      console.error("Error reactivating subscription:", error);
      alert("Error al reactivar la suscripción. Por favor intenta de nuevo.");
    } finally {
      setActionLoading(false);
    }
  };

  const statusInfo = formatSubscriptionStatus(subscription?.status || null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4 md:p-8">
      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/10 border border-emerald-500/50 backdrop-blur-lg rounded-lg p-4 flex items-center gap-3 text-emerald-400 shadow-xl"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">¡Suscripción activada correctamente!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver al Dashboard</span>
          </button>

          <h1 className="text-4xl font-bold text-white mb-2">
            Facturación y Suscripción
          </h1>
          <p className="text-slate-400">
            Administra tu suscripción y configuración de cuenta
          </p>
        </div>

        {/* Current Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 backdrop-blur-lg border border-slate-700 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Suscripción Actual</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : subscription && subscription.status ? (
            <div className="space-y-4">
              {/* Plan Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Plan</p>
                  <p className="text-xl font-semibold text-white">
                    {getPlanName(subscription.plan)}
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Estado</p>
                  <p className={`text-xl font-semibold ${statusInfo.color}`}>
                    {statusInfo.text}
                  </p>
                </div>
              </div>

              {/* Period End */}
              {subscription.currentPeriodEnd && (
                <div className="bg-slate-800/50 rounded-lg p-4 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">
                      {subscription.cancelAtPeriodEnd
                        ? "Acceso hasta"
                        : "Próxima renovación"}
                    </p>
                    <p className="text-white font-medium">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Cancel Warning */}
              {subscription.cancelAtPeriodEnd && (
                <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-orange-400 font-medium mb-1">
                      Suscripción programada para cancelar
                    </p>
                    <p className="text-sm text-orange-300/80">
                      Tu suscripción terminará al final del período actual. Puedes
                      reactivarla en cualquier momento.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={handleManageBilling}
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                  Administrar Facturación
                </button>

                {subscription.status === "active" && !subscription.cancelAtPeriodEnd && (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={actionLoading}
                    className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancelar Suscripción
                  </button>
                )}

                {subscription.cancelAtPeriodEnd && (
                  <button
                    onClick={handleReactivateSubscription}
                    disabled={actionLoading}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Reactivar Suscripción
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400 mb-6">No tienes una suscripción activa</p>
              <button
                onClick={() => router.push("/pricing")}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
              >
                Ver Planes
              </button>
            </div>
          )}
        </motion.div>

        {/* Change Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ChangePasswordForm />
        </motion.div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <BillingContent />
      </Suspense>
    </ProtectedRoute>
  );
}
