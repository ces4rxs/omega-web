import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import { Sidebar } from "@/components/Sidebar"
import { AuthProvider } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Omega Quantum Web",
  description:
    "Omega Quantum Web dashboard for institutional-grade quantitative intelligence.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          inter.className,
          "bg-dark-bg text-dark-text min-h-screen antialiased",
        )}
      >
        <AuthProvider>
          <div className="flex min-h-screen bg-dark-bg">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-dark-bg-secondary px-6 py-8">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
