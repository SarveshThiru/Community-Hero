"use client"

import { useState, useEffect, useCallback } from "react"
import { MapPin, Filter, Layers, Search, RefreshCw, Loader2, ChevronDown, ChevronUp, MapPin as MapPinIcon, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { IssueMap } from "@/components/map/issue-map"
import { useIssues } from "@/hooks/use-issues"
import { useGeolocation } from "@/hooks/use-map"
import { ISSUE_CATEGORIES, ISSUE_STATUSES, SEVERITY_LEVELS, getCategoryIcon, getStatusColor } from "@/lib/utils"
import { cn } from "@/lib/utils"

const CATEGORY_FILTERS = [
  { value: "all", label: "All Categories" },
  ...ISSUE_CATEGORIES,
]

const STATUS_FILTERS = [
  { value: "all", label: "All Statuses" },
  ...ISSUE_STATUSES,
]

const SEVERITY_FILTERS = [
  { value: "all", label: "All Severities" },
  ...SEVERITY_LEVELS,
]

export default function CommunityMapPage() {
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    severity: "all",
    search: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 })
  const [mapZoom, setMapZoom] = useState(13)
  const [selectedIssue, setSelectedIssue] = useState<any>(null)
  const { position: userLocation, loading: geoLoading, error: geoError, getCurrentPosition } = useGeolocation()

  const { issues, loading, error, refetch } = useIssues({
    category: filters.category === "all" ? undefined : filters.category,
    status: filters.status === "all" ? undefined : filters.status,
    severity: filters.severity === "all" ? undefined : filters.severity,
    latitude: mapCenter.lat,
    longitude: mapCenter.lng,
    radius: 10000,
    limit: 500,
  })

  const filteredIssues = issues.filter(issue => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        issue.title.toLowerCase().includes(searchLower) ||
        issue.description.toLowerCase().includes(searchLower) ||
        issue.address.toLowerCase().includes(searchLower) ||
        issue.category.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setMapCenter({ lat, lng })
    setMapZoom(15)
  }, [])

  const handleIssueClick = useCallback((issue: any) => {
    setSelectedIssue(issue)
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleCenterOnUser = () => {
    getCurrentPosition()
  }

  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation)
      setMapZoom(16)
    }
  }, [userLocation])

  const activeFiltersCount = Object.values(filters).filter(v => v !== "all" && v !== "").length

  return (
    <div className="min-h-screen bg-white">
      <div className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Community Map</h1>
            <Badge variant="secondary">{filteredIssues.length} issues</Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search issues..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-64 pl-10"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="default" className="h-5 px-1.5">{activeFiltersCount}</Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Filters</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                    <Select value={filters.category} onValueChange={v => handleFilterChange("category", v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_FILTERS.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DropdownMenuSeparator />
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                    <Select value={filters.status} onValueChange={v => handleFilterChange("status", v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_FILTERS.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DropdownMenuSeparator />
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Severity</label>
                    <Select value={filters.severity} onValueChange={v => handleFilterChange("severity", v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All severities" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEVERITY_FILTERS.map(sev => (
                          <SelectItem key={sev.value} value={sev.value}>
                            {sev.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {activeFiltersCount > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setFilters({ category: "all", status: "all", severity: "all", search: "" })}>
                        Clear all filters
                      </DropdownMenuItem>
                    </>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" onClick={handleCenterOnUser} disabled={geoLoading} className="gap-2">
              {geoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPinIcon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">My Location</span>
            </Button>

            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading} className="gap-2">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        <aside className="hidden lg:block w-80 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] overflow-y-auto sticky top-16">
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Legend</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Categories</p>
                  <div className="space-y-1.5">
                    {ISSUE_CATEGORIES.slice(0, 6).map(cat => (
                      <div key={cat.value} className="flex items-center gap-2 text-sm">
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-gray-600">{cat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
                  <div className="space-y-1.5">
                    {ISSUE_STATUSES.map(status => (
                      <div key={status.value} className="flex items-center gap-2 text-sm">
                        <Badge variant={status.color as any} className="text-xs">{status.label}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Severity</p>
                  <div className="space-y-1.5">
                    {SEVERITY_LEVELS.map(sev => (
                      <div key={sev.value} className="flex items-center gap-2 text-sm">
                        <Badge variant={sev.color as any} className="text-xs">{sev.label}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <p className="text-2xl font-bold text-blue-600">{filteredIssues.length}</p>
                    <p className="text-xs text-blue-700">Total Visible</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50">
                    <p className="text-2xl font-bold text-red-600">
                      {filteredIssues.filter(i => i.severity === "critical").length}
                    </p>
                    <p className="text-xs text-red-700">Critical</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50">
                    <p className="text-2xl font-bold text-green-600">
                      {filteredIssues.filter(i => i.status === "resolved").length}
                    </p>
                    <p className="text-xs text-green-700">Resolved</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50">
                    <p className="text-2xl font-bold text-amber-600">
                      {filteredIssues.filter(i => i.status !== "resolved").length}
                    </p>
                    <p className="text-xs text-amber-700">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Recent Issues</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {issues.slice(0, 10).map(issue => (
                <button
                  key={issue.id}
                  onClick={() => {
                    setSelectedIssue(issue)
                    setMapCenter({ lat: issue.latitude, lng: issue.longitude })
                    setMapZoom(17)
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getCategoryIcon(issue.category)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{issue.title}</p>
                      <p className="text-xs text-gray-500 truncate">{issue.address}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant={issue.severity as any} className="text-[10px]">{issue.severity}</Badge>
                        <Badge className={cn(getStatusColor(issue.status), "text-[10px]")}>{issue.status.replace("_", " ")}</Badge>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 relative">
          <IssueMap
            issues={filteredIssues}
            center={mapCenter}
            zoom={mapZoom}
            onIssueClick={handleIssueClick}
            onMapClick={handleMapClick}
            height="calc(100vh - 4rem)"
            className="w-full"
          />

          {selectedIssue && (
            <div className="absolute bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:bottom-auto lg:top-20 lg:w-96 z-50">
              <Card className="shadow-xl animate-in slide-in-from-bottom-2">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                        {getCategoryIcon(selectedIssue.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{selectedIssue.title}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="default" className="text-xs">{selectedIssue.category.replace("_", " ")}</Badge>
                          <Badge variant={selectedIssue.severity as any} className="text-xs">{selectedIssue.severity}</Badge>
                          <Badge className={cn(getStatusColor(selectedIssue.status), "text-xs")}>{selectedIssue.status.replace("_", " ")}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 flex items-center gap-1">
                          <MapPinIcon className="h-3 w-3" />
                          {selectedIssue.address}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">{selectedIssue.upvotes} upvotes</span>
                          <span className="flex items-center gap-1">{selectedIssue.comments_count} comments</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedIssue(null)}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={`/issues/${selectedIssue.id}`}>View Details</a>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <a href={`/report?lat=${selectedIssue.latitude}&lng=${selectedIssue.longitude}`}>Report Nearby</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {loading && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">Loading issues...</span>
            </div>
          )}

          {geoError && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{geoError}</span>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

