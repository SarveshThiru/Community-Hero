"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Filter, Search, Download, Shield, Users, BarChart2, AlertCircle, CheckCircle, Loader2, MoreVertical, Trash2, Edit, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IssueCard } from "@/components/issue/issue-card"
import { useIssues } from "@/hooks/use-issues"
import { useAuth } from "@/hooks/use-auth"
import { useDashboardStats } from "@/hooks/use-analytics"
import { formatRelativeTime, getStatusColor, getCategoryIcon } from "@/lib/utils"
import { cn } from "@/lib/utils"

const STATUS_FILTERS = [
  { value: "all", label: "All Statuses" },
  { value: "reported", label: "Reported" },
  { value: "verified", label: "Verified" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
]

const DEPARTMENTS = [
  "Public Works",
  "Water Department",
  "Electrical Department",
  "Sanitation",
  "Parks & Recreation",
  "Transportation",
  "Building Safety",
]

export default function AuthorityDashboard() {
  const { user, loading: authLoading } = useAuth()
  const { stats } = useDashboardStats()
  const [activeTab, setActiveTab] = useState("overview")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  const { issues, loading, refetch } = useIssues({
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 50,
  })

  const handleStatusChange = async (issueId: string, status: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const result = await response.json()
      if (result.success) {
        refetch()
      } else {
        alert(result.error || "Failed to update status")
      }
    } catch (error) {
      console.error("Failed to update status:", error)
      alert("Failed to update status")
    }
  }

  const handleDelete = async (issueId: string) => {
    if (!confirm("Are you sure you want to delete this issue?")) return
    try {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (result.success) {
        refetch()
      } else {
        alert(result.error || "Failed to delete issue")
      }
    } catch (error) {
      console.error("Failed to delete issue:", error)
      alert("Failed to delete issue")
    }
  }

  const filteredIssues = issues.filter(issue => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        issue.title.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query) ||
        issue.address.toLowerCase().includes(query) ||
        issue.reporter?.full_name?.toLowerCase().includes(query)
      )
    }
    return true
  })

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    switch (sortBy) {
      case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "oldest": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "upvotes": return b.upvotes - a.upvotes
      case "severity": {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return severityOrder[b.severity as keyof typeof severityOrder] - severityOrder[a.severity as keyof typeof severityOrder]
      }
      default: return 0
    }
  })

  const statCards = [
    { title: "Total Reports", value: stats.totalReports, icon: <MapPin className="h-6 w-6" />, color: "blue" },
    { title: "Pending Review", value: stats.pendingIssues, icon: <AlertCircle className="h-6 w-6" />, color: "amber" },
    { title: "Resolved", value: stats.resolvedIssues, icon: <CheckCircle className="h-6 w-6" />, color: "green" },
    { title: "Critical", value: stats.criticalIssues, icon: <AlertCircle className="h-6 w-6" />, color: "red" },
  ]

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user || (user.role !== "authority" && user.role !== "admin")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold uppercase tracking-tight text-black mb-2">Authority Access Required</h2>
            <p className="text-gray-600 mb-6">You need authority permissions to access this dashboard.</p>
            <Link href="/dashboard">
              <Button>Go to Citizen Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-black">Authority Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage and oversee civic issues in your jurisdiction</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Link href="/authority/analytics">
              <Button className="gap-2">
                <BarChart2 className="h-4 w-4" />
                Analytics
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat, index) => (
            <Link key={index} href={`/authority/reports?status=${stat.title.toLowerCase().replace(" ", "-")}`} className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className="mt-1 text-3xl font-bold uppercase tracking-tight text-black">{stat.value}</p>
                    </div>
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", `bg-${stat.color}-100 text-${stat.color}-600`)}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">All Reports</TabsTrigger>
            <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Critical Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {issues.filter(i => i.severity === "critical").slice(0, 5).map(issue => (
                      <Link key={issue.id} href={`/issues/${issue.id}`} className="block">
                        <IssueCard issue={issue} variant="compact" />
                      </Link>
                    ))}
                    {issues.filter(i => i.severity === "critical").length === 0 && (
                      <p className="text-center text-gray-500 py-8">No critical issues at this time</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recently Reported</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {issues.slice(0, 5).map(issue => (
                      <Link key={issue.id} href={`/issues/${issue.id}`} className="block">
                        <IssueCard issue={issue} variant="compact" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Department Workload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {DEPARTMENTS.map(dept => {
                    const deptIssues = issues.filter(i => i.department === dept)
                    const pending = deptIssues.filter(i => i.status !== "resolved").length
                    const resolved = deptIssues.filter(i => i.status === "resolved").length
                    return (
                      <div key={dept} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="font-medium">{dept}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-amber-600 font-medium">{pending} pending</span>
                          <span className="text-green-600 font-medium">{resolved} resolved</span>
                          <Badge variant="secondary" className="text-xs">
                            {deptIssues.length} total
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_FILTERS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="upvotes">Most Upvotes</SelectItem>
                    <SelectItem value="severity">Highest Severity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="animate-pulse">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gray-200" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-gray-200 rounded" />
                            <div className="h-3 w-1/2 bg-gray-200 rounded" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : sortedIssues.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search terms</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sortedIssues.map(issue => (
                  <Card key={issue.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                          {getCategoryIcon(issue.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link href={`/issues/${issue.id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                                {issue.title}
                              </Link>
                              <p className="text-sm text-gray-600 mt-1">{issue.address}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="whitespace-nowrap">{issue.category.replace("_", " ")}</Badge>
                              <Badge variant={issue.severity as any} className="whitespace-nowrap">{issue.severity}</Badge>
                              <Badge className={cn(getStatusColor(issue.status), "whitespace-nowrap")}>{issue.status.replace("_", " ")}</Badge>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              Reported {formatRelativeTime(issue.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {issue.reporter?.full_name || "Anonymous"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Loader2 className="h-4 w-4" />
                              {issue.upvotes} upvotes
                            </span>
                            {issue.department && (
                              <span className="flex items-center gap-1">
                                <Shield className="h-4 w-4" />
                                {issue.department}
                              </span>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/issues/${issue.id}`}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/issues/${issue.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleStatusChange(issue.id, "verified")}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Mark as Verified
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(issue.id, "assigned")}>
                              <Users className="mr-2 h-4 w-4 text-blue-600" /> Assign to Department
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(issue.id, "in_progress")}>
                              <Loader2 className="mr-2 h-4 w-4 text-blue-600" /> Start Work
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(issue.id, "resolved")}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Mark Resolved
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(issue.id, "rejected")}>
                              <AlertCircle className="mr-2 h-4 w-4 text-red-600" /> Reject
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(issue.id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assigned" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Issues Assigned to You</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Issues assigned to your department will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {DEPARTMENTS.map(dept => {
                const deptIssues = issues.filter(i => i.department === dept)
                return (
                  <Card key={dept}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{dept}</CardTitle>
                        <Badge variant="secondary">{deptIssues.length} issues</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-amber-50">
                          <p className="text-2xl font-bold text-amber-600">
                            {deptIssues.filter(i => i.status !== "resolved").length}
                          </p>
                          <p className="text-xs text-amber-700">Pending</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50">
                          <p className="text-2xl font-bold text-green-600">
                            {deptIssues.filter(i => i.status === "resolved").length}
                          </p>
                          <p className="text-xs text-green-700">Resolved</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {deptIssues.slice(0, 3).map(issue => (
                          <Link key={issue.id} href={`/issues/${issue.id}`} className="block p-2 rounded-lg hover:bg-gray-50 text-sm">
                            <p className="font-medium truncate">{issue.title}</p>
                            <p className="text-xs text-gray-500">{issue.address}</p>
                          </Link>
                        ))}
                        {deptIssues.length > 3 && (
                          <Link href={`/authority/reports?department=${dept}`} className="text-sm text-blue-600 hover:underline">
                            View all {deptIssues.length} issues
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
