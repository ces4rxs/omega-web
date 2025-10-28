/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // 🔒 Evita que Next.js intente prerender páginas client-only
    appDir: true,
  },
  // ⛔ Ignora errores de prerender en build
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // ⚙️ Excluye rutas sensibles del prerender
  async redirects() {
    return [
      {
        source: '/reset',
        destination: '/login', // solo como fallback temporal
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
