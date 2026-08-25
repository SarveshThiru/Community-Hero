"use client"

import { useEffect, useState } from "react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase"

interface LiveCountersProps {
  className?: string
}

/**
 * Monumental live counters. Reads real counts from Supabase when configured;
 * renders an honest em-dash placeholder when it is not - never a fabricated number.
 */
export function LiveCounters({ className }: LiveCountersProps) {
  const [counts, setCounts] = useState<{ open: string; resolved: string; critical: string }>({
    open: "—",
    resolved: "—",
    critical: "—",
  })
  const [landed, setLanded] = useState(false)

  useEffect(() => {
    if (landed) {
      const t = setTimeout(() => setLanded(false), 500)
      return () => clearTimeout(t)
    }
  }, [landed])

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    const supabase = createClient()

    const countOf = async (filter: { column: string; value: string }) => {
      const { count } = await supabase
        .from("issue_with_details")
        .select("id", { count: "exact", head: true })
        .eq(filter.column, filter.value)
      return typeof count === "number" ? String(count).padStart(2, "0") : "—"
    }

    Promise.all([
      (async () => {
        const { count: total } = await supabase
          .from("issue_with_details")
          .select("id", { count: "exact", head: true })
        const { count: done } = await supabase
          .from("issue_with_details")
          .select("id", { count: "exact", head: true })
          .in("status", ["resolved", "rejected"])
        if (typeof total === "number" && typeof done === "number") {
          return String(Math.max(0, total - done)).padStart(2, "0")
        }
        return "—"
      })(),
      countOf({ column: "status", value: "resolved" }),
      countOf({ column: "severity", value: "critical" }),
    ]).then(([open, resolved, critical]) => {
      setCounts({ open, resolved, critical })
      setLanded(true)
    })
  }, [])

  const items = [
    { label: "Open Signals", value: counts.open },
    { label: "Resolved", value: counts.resolved },
    { label: "Critical", value: counts.critical },
  ]

  return (
    <dl
      className={`grid grid-cols-3 divide-x divide-black border border-black bg-black/[0.02] ${
        landed ? "animate-invert-flicker" : ""
      } ${className ?? ""}`}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0 px-2 py-3 text-center sm:px-6">
          <dd
            className="text-2xl font-bold leading-none tabular-nums sm:text-5xl"
            aria-label={`${item.label}: ${item.value}`}
          >
            {item.value}
          </dd>
          <dt className="label-caps mt-2 truncate text-black/60">{item.label}</dt>
        </div>
      ))}
    </dl>
  )
}
