import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export function isSupabaseConfigured(): boolean {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false

  try {
    const url = new URL(SUPABASE_URL)
    // Reject obvious placeholders
    if (
      url.protocol !== "https:" ||
      SUPABASE_URL.includes("your-project") ||
      SUPABASE_URL.includes("your_supabase") ||
      SUPABASE_ANON_KEY.includes("your-anon-key") ||
      SUPABASE_ANON_KEY.includes("your_anon")
    ) {
      return false
    }
    return true
  } catch {
    return false
  }
}

let cachedClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    )
  }

  if (!cachedClient) {
    // Guard against project URLs pasted with the REST path suffix - the client
    // appends /rest/v1 itself, and a doubled path makes the API gateway reject
    // every request with "No API key found in request".
    const normalizedUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, "")
    cachedClient = createBrowserClient<Database>(normalizedUrl, SUPABASE_ANON_KEY)
  }
  return cachedClient
}