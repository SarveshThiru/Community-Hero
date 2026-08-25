"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import type { AnalyticsData } from "@/types"

export function useAnalytics(filters?: {
  startDate?: string
  endDate?: string
  department?: string
}) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase.rpc("get_issue_analytics", {
        start_date: filters?.startDate,
        end_date: filters?.endDate,
        department: filters?.department,
      })

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setAnalytics(data as AnalyticsData)
      }
      setLoading(false)
    }

    fetchAnalytics()
  }, [filters, supabase])

  return { analytics, loading, error }
}

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    criticalIssues: 0,
    myReports: 0,
    myUpvotes: 0,
    myFollows: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const [
        { count: totalReports },
        { count: pendingIssues },
        { count: resolvedIssues },
        { count: criticalIssues },
        { count: myReports },
        { count: myUpvotes },
        { count: myFollows },
      ] = await Promise.all([
        supabase.from("issues").select("*", { count: "exact", head: true }),
        supabase.from("issues").select("*", { count: "exact", head: true }).in("status", ["reported", "verified", "assigned", "in_progress"]),
        supabase.from("issues").select("*", { count: "exact", head: true }).eq("status", "resolved"),
        supabase.from("issues").select("*", { count: "exact", head: true }).eq("severity", "critical"),
        supabase.from("issues").select("*", { count: "exact", head: true }).eq("reporter_id", session.user.id),
        supabase.from("votes").select("*", { count: "exact", head: true }).eq("user_id", session.user.id).eq("vote_type", "up"),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("user_id", session.user.id),
      ])

      setStats({
        totalReports: totalReports || 0,
        pendingIssues: pendingIssues || 0,
        resolvedIssues: resolvedIssues || 0,
        criticalIssues: criticalIssues || 0,
        myReports: myReports || 0,
        myUpvotes: myUpvotes || 0,
        myFollows: myFollows || 0,
      })
      setLoading(false)
    }

    fetchStats()
  }, [supabase])

  return { stats, loading }
}