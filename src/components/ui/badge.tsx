"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info"
    | "hatch"
    | "dense"
    | "dashed"
    | "inverted"
    | "solid"
    | "critical"
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants: Record<string, string> = {
      default: "bg-blue-50 text-blue-700 border border-blue-200",
      secondary: "bg-gray-100 text-gray-700 border border-gray-200",
      destructive: "bg-red-50 text-red-700 border border-red-200",
      outline: "bg-transparent text-gray-700 border border-gray-300",
      success: "bg-green-50 text-green-700 border border-green-200",
      warning: "bg-amber-50 text-amber-800 border border-amber-200",
      info: "bg-cyan-50 text-cyan-700 border border-cyan-200",
      hatch: "bg-blue-50 text-blue-700 border border-blue-200",
      dense: "bg-blue-100 text-blue-800 border border-blue-300 font-semibold",
      dashed: "bg-purple-50 text-purple-700 border border-purple-200",
      inverted: "bg-gray-900 text-white border border-gray-900",
      solid: "bg-green-600 text-white border border-green-600",
      critical: "bg-red-100 text-red-800 border border-red-300 font-semibold",
    }

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-4",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
