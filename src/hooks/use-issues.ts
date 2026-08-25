"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase"
import type { Issue, Comment, IssueUpdate, PaginatedResponse, DuplicateIssue, AIClassificationResult } from "@/types"
import { useAuth } from "./use-auth"

export function useIssues(filters?: {
  status?: string
  category?: string
  severity?: string
  latitude?: number
  longitude?: number
  radius?: number
  page?: number
  limit?: number
}) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const supabase = createClient()

  const filtersKey = JSON.stringify(filters ?? null)
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const fetchIssues = useCallback(async () => {
    const f = filtersRef.current
    setLoading(true)
    setError(null)

    let query = supabase
      .from("issue_with_details")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    if (f?.status) {
      query = query.eq("status", f.status)
    }
    if (f?.category) {
      query = query.eq("category", f.category)
    }
    if (f?.severity) {
      query = query.eq("severity", f.severity)
    }

    const page = f?.page || 1
    const limit = f?.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.range(from, to)

    const { data, error: fetchError, count } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setIssues(data as Issue[] || [])
      setPagination({
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      })
    }
    setLoading(false)
  }, [supabase, filtersKey])

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  return { issues, loading, error, pagination, refetch: fetchIssues }
}

export function useIssue(issueId: string) {
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchIssue = async () => {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from("issue_with_details")
        .select("*")
        .eq("id", issueId)
        .single()

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setIssue(data as Issue)
      }
      setLoading(false)
    }

    if (issueId) {
      fetchIssue()
    }
  }, [issueId, supabase])

  return { issue, loading, error }
}

export function useNearbyIssues(latitude: number, longitude: number, radius = 500) {
  const [issues, setIssues] = useState<DuplicateIssue[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const findDuplicates = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc("find_duplicate_issues", {
      lat: latitude,
      lng: longitude,
      category_filter: "all",
      radius_meters: radius,
    })

    if (!error && data) {
      setIssues(data as DuplicateIssue[])
    }
    setLoading(false)
  }, [latitude, longitude, radius, supabase])

  useEffect(() => {
    if (latitude && longitude) {
      findDuplicates()
    }
  }, [findDuplicates])

  return { issues, loading, refetch: findDuplicates }
}

export function useCreateIssue() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const { user } = useAuth()

  const createIssue = async (issueData: {
    title: string
    description: string
    category: string
    severity: string
    latitude: number
    longitude: number
    address: string
    images: string[]
  }) => {
    if (!user) {
      setError("User not authenticated")
      return { data: null, error: new Error("User not authenticated") }
    }

    setLoading(true)
    setError(null)

    const { data, error: insertError } = await supabase
      .from("issues")
      .insert({
        ...issueData,
        reporter_id: user.id,
        status: "reported",
        upvotes: 0,
        downvotes: 0,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return { data: null, error: new Error(insertError.message) }
    }

    await supabase
      .from("issue_updates")
      .insert({
        issue_id: data.id,
        user_id: user.id,
        new_status: "reported",
        message: "Issue reported by citizen",
      })

    setLoading(false)
    return { data: data as Issue, error: null }
  }

  return { createIssue, loading, error }
}

export function useUpdateIssue() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const { user } = useAuth()

  const updateIssue = async (issueId: string, updates: Partial<Issue>, message?: string) => {
    if (!user) {
      setError("User not authenticated")
      return { error: new Error("User not authenticated") }
    }

    setLoading(true)
    setError(null)

    const { data: currentIssue } = await supabase
      .from("issues")
      .select("status")
      .eq("id", issueId)
      .single()

    const { error: updateError } = await supabase
      .from("issues")
      .update(updates)
      .eq("id", issueId)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return { error: new Error(updateError.message) }
    }

    if (updates.status && updates.status !== currentIssue?.status) {
      await supabase
        .from("issue_updates")
        .insert({
          issue_id: issueId,
          user_id: user.id,
          previous_status: currentIssue?.status,
          new_status: updates.status,
          message: message || `Status changed to ${updates.status}`,
        })

      if (updates.status === "resolved") {
        await supabase
          .from("issues")
          .update({ resolved_at: new Date().toISOString() })
          .eq("id", issueId)
      } else if (updates.status === "verified") {
        await supabase
          .from("issues")
          .update({ verified_at: new Date().toISOString() })
          .eq("id", issueId)
      } else if (updates.status === "assigned") {
        await supabase
          .from("issues")
          .update({ assigned_at: new Date().toISOString() })
          .eq("id", issueId)
      }
    }

    setLoading(false)
    return { error: null }
  }

  return { updateIssue, loading, error }
}

export function useVote() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { user } = useAuth()

  const vote = async (issueId: string, voteType: "up" | "down") => {
    if (!user) return { error: new Error("User not authenticated") }

    setLoading(true)

    const { data: existingVote } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("issue_id", issueId)
      .eq("user_id", user.id)
      .single()

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        await supabase
          .from("votes")
          .delete()
          .eq("issue_id", issueId)
          .eq("user_id", user.id)
      } else {
        await supabase
          .from("votes")
          .update({ vote_type: voteType })
          .eq("issue_id", issueId)
          .eq("user_id", user.id)
      }
    } else {
      await supabase
        .from("votes")
        .insert({ issue_id: issueId, user_id: user.id, vote_type: voteType })
    }

    setLoading(false)
    return { error: null }
  }

  return { vote, loading }
}

export function useFollow() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { user } = useAuth()

  const toggleFollow = async (issueId: string) => {
    if (!user) return { error: new Error("User not authenticated") }

    setLoading(true)

    const { data: existingFollow } = await supabase
      .from("follows")
      .select("id")
      .eq("issue_id", issueId)
      .eq("user_id", user.id)
      .single()

    if (existingFollow) {
      await supabase
        .from("follows")
        .delete()
        .eq("issue_id", issueId)
        .eq("user_id", user.id)
    } else {
      await supabase
        .from("follows")
        .insert({ issue_id: issueId, user_id: user.id })
    }

    setLoading(false)
    return { error: null }
  }

  return { toggleFollow, loading }
}

export function useComments(issueId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("comments")
      .select(`
        *,
        user:profiles(full_name, avatar_url, role)
      `)
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true })

    if (data) {
      setComments(data as Comment[])
    }
    setLoading(false)
  }, [issueId, supabase])

  useEffect(() => {
    if (issueId) {
      fetchComments()
    }
  }, [fetchComments])

  const addComment = async (content: string, images: string[] = []) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return { error: new Error("Not authenticated") }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        issue_id: issueId,
        user_id: session.user.id,
        content,
        images,
      })
      .select(`
        *,
        user:profiles(full_name, avatar_url, role)
      `)
      .single()

    if (!error && data) {
      setComments(prev => [...prev, data as Comment])
    }

    return { data: data as Comment | null, error: error ? new Error(error.message) : null }
  }

  return { comments, loading, addComment, refetch: fetchComments }
}

export function useIssueUpdates(issueId: string) {
  const [updates, setUpdates] = useState<IssueUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUpdates = async () => {
      const { data } = await supabase
        .from("issue_updates")
        .select(`
          *,
          user:profiles(full_name, avatar_url, role)
        `)
        .eq("issue_id", issueId)
        .order("created_at", { ascending: false })

      if (data) {
        setUpdates(data as IssueUpdate[])
      }
      setLoading(false)
    }

    if (issueId) {
      fetchUpdates()
    }
  }, [issueId, supabase])

  return { updates, loading }
}