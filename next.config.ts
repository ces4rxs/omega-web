// next.config.ts — Configuración optimizada para producción
const nextConfig = {
  output: "standalone", // 🔒 necesario para Render/Docker
  typescript: {
    ignoreBuildErrors: false, // ✅ Activar validación TypeScript
  },
  eslint: {
    ignoreDuringBuilds: false, // ✅ Activar validación ESLint
  },
  // Experimental features
  experimental: {
    // React Compiler (si está disponible en tu versión)
    // reactCompiler: true,
  },
};

export default nextConfig;
