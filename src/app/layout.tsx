import type { Metadata } from "next";
import "./globals.css";

<<<<<<< HEAD
export const metadata: Metadata = {
  title: "OMEGA Trading Platform",
  description: "Plataforma de trading algorítmico",
=======
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "OMEGA Web - Advanced Trading Backtesting Platform",
  description: "Professional trading backtesting platform with AI-powered analysis and optimization",
>>>>>>> ea9f05d679f02759f0c0a78efb4f4b522d81ddca
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
<<<<<<< HEAD
      <body>{children}</body>
=======
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
>>>>>>> ea9f05d679f02759f0c0a78efb4f4b522d81ddca
    </html>
  );
}