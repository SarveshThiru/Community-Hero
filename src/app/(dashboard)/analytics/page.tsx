"use client"

import { useState } from "react"
import { Download, Calendar, Filter, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, CategoryChart, StatusChart, MonthlyTrendChart, SeverityChart, DepartmentPerformanceChart, StatCard } from "@/components/charts/analytics-charts"
import { useAnalytics } from "@/hooks/use-analytics"
import { useAuth } from "@/hooks/use-auth"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

const TIME_RANGES = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "1y", label: "Last Year" },
  { value: "all", label: "All Time" },
]

export default function AnalyticsDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [timeRange, setTimeRange] = useState("30d")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  const endDate = new Date()
  const startDate = new Date()
  switch (timeRange) {
    case "7d": startDate.setDate(endDate.getDate() - 7); break
    case "30d": startDate.setDate(endDate.getDate() - 30); break
    case "90d": startDate.setDate(endDate.getDate() - 90); break
    case "1y": startDate.setFullYear(endDate.getFullYear() - 1); break
    case "all": startDate.setFullYear(2020); break
  }

  const { analytics, loading, error } = useAnalytics({
    startDate: timeRange !== "all" ? startDate.toISOString().split("T")[0] : undefined,
    endDate: endDate.toISOString().split("T")[0],
    department: departmentFilter !== "all" ? departmentFilter : undefined,
  })

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold uppercase tracking-tight text-black mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to view analytics.</p>
            <Button>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statCards = analytics ? [
    {
      title: "Total Reports",
      value: analytics.totalReports.toLocaleString(),
      change: "+12% from last period",
      changeType: "positive" as const,
      icon: <TrendingUp className="h-6 w-6" />,
    },
    {
      title: "Pending Issues",
      value: analytics.pendingIssues.toLocaleString(),
      change: "-5% from last period",
      changeType: "positive" as const,
      icon: <TrendingDown className="h-6 w-6" />,
    },
    {
      title: "Resolved Issues",
      value: analytics.resolvedIssues.toLocaleString(),
      change: "+8% from last period",
      changeType: "positive" as const,
      icon: <TrendingUp className="h-6 w-6" />,
    },
    {
      title: "Resolution Rate",
      value: `${analytics.resolutionRate.toFixed(1)}%`,
      change: analytics.resolutionRate > 90 ? "Excellent" : "Needs improvement",
      changeType: analytics.resolutionRate > 90 ? "positive" : "negative" as const,
      icon: <TrendingUp className="h-6 w-6" />,
    },
  ] as const : []

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-black">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Track issue trends, performance metrics, and community impact</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map(range => <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Public Works">Public Works</SelectItem>
                <SelectItem value="Water Department">Water Department</SelectItem>
                <SelectItem value="Electrical Department">Electrical Department</SelectItem>
                <SelectItem value="Sanitation">Sanitation</SelectItem>
                <SelectItem value="Parks & Recreation">Parks & Recreation</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            Failed to load analytics: {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <Tabs value="overview" onValueChange={() => {}} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="geographic">Geographic</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartContainer title="Monthly Trends">
                {loading ? (
                  <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
                ) : analytics ? (
                  <MonthlyTrendChart data={analytics.monthlyTrends} />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>
                )}
              </ChartContainer>

              <ChartContainer title="Issue Status Distribution">
                {loading ? (
                  <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
                ) : analytics ? (
                  <StatusChart data={analytics.statusDistribution} />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>
                )}
              </ChartContainer>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ChartContainer title="Category Distribution">
                {loading ? (
                  <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
                ) : analytics ? (
                  <CategoryChart data={analytics.categoryDistribution} />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>
                )}
              </ChartContainer>

              <ChartContainer title="Severity Levels">
                {loading ? (
                  <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
                ) : analytics ? (
                  <SeverityChart data={analytics.categoryDistribution.map(c => ({ severity: c.category, count: c.count }))} />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>
                )}
              </ChartContainer>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                  <div className="p-4 rounded-lg bg-blue-50">
                    <p className="text-3xl font-bold text-blue-600">{analytics?.averageResolutionTime?.toFixed(1) || "0"} days</p>
                    <p className="text-sm text-blue-700">Avg Resolution Time</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50">
                    <p className="text-3xl font-bold text-green-600">{analytics?.resolutionRate?.toFixed(1) || "0"}%</p>
                    <p className="text-sm text-green-700">Resolution Rate</p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-50">
                    <p className="text-3xl font-bold text-amber-600">{analytics?.criticalIssues || 0}</p>
                    <p className="text-sm text-amber-700">Critical Issues</p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50">
                    <p className="text-3xl font-bold text-purple-600">{analytics?.topCategories?.[0]?.count || 0}</p>
                    <p className="text-sm text-purple-700">Top Category Reports</p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50">
                    <p className="text-3xl font-bold text-red-600">{analytics?.geographicHotspots?.[0]?.count || 0}</p>
                    <p className="text-sm text-red-700">Top Hotspot Reports</p>
                  </div>
                  <div className="p-4 rounded-lg bg-cyan-50">
                    <p className="text-3xl font-bold text-cyan-600">{analytics?.totalReports || 0}</p>
                    <p className="text-sm text-cyan-700">Total Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <ChartContainer title="Issue Categories" className="h-[500px]">
              {loading ? (
                <div className="h-[500px] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
              ) : analytics ? (
                <CategoryChart data={analytics.categoryDistribution} />
              ) : (
                <div className="h-[500px] flex items-center justify-center text-gray-500">No data available</div>
              )}
            </ChartContainer>

            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topCategories?.slice(0, 10).map((cat, index) => (
                    <div key={cat.category} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 font-medium w-8 text-right">{index + 1}.</span>
                        <span className="font-medium">{cat.category.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-16 text-right">
                          {cat.count} ({cat.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geographic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Hotspots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.geographicHotspots?.slice(0, 10).map((hotspot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{hotspot.category.replace("_", " ")}</p>
                          <p className="text-sm text-gray-500">
                            {hotspot.latitude.toFixed(4)}, {hotspot.longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive">{hotspot.count} reports</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Map View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500">Interactive heatmap coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <ChartContainer title="Department Performance">
              {loading ? (
                <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
              ) : analytics ? (
                <DepartmentPerformanceChart data={analytics.departmentPerformance} />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>
              )}
            </ChartContainer>

            <Card>
              <CardHeader>
                <CardTitle>Department Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500">
                        <th className="pb-3">Department</th>
                        <th className="pb-3 text-right">Resolved</th>
                        <th className="pb-3 text-right">Pending</th>
                        <th className="pb-3 text-right">Avg Time (days)</th>
                        <th className="pb-3 text-right">Resolution Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics?.departmentPerformance?.map(dept => (
                        <tr key={dept.department} className="border-b border-gray-100">
                          <td className="py-3 font-medium">{dept.department}</td>
                          <td className="py-3 text-right text-green-600 font-medium">{dept.resolved}</td>
                          <td className="py-3 text-right text-amber-600 font-medium">{dept.pending}</td>
                          <td className="py-3 text-right">{dept.avgTime.toFixed(1)}</td>
                          <td className="py-3 text-right">
                            <Badge variant={dept.resolved / (dept.resolved + dept.pending) > 0.8 ? "success" : "default"}>
                              {((dept.resolved / (dept.resolved + dept.pending)) * 100).toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
