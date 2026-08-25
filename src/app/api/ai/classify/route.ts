import { NextRequest, NextResponse } from "next/server"
import { classifyFromText } from "@/lib/ai-classification"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, title, imageBase64 } = body

    if (!description && !title) {
      return NextResponse.json(
        { success: false, error: "Description or title is required" },
        { status: 400 }
      )
    }

    const result = classifyFromText(description || "", title || "")

    return NextResponse.json({
      success: true,
      data: {
        category: result.category,
        confidence: result.confidence,
        severity: result.severity,
        severityConfidence: result.severityConfidence,
        suggestedTitle: `Community Issue: ${result.category.replace("_", " ")}`,
      },
    })
  } catch (error) {
    console.error("AI classification error:", error)
    return NextResponse.json(
      { success: false, error: "Classification failed" },
      { status: 500 }
    )
  }
}