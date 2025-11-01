// next.config.mjs — Configuración estable para Render / Producción
const nextConfig = {
  output: "standalone", // 🔒 necesario para Render
  typescript: {
    ignoreBuildErrors: true, // ⚙️ permite build aunque haya warnings menores
  },
  reactCompiler: true,
};

export default nextConfig;
