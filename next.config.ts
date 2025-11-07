// next.config.ts — Configuración optimizada para producción
const nextConfig = {
  output: "standalone", // 🔒 necesario para Render/Docker
  srcDir: "src", // 👈 Indica a Next.js que tu código está dentro de /src

  typescript: {
    ignoreBuildErrors: false, // ✅ Valida errores de TypeScript
  },

  eslint: {
    ignoreDuringBuilds: false, // ✅ Valida errores de ESLint
  },

  experimental: {
    appDir: true, // ✅ Habilita el modo App Router
  },
};

export default nextConfig;
