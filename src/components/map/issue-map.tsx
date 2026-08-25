"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { MapPin, Circle, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import "maplibre-gl/dist/maplibre-gl.css"
import { useMapLibre, useGeolocation } from "@/hooks/use-map"
import type { MarkerData } from "@/hooks/use-map"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Issue } from "@/types"
import { getCategoryIcon, getSeverityColor, getStatusColor } from "@/lib/utils"

interface IssueMapProps {
  issues: Issue[]
  center?: { lat: number; lng: number }
  zoom?: number
  onIssueClick?: (issue: Issue) => void
  onMapClick?: (lat: number, lng: number) => void
  showClusters?: boolean
  height?: string
  className?: string
}

export function IssueMap({
  issues,
  center = { lat: 28.6139, lng: 77.2090 },
  zoom = 13,
  onIssueClick,
  onMapClick,
  showClusters = true,
  height = "500px",
  className,
}: IssueMapProps) {
  const { map, loading: mapLoading, error: mapError, mapRef, initializeMap, addMarkers, clearMarkers, fitBounds, setCenter } = useMapLibre()
  const { position: userLocation, loading: geoLoading, error: geoError, getCurrentPosition } = useGeolocation()
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const mapInitialized = useRef(false)
  const syncedInitialView = useRef(false)

  useEffect(() => {
    if (mapRef.current && !mapInitialized.current && !mapLoading) {
      initializeMap({ center, zoom })
      mapInitialized.current = true
    }
  }, [mapRef, mapLoading, initializeMap, center, zoom])

  useEffect(() => {
    if (!map) return
    if (!syncedInitialView.current) {
      syncedInitialView.current = true
      return
    }
    setCenter(center, zoom)
  }, [map, center, zoom, setCenter])

  useEffect(() => {
    if (userLocation) {
      setCenter(userLocation, 16)
    }
  }, [userLocation, setCenter])

  useEffect(() => {
    if (!map) return

    const markerData: MarkerData[] = issues.map(issue => ({
      position: { lat: issue.latitude, lng: issue.longitude },
      title: issue.title,
      category: issue.category,
      severity: issue.severity,
      status: issue.status,
      issueId: issue.id,
      onClick: () => {
        setSelectedIssue(issue)
        onIssueClick?.(issue)
      },
    }))

    addMarkers(markerData)

    if (issues.length > 0 && !userLocation) {
      const positions = issues.map(i => ({ lat: i.latitude, lng: i.longitude }))
      fitBounds(positions)
    }
  }, [map, issues, addMarkers, fitBounds, userLocation, onIssueClick])

  useEffect(() => {
    if (!map || !onMapClick) return

    const handleMapEvent = (e: { lngLat: { lat: number; lng: number } }) => {
      onMapClick(e.lngLat.lat, e.lngLat.lng)
    }

    map.on("click", handleMapEvent)
    return () => {
      map.off("click", handleMapEvent)
    }
  }, [map, onMapClick])

  const handleCenterOnUser = () => {
    getCurrentPosition()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "verified": return <Circle className="h-4 w-4 text-amber-600" />
      case "assigned":
      case "in_progress": return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      default: return <MapPin className="h-4 w-4 text-blue-600" />
    }
  }

  if (mapError) {
    return (
      <div className={cn("flex items-center justify-center h-full rounded-xl border border-gray-200 bg-gray-50", className)} style={{ height }}>
        <div className="text-center p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-600">Failed to load map</p>
          <p className="text-sm text-gray-400">{mapError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative rounded-xl overflow-hidden", className)} style={{ height }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {mapLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      )}

      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCenterOnUser}
          disabled={geoLoading}
          className="shadow-lg"
          aria-label="Center on my location"
        >
          {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
        </Button>
      </div>

      {geoError && (
        <div className="absolute top-4 left-4 z-30 max-w-xs bg-red-50 border border-red-200 px-3 py-2 rounded-lg shadow-lg flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-red-700">{geoError}</span>
        </div>
      )}

      {selectedIssue && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-auto sm:top-4 sm:w-80 z-20">
          <Card className="shadow-xl animate-in slide-in-from-bottom-2">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                  {getCategoryIcon(selectedIssue.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{selectedIssue.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default">{selectedIssue.category.replace("_", " ")}</Badge>
                    <Badge variant={selectedIssue.severity as any}>{selectedIssue.severity}</Badge>
                    <Badge className={getStatusColor(selectedIssue.status)}>{selectedIssue.status.replace("_", " ")}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{selectedIssue.address}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      {getStatusIcon(selectedIssue.status)}
                      {selectedIssue.upvotes} upvotes
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {selectedIssue.comments_count} comments
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIssue(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

import { MessageSquare, X } from "lucide-react"