"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Clock, AlertCircle, CheckCircle, Loader2, Plus, Filter, Bell, User, BarChart2, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { IssueCard } from "@/components/issue/issue-card"
import { useIssues } from "@/hooks/use-issues"
import { useAuth } from "@/hooks/use-auth"
import { useNotifications } from "@/hooks/use-notifications"
import { useDashboardStats } from "@/hooks/use-analytics"
import { formatRelativeTime, getCategoryIcon, getStatusColor } from "@/lib/utils"
import { cn } from "@/lib/utils"

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "reported", label: "Reported" },
  { value: "verified", label: "Verified" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
]

export default function CitizenDashboard() {
  const { user, loading, signOut } = useAuth()
  const { notifications, unreadCount } = useNotifications()
  const { stats } = useDashboardStats()
  const [activeTab, setActiveTab] = useState("my-reports")
  const [statusFilter, setStatusFilter] = useState("all")

  const { issues: myReports, loading: myReportsLoading } = useIssues({
    status: statusFilter === "all" ? undefined : statusFilter,
  })

  const { issues: nearbyIssues, loading: nearbyLoading } = useIssues({
    latitude: 28.6139,
    longitude: 77.2090,
    radius: 2000,
    limit: 5,
  })

  const { issues: recentActivity, loading: activityLoading } = useIssues({
    limit: 10,
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "verified": return <AlertCircle className="h-4 w-4 text-amber-600" />
      case "assigned":
      case "in_progress": return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      default: return <MapPin className="h-4 w-4 text-blue-600" />
    }
  }

  const statCards = [
    {
      title: "My Reports",
      value: stats.myReports,
      icon: <MapPin className="h-6 w-6" />,
      change: "+2 this week",
      changeType: "positive" as const,
      href: "/dashboard?tab=my-reports",
    },
    {
      title: "Pending Issues",
      value: stats.pendingIssues,
      icon: <Clock className="h-6 w-6" />,
      change: "Needs attention",
      changeType: "neutral" as const,
      href: "/dashboard?tab=nearby",
    },
    {
      title: "Resolved",
      value: stats.resolvedIssues,
      icon: <CheckCircle className="h-6 w-6" />,
      change: "+5 this month",
      changeType: "positive" as const,
      href: "/dashboard?tab=my-reports&status=resolved",
    },
    {
      title: "Critical Nearby",
      value: stats.criticalIssues,
      icon: <AlertCircle className="h-6 w-6" />,
      change: "High priority",
      changeType: "negative" as const,
      href: "/map",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="barcode-strip h-5 w-28 mx-auto animate-pulse" aria-hidden="true" />
          <p className="label-caps mt-4 text-black/50">Loading field console...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm border border-black bg-white">
          <div className="barcode-strip h-4 w-full border-b border-black" aria-hidden="true" />
          <div className="p-8 text-center">
            <h1 className="text-xl font-bold uppercase tracking-tight">Access Required</h1>
            <p className="mt-2 text-sm text-black/60">Sign in to view your field console.</p>
            <Link href="/login">
              <Button className="mt-6 w-full">Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-black bg-white">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="barcode-strip inline-block h-5 w-10" aria-hidden="true" />
            <span className="text-sm font-bold uppercase tracking-[0.18em]">Community Hero</span>
          </div>
          <Link href="/report">
            <Button className="gap-2" size="sm">
              <Plus className="h-4 w-4" />
              Report Issue
            </Button>
          </Link>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-end justify-between mb-8 border-b border-black pb-4">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-black">Field Console</h1>
            <p className="text-black/60 mt-1 text-sm">Welcome back, {user.full_name?.split(" ")[0] || "Citizen"}. Here's what's happening in your community.</p>
          </div>
        </div>

        <div className="grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat, index) => (
            <Link key={index} href={stat.href} className="block bg-white hover:bg-black hover:text-white transition-colors group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="label-caps text-black/60 group-hover:text-white/60">{stat.title}</p>
                    <p className="mt-2 text-4xl font-bold tabular-nums group-hover:text-white">{stat.value}</p>
                    <p className={cn("mt-1 text-xs font-medium", stat.changeType === "positive" && "text-black/70 group-hover:text-white/70", stat.changeType === "negative" && "text-red-600 group-hover:text-red-400", stat.changeType === "neutral" && "text-black/50 group-hover:text-white/50")}>
                      {stat.change}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-none border border-black flex items-center justify-center text-black group-hover:border-white group-hover:text-white [&_svg]:h-5 [&_svg]:w-5">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Link>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-reports">My Reports</TabsTrigger>
            <TabsTrigger value="nearby">Nearby Issues</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="my-reports" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Filter by status:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {STATUS_FILTERS.map(filter => (
                  <Button
                    key={filter.value}
                    variant={statusFilter === filter.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(filter.value)}
                    className="whitespace-nowrap"
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {myReportsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gray-200" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-gray-200 rounded" />
                            <div className="h-3 w-1/2 bg-gray-200 rounded" />
                            <div className="h-3 w-1/3 bg-gray-200 rounded" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : myReports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
                  <p className="text-gray-500 mb-4">Start by reporting an issue in your neighborhood</p>
                  <Link href="/report">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Report Your First Issue
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myReports.map(issue => (
                  <IssueCard key={issue.id} issue={issue} variant="detailed" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="nearby" className="space-y-4">
            {nearbyLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
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
            ) : nearbyIssues.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No nearby issues</h3>
                  <p className="text-gray-500">No issues reported near your location yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {nearbyIssues.map(issue => (
                  <IssueCard key={issue.id} issue={issue} variant="compact" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {activityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
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
            ) : recentActivity.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                  <p className="text-gray-500">Community activity will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentActivity.map(issue => (
                  <Link key={issue.id} href={`/issues/${issue.id}`} className="block">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            {getCategoryIcon(issue.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-gray-900 truncate">{issue.title}</h4>
                              <Badge className={cn(getStatusColor(issue.status), "whitespace-nowrap")}>
                                {issue.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-1">{issue.address}</p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                {getStatusIcon(issue.status)}
                                {issue.status.replace("_", " ")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatRelativeTime(issue.created_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {issue.reporter?.full_name || "Anonymous"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
