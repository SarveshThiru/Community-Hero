"use client"

import { AuthProvider } from "@/hooks/use-auth"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TooltipProvider>
        <ToastProvider>
          <div className="pb-16 md:pb-0">
            {children}
          </div>
          <MobileNav />
          <ToastViewport />
        </ToastProvider>
      </TooltipProvider>
    </AuthProvider>
  )
}