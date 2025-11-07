import "@/styles/globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Omega Quantum",
  description: "Plataforma de backtesting e inteligencia financiera",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-black text-white">{children}</body>
    </html>
  );
}
