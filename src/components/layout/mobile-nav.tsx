"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Map as MapIcon, PlusCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/map", label: "Map", icon: MapIcon },
  { href: "/report", label: "Report", icon: PlusCircle, primary: true },
  { href: "/profile", label: "Profile", icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <div className="grid grid-cols-4">
        {TABS.map(({ href, label, icon: Icon, primary }) => {
          const active = pathname === href
          if (primary) {
            return (
              <Link key={href} href={href} className="flex flex-col items-center justify-center py-2" aria-label={label}>
                <span className="-mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-[10px] font-semibold text-blue-700">{label}</span>
              </Link>
            )
          }
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-blue-700" : "text-gray-500 hover:text-gray-800"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-blue-600")} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
