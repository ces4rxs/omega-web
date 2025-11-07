import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Omega Control Center',
  description: 'Panel principal con resumen de operaciones y analítica en tiempo real.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full bg-slate-950">
      <body className="h-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
