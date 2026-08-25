"use client"

import { ReactNode } from "react"
import { AuthProvider } from "@/hooks/use-auth"

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-gray-50">
        {children}
      </div>
    </AuthProvider>
  )
}