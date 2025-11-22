import "@/styles/globals.css";
import { ReactNode } from "react";
import { Providers } from "@/components/providers";
import { Inter, JetBrains_Mono } from "next/font/google";
import { OmegaLiveProvider } from "@/contexts/OmegaLiveProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: {
    default: "OMEGA | Quantum Financial Intelligence",
    template: "%s | OMEGA"
  },
  description: "Institutional-grade backtesting and market intelligence platform powered by neural-symbolic AI.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-black text-white antialiased selection:bg-purple-500/30 selection:text-purple-200`}>
        <OmegaLiveProvider>
          <Providers>
            {children}
          </Providers>
        </OmegaLiveProvider>
      </body>
    </html>
  );
}
