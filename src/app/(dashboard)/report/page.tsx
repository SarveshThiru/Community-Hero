"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Loader2, Sparkles, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ReportIssueForm } from "@/components/forms/report-issue-form"
import { IssueMap } from "@/components/map/issue-map"
import { useIssues } from "@/hooks/use-issues"
import { useAuth } from "@/hooks/use-auth"
import { useGeolocation } from "@/hooks/use-map"
import { classifyIssue } from "@/lib/ai-classification"
import { ISSUE_CATEGORIES, SEVERITY_LEVELS, getCategoryIcon, getStatusColor } from "@/lib/utils"
import { cn } from "@/lib/utils"

export default function ReportIssuePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { getCurrentPosition } = useGeolocation()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: string
    severity: string
    confidence: number
  } | null>(null)
  const [showAiModal, setShowAiModal] = useState(false)

  const { issues: nearbyIssues } = useIssues({
    latitude: 28.6139,
    longitude: 77.2090,
    radius: 500,
    limit: 5,
  })

  const handleSubmit = async (data: any, images: File[]) => {
    setSubmitting(true)
    setSubmitError("")

    try {
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("description", data.description)
      formData.append("category", data.category)
      formData.append("severity", data.severity)
      formData.append("latitude", data.latitude.toString())
      formData.append("longitude", data.longitude.toString())
      formData.append("address", data.address)
      images.forEach(img => formData.append("images", img))

      const response = await fetch("/api/issues", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to submit report")
      }

      router.push(`/issues/${result.data.id}`)
      router.refresh()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit report")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAiAnalysis = async (images: File[], description: string, title: string) => {
    if (images.length === 0) return

    try {
      const img = new Image()
      img.src = URL.createObjectURL(images[0])
      await new Promise(resolve => { img.onload = resolve })

      const result = await classifyIssue(img, description, title)
      setAiSuggestion({
        category: result.category,
        severity: result.severity,
        confidence: result.confidence,
      })
      setShowAiModal(true)
    } catch (error) {
      console.error("AI analysis failed:", error)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4 max-w-4xl mx-auto px-4">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-96 bg-gray-200 rounded-xl" />
            <div className="h-96 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold uppercase tracking-tight text-black mb-2">Sign in to Report</h2>
            <p className="text-gray-600 mb-6">You need to be signed in to report an issue.</p>
            <Button className="w-full" onClick={() => router.push("/login?callbackUrl=/report")}>
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold uppercase tracking-tight text-black">Report an Issue</h1>
            <p className="text-gray-600 mt-2">Help improve your community by reporting civic issues. Your reports make a difference.</p>
          </div>

          {submitError && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Submission Failed</p>
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <ReportIssueForm
                onSubmit={handleSubmit}
                isLoading={submitting}
              />
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Nearby Issues
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {nearbyIssues.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No issues reported nearby yet</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {nearbyIssues.map(issue => (
                        <Link key={issue.id} href={`/issues/${issue.id}`} className="block">
                          <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                                {getCategoryIcon(issue.category)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">{issue.title}</h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <Badge variant="default" className="text-xs">{issue.category.replace("_", " ")}</Badge>
                                  <Badge variant={issue.severity as any} className="text-xs">{issue.severity}</Badge>
                                  <Badge className={cn(getStatusColor(issue.status), "text-xs")}>{issue.status.replace("_", " ")}</Badge>
                                </div>
                                <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {issue.address}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-4">
                    Upload images and describe your issue, then use AI to automatically categorize and assess severity.
                  </p>
                  <Button variant="outline" className="w-full" disabled>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze with AI (after adding images)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link"
