"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Map as MLMap, Marker as MLMarker, StyleSpecification } from "maplibre-gl"

type MaplibreModule = typeof import("maplibre-gl")

export interface MapOptions {
  center: { lat: number; lng: number }
  zoom: number
}

export interface MarkerData {
  position: { lat: number; lng: number }
  title: string
  category: string
  severity: string
  status: string
  issueId: string
  onClick?: () => void
}

const OSM_RASTER_STYLE: StyleSpecification = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      maxzoom: 20,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster" as const,
      source: "osm",
    },
  ],
}

function getMapStyle(): string | StyleSpecification {
  return process.env.NEXT_PUBLIC_MAP_STYLE_URL || OSM_RASTER_STYLE
}

let maplibreModulePromise: Promise<MaplibreModule> | null = null

export function loadMaplibre(): Promise<MaplibreModule> {
  if (!maplibreModulePromise) {
    maplibreModulePromise = import("maplibre-gl").then(
      mod => ((mod as { default?: MaplibreModule }).default ?? mod)
    )
  }
  return maplibreModulePromise
}

export function useMapLibre(styleOverride?: string | StyleSpecification) {
  const [map, setMap] = useState<MLMap | null>(null)
  const [markers, setMarkers] = useState<MLMarker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MLMap | null>(null)
  const markersRef = useRef<MLMarker[]>([])

  useEffect(() => {
    let cancelled = false
    loadMaplibre()
      .then(() => {
        if (!cancelled) setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load MapLibre GL")
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  const initializeMap = useCallback(async (options: MapOptions) => {
    if (!containerRef.current || mapRef.current) return mapRef.current

    try {
      const maplibregl = await loadMaplibre()

      if (!containerRef.current || mapRef.current) return mapRef.current

      const newMap = new maplibregl.Map({
        container: containerRef.current,
        style: styleOverride ?? getMapStyle(),
        center: [options.center.lng, options.center.lat],
        zoom: options.zoom,
        attributionControl: { compact: true },
      })

      mapRef.current = newMap
      setMap(newMap)
      return newMap
    } catch {
      setError("Failed to initialize MapLibre map")
      return null
    }
  }, [styleOverride])

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
    setMarkers([])
  }, [])

  const addMarkers = useCallback((markerData: MarkerData[]) => {
    const currentMap = mapRef.current
    if (!currentMap) return

    clearMarkers()

    loadMaplibre().then(maplibregl => {
      const newMarkers = markerData.map(data => {
        const el = document.createElement("div")
        el.title = data.title
        el.style.cursor = "pointer"
        el.innerHTML = `
          <svg width="26" height="38" viewBox="0 0 26 38" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1C6.4 1 1 6.4 1 13c0 8.2 10.3 20.9 11.2 22 .4.5 1.2.5 1.6 0C14.7 33.9 25 21.2 25 13 25 6.4 19.6 1 13 1z"
              fill="${getSeverityColor(data.severity)}" stroke="#ffffff" stroke-width="2"
              style="filter: drop-shadow(0 2px 3px rgb(17 24 39 / 0.3));"/>
            <circle cx="13" cy="13" r="4.5" fill="#ffffff"/>
          </svg>
        `

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([data.position.lng, data.position.lat])
          .addTo(currentMap)

        if (data.onClick) {
          el.addEventListener("click", event => {
            event.stopPropagation()
            data.onClick?.()
          })
        }

        return marker
      })

      markersRef.current = newMarkers
      setMarkers(newMarkers)
    })
  }, [clearMarkers])

  const fitBounds = useCallback((positions: { lat: number; lng: number }[]) => {
    const currentMap = mapRef.current
    if (!currentMap || positions.length === 0) return

    loadMaplibre().then(maplibregl => {
      const bounds = new maplibregl.LngLatBounds()
      positions.forEach(pos => bounds.extend([pos.lng, pos.lat]))
      currentMap.fitBounds(bounds, { padding: 60, maxZoom: 16 })
    })
  }, [])

  const setCenter = useCallback((center: { lat: number; lng: number }, zoom?: number) => {
    const currentMap = mapRef.current
    if (!currentMap) return
    currentMap.easeTo({ center: [center.lng, center.lat], zoom: zoom ?? currentMap.getZoom() })
  }, [])

  const getContainerRef = useCallback(() => containerRef, [])

  return {
    map,
    markers,
    loading,
    error,
    mapRef: getContainerRef(),
    initializeMap,
    addMarkers,
    clearMarkers,
    fitBounds,
    setCenter,
  }
}

function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case "critical": return "#ef4444"
    case "high": return "#f97316"
    case "medium": return "#f59e0b"
    case "low": return "#22c55e"
    default: return "#2563eb"
  }
}

function geolocationErrorMessage(code: number): string {
  switch (code) {
    case 1: return "Location permission denied. Allow location access in your browser settings and try again."
    case 2: return "Your location is currently unavailable. Check your device or OS location services."
    case 3: return "Location request timed out. Please try again."
    default: return "Failed to get your location."
  }
}

export function useGeolocation() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setLoading(false)
      },
      (err) => {
        setError(geolocationErrorMessage(err.code))
        setLoading(false)
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }
    )
  }, [])

  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) return

    return navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      (err) => {
        setError(err.message)
      },
      { enableHighAccuracy: true }
    )
  }, [])

  return { position, error, loading, getCurrentPosition, watchPosition }
}
