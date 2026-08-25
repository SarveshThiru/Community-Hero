import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const status = searchParams.get("status")
  const category = searchParams.get("category")
  const severity = searchParams.get("severity")
  const latitude = searchParams.get("latitude")
  const longitude = searchParams.get("longitude")
  const radius = parseInt(searchParams.get("radius") || "5000")

  let query = supabase
    .from("issue_with_details")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })

  if (status) query = query.eq("status", status)
  if (category) query = query.eq("category", category)
  if (severity) query = query.eq("severity", severity)

  if (latitude && longitude) {
    const { data: nearbyIssues } = await supabase.rpc("get_nearby_issues", {
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
      radius_meters: radius,
      limit,
    })
    return NextResponse.json({
      success: true,
      data: nearbyIssues,
      pagination: { total: nearbyIssues?.length || 0, page: 1, limit, totalPages: 1 },
    })
  }

  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    data: data || [],
    pagination: {
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const title = String(formData.get("title") || "")
    const description = String(formData.get("description") || "")
    const category = String(formData.get("category") || "")
    const severity = String(formData.get("severity") || "")
    const latitude = parseFloat(String(formData.get("latitude") || "0"))
    const longitude = parseFloat(String(formData.get("longitude") || "0"))
    const address = String(formData.get("address") || "")
    const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0)

    // Upload images to storage with the admin client (public bucket).
    const imageUrls: string[] = []
    if (files.length > 0) {
      const admin = createSupabaseAdminClient()
      const bucket = "issue-images"
      try {
        await admin.storage.createBucket(bucket, { public: true })
      } catch {
        // Bucket already exists.
      }

      for (const file of files) {
        const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`
        const { error: uploadError } = await admin.storage
          .from(bucket)
          .upload(path, file, { cacheControl: "3600", upsert: false })
        if (uploadError) {
          return NextResponse.json({ success: false, error: `Image upload failed: ${uploadError.message}` }, { status: 500 })
        }
        const { data: { publicUrl } } = admin.storage.from(bucket).getPublicUrl(path)
        imageUrls.push(publicUrl)
      }
    }

    const { data, error } = await supabase
      .from("issues")
      .insert({
        title,
        description,
        category,
        severity: severity as "low" | "medium" | "high" | "critical",
        latitude,
        longitude,
        address,
        images: imageUrls,
        reporter_id: user.id,
        status: "reported",
        upvotes: 0,
        downvotes: 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    await supabase
      .from("issue_updates")
      .insert({
        issue_id: data.id,
        user_id: user.id,
        new_status: "reported",
        message: "Issue reported by citizen",
      })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  }
}