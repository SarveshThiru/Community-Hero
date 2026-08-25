import { createClient } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)

  const latitude = searchParams.get("latitude")
  const longitude = searchParams.get("longitude")
  const radius = parseInt(searchParams.get("radius") || "500")
  const category = searchParams.get("category") || "all"
  const limit = parseInt(searchParams.get("limit") || "10")

  if (!latitude || !longitude) {
    return NextResponse.json(
      { success: false, error: "Latitude and longitude are required" },
      { status: 400 }
    )
  }

  try {
    const { data, error } = await supabase.rpc("find_duplicate_issues", {
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
      category,
      radius_meters: radius,
    })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data?.slice(0, limit) || [],
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to find nearby issues" }, { status: 500 })
  }
}