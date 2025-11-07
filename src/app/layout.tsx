import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OMEGA Trading Platform",
  description: "Plataforma de trading algorítmico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}