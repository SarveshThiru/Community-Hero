import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { id } = await params

  const { data, error } = await supabase
    .from("issue_with_details")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 404 })
  }

  return NextResponse.json({ success: true, data })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { id } = await params
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { status } = body

    if (!status || !["reported", "verified", "assigned", "in_progress", "resolved", "rejected"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 })
    }

    // Check if user has permission (authority, admin, or reporter)
    const { data: issue } = await supabase
      .from("issues")
      .select("reporter_id, assignee_id, department")
      .eq("id", id)
      .single()

    if (!issue) {
      return NextResponse.json({ success: false, error: "Issue not found" }, { status: 404 })
    }

    const isAuthority = ["authority", "admin"].includes(user?.role || "")
    const isReporter = issue.reporter_id === user.id
    const isAssignee = issue.assignee_id === user.id

    if (!isAuthority && !isReporter && !isAssignee) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    // Only authority can change to verified/assigned/in_progress/resolved/rejected
    // Reporters can only withdraw (rejected)
    const authorityStatuses = ["verified", "assigned", "in_progress", "resolved", "rejected"]
    if (authorityStatuses.includes(status) && !isAuthority) {
      return NextResponse.json({ success: false, error: "Only authorities can change to this status" }, { status: 403 })
    }

    const { data: currentIssue } = await supabase
      .from("issues")
      .select("status")
      .eq("id", id)
      .single()

    const { error: updateError } = await supabase
      .from("issues")
      .update({ status })
      .eq("id", id)

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    // Record status change
    if (currentIssue?.status !== status) {
      await supabase
        .from("issue_updates")
        .insert({
          issue_id: id,
          user_id: user.id,
          previous_status: currentIssue?.status,
          new_status: status,
          message: `Status changed to ${status}`,
        })

      if (status === "resolved") {
        await supabase
          .from("issues")
          .update({ resolved_at: new Date().toISOString() })
          .eq("id", id)
      } else if (status === "verified") {
        await supabase
          .from("issues")
          .update({ verified_at: new Date().toISOString() })
          .eq("id", id)
      } else if (status === "assigned") {
        await supabase
          .from("issues")
          .update({ assigned_at: new Date().toISOString() })
          .eq("id", id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { id } = await params
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if user owns the issue or is authority/admin
    const { data: issue } = await supabase
      .from("issues")
      .select("reporter_id")
      .eq("id", id)
      .single()

    if (!issue) {
      return NextResponse.json({ success: false, error: "Issue not found" }, { status: 404 })
    }

    const isAuthority = ["authority", "admin"].includes(user?.role || "")
    const isReporter = issue.reporter_id === user.id

    if (!isAuthority && !isReporter) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    // Delete the issue (cascade will handle related records if set up)
    const { error } = await supabase
      .from("issues")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  }
}