import "@/styles/globals.css";
import { ReactNode } from "react";
import { Providers } from "@/components/providers";

export const metadata = {
  title: "Omega Quantum - Backtesting con IA",
  description: "Plataforma profesional de backtesting e inteligencia financiera cuántica",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-black text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
