// next.config.ts — Configuración optimizada para producción
const nextConfig = {
  output: "standalone", // 🔒 necesario para Render/Docker

  typescript: {
    ignoreBuildErrors: false, // ✅ Valida errores de TypeScript
  },

  eslint: {
    ignoreDuringBuilds: false, // ✅ Valida errores de ESLint
  },
};

export default nextConfig;
