"use client"

import { ToastProvider } from "@/components/ui/toast"
import { AuthProvider } from "@/contexts/AuthProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  )
}
