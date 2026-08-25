"use client"

import { AuthProvider } from "@/hooks/use-auth"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TooltipProvider>
        <ToastProvider>
          {children}
          <ToastViewport />
        </ToastProvider>
      </TooltipProvider>
    </AuthProvider>
  )
}