"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, createElement } from "react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const NOT_CONFIGURED_ERROR = new Error(
  "Authentication is not configured yet. Add your Supabase credentials to .env.local and restart the dev server."
)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured())
  const configured = isSupabaseConfigured()

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error("Failed to get session:", error)
      }
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await fetchUserProfile(session.user.id)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchUserProfile = async (userId: string) => {
    if (!configured) return
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      if (data) {
        setUser(data as User)
        return
      }

      // Self-heal: accounts created before the profile trigger existed have no
      // profiles row. Create it from the session so they are not locked out.
      const { data: { session } } = await supabase.auth.getSession()
      const authUser = session?.user
      if (authUser && authUser.id === userId) {
        const meta = (authUser.user_metadata || {}) as { full_name?: string; name?: string }
        const { data: created, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: authUser.id,
            email: authUser.email || "",
            full_name: meta.full_name || meta.name || "Citizen",
            role: "citizen",
          })
          .select("*")
          .maybeSingle()

        if (created) {
          setUser(created as User)
        } else if (insertError) {
          console.error("Failed to create missing profile:", insertError)
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!configured) return { error: NOT_CONFIGURED_ERROR }
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error ? new Error(error.message) : null }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Sign in failed") }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!configured) return { error: NOT_CONFIGURED_ERROR }
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })

      if (error) return { error: new Error(error.message) }

      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            email,
            full_name: fullName,
            role: "citizen",
          })

        if (profileError) {
          return { error: new Error(profileError.message) }
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Sign up failed") }
    }
  }

  const signInWithGoogle = async () => {
    if (!configured) return { error: NOT_CONFIGURED_ERROR }
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        const friendly =
          error.status === 400 && /provider is not enabled/i.test(error.message)
            ? "Google sign-in is not enabled for this project yet. Use email and password, or enable the Google provider in Supabase Auth settings."
            : error.message
        return { error: new Error(friendly) }
      }
      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Google sign in failed") }
    }
  }

  const resetPassword = async (email: string) => {
    if (!configured) return { error: NOT_CONFIGURED_ERROR }
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) return { error: new Error(error.message) }
      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Password reset failed") }
    }
  }

  const signOut = async () => {
    if (!configured) return
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  const refreshUser = async () => {
    if (!configured) return
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await fetchUserProfile(session.user.id)
    }
  }

  const value = {
    user,
    loading,
    configured,
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
    signOut,
    refreshUser,
  }

  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}