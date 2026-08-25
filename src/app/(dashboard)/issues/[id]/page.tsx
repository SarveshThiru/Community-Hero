"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Clock, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { IssueDetail } from "@/components/issue/issue-detail"
import { useIssue } from "@/hooks/use-issues"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

export default function IssueDetailPage() {
  const params = useParams()
  const issueId = params.id as string
  const { issue, loading, error } = useIssue(issueId)
  const { user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-64 bg-gray-200 rounded" />
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <Card><CardContent className="p-6 h-96 bg-gray-100" /></Card>
                  <Card><CardContent className="p-6 h-64 bg-gray-100" /></Card>
                </div>
                <div className="space-y-6">
                  <Card><CardContent className="p-6 h-64 bg-gray-100" /></Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold uppercase tracking-tight text-black mb-2">Issue Not Found</h2>
            <p className="text-gray-600 mb-6">The issue you're looking for doesn't exist or has been removed.</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isAuthority = user?.role === "authority" || user?.role === "admin"

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/issues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const result = await response.json()
      if (result.success) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this issue?")) return
    try {
      await fetch(`/api/issues/${id}`, { method: "DELETE" })
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to delete issue:", error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-4xl mx-auto">
          <IssueDetail
            issue={issue}
            onStatusChange={isAuthority ? handleStatusChange : undefined}
            onDelete={isAuthority ? handleDelete : undefined}
          />
        </div>
      </div>
    </div>
  )
}
