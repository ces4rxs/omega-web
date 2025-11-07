"use client";
import { motion } from "framer-motion";

export default function OmegaPricing() {
  const plans = [
    {
      name: "TRADER",
      price: "$99.99",
      period: "/mes",
      tagline: "Ideal para traders individuales y experimentadores",
      features: [
        "Backtesting ilimitado con hasta 5 años de datos históricos",
        "3 estrategias predefinidas (SMA, RSI, MACD)",
        "Motor de precisión financiera con Decimal.js",
        "Análisis de riesgo básico (Sharpe, Sortino, Max Drawdown)",
        "Simulación Monte Carlo (300 escenarios)",
        "Reportes en JSON/CSV",
        "API REST completa con documentación",
        "Integración Polygon.io (datos de mercado en tiempo real)",
        "Soporte por email",
      ],
      limits: [
        "Hasta 100 backtests por mes",
        "1 estrategia personalizada",
        "Datos históricos: 5 años",
      ],
      ideal: "Traders individuales que validan estrategias antes de operar real.",
      accent: "from-blue-500 to-cyan-400",
    },
    {
      name: "PROFESSIONAL",
      price: "$199.99",
      period: "/mes",
      tagline: "Para traders serios y gestores de carteras pequeñas",
      features: [
        "Todo lo del Plan Trader +",
        "Backtesting ilimitado sin restricciones",
        "10 estrategias predefinidas + personalizadas ilimitadas",
        "Optimización genética avanzada (Pareto v5)",
        "Análisis de riesgo multi-factor (4 modelos simultáneos)",
        "Simulación Monte Carlo avanzada (1,000 escenarios)",
        "Walk-Forward Analysis para validación robusta",
        "Reportes PDF con gráficos profesionales",
        "Análisis de correlación de activos",
        "Webhook notifications para automatización",
        "Datos históricos ilimitados (10+ años)",
        "Soporte prioritario (24h)",
      ],
      ideal:
        "Traders profesionales y equipos que necesitan optimización avanzada.",
      accent: "from-indigo-500 to-purple-500",
    },
    {
      name: "INSTITUTIONAL",
      price: "$499.99",
      period: "/mes",
      tagline: "Para instituciones financieras y hedge funds",
      features: [
        "Todo lo del Plan Professional +",
        "Multi-usuario (hasta 10 usuarios por cuenta)",
        "API dedicada con rate limits extendidos",
        "Integración personalizada con tus sistemas",
        "Reportes white-label con tu branding",
        "Análisis de riesgo institucional (VaR, CVaR, Stress Testing)",
        "Backtesting de portafolios completos",
        "Optimización de portafolios (Efficient Frontier)",
        "Data warehouse con históricos de 20+ años",
        "SLA garantizado (99.9% uptime)",
        "Soporte dedicado (4h, horario extendido)",
        "Onboarding personalizado + training",
        "Acceso anticipado a nuevas funciones",
      ],
      ideal:
        "Hedge funds y firmas cuantitativas que requieren potencia y soporte premium.",
      accent: "from-yellow-400 to-orange-500",
    },
  ];

  return (
    <section
      id="pricing"
      className="relative py-24 px-6 text-white flex flex-col items-center overflow-hidden"
    >
      {/* Fondo cuántico */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_40%_30%,rgba(59,130,246,0.08),transparent_70%),radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.08),transparent_70%)] animate-pulse-slow" />

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-4"
      >
        Elige el plan perfecto para tu estrategia de trading
      </motion.h2>

      <p className="text-gray-400 text-center mb-16 text-sm md:text-base">
        Todos los planes incluyen <span className="text-blue-400 font-semibold">7 días de prueba gratuita</span>.  
        Sin tarjeta de crédito requerida.
      </p>

      {/* Planes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl w-full">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            viewport={{ once: true }}
            className={`relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.4)] hover:shadow-[0_0_35px_rgba(59,130,246,0.2)] transition-all duration-500`}
          >
            <h3
              className={`text-2xl font-bold bg-gradient-to-r ${plan.accent} bg-clip-text text-transparent mb-2`}
            >
              {plan.name}
            </h3>
            <p className="text-gray-400 text-sm mb-3">{plan.tagline}</p>

            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-extrabold">{plan.price}</span>
              <span className="text-gray-400 ml-1">{plan.period}</span>
            </div>

            <ul className="space-y-2 text-sm text-gray-300 mb-6">
              {plan.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>

            <p className="text-gray-400 text-xs mb-4 italic">
              {plan.ideal}
            </p>

            <button
              className={`w-full py-3 mt-4 rounded-md font-semibold tracking-wide bg-gradient-to-r ${plan.accent} hover:opacity-90 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition`}
            >
              Elegir {plan.name}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
