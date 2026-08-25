import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "reported":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "verified":
      return "bg-cyan-50 text-cyan-700 border-cyan-200"
    case "assigned":
      return "bg-purple-50 text-purple-700 border-purple-200"
    case "in_progress":
    case "in progress":
      return "bg-amber-50 text-amber-800 border-amber-200"
    case "resolved":
      return "bg-green-50 text-green-700 border-green-200"
    case "rejected":
      return "bg-gray-100 text-gray-600 border-gray-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-300 font-semibold"
    case "high":
      return "bg-orange-50 text-orange-700 border-orange-200"
    case "medium":
      return "bg-amber-50 text-amber-800 border-amber-200"
    case "low":
      return "bg-green-50 text-green-700 border-green-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    pothole: "POT",
    water_leakage: "WTR",
    streetlight: "LGT",
    garbage: "GRB",
    road_hazard: "RDZ",
    illegal_dumping: "DMP",
    sidewalk: "SWK",
    drainage: "DRN",
    traffic_signal: "SIG",
    other: "OTH",
  }
  return icons[category.toLowerCase()] || "OTH"
}

export const ISSUE_CATEGORIES = [
  { value: "pothole", label: "Pothole", icon: "POT" },
  { value: "water_leakage", label: "Water Leakage", icon: "WTR" },
  { value: "streetlight", label: "Damaged Streetlight", icon: "LGT" },
  { value: "garbage", label: "Overflowing Garbage", icon: "GRB" },
  { value: "road_hazard", label: "Road Hazard", icon: "RDZ" },
  { value: "illegal_dumping", label: "Illegal Dumping", icon: "DMP" },
  { value: "sidewalk", label: "Sidewalk Damage", icon: "SWK" },
  { value: "drainage", label: "Drainage Issue", icon: "DRN" },
  { value: "traffic_signal", label: "Traffic Signal", icon: "SIG" },
  { value: "other", label: "Other", icon: "OTH" },
]

export const ISSUE_STATUSES = [
  { value: "reported", label: "Reported", color: "outline" },
  { value: "verified", label: "Verified", color: "hatch" },
  { value: "assigned", label: "Assigned", color: "dashed" },
  { value: "in_progress", label: "In Progress", color: "inverted" },
  { value: "resolved", label: "Resolved", color: "solid" },
  { value: "rejected", label: "Rejected", color: "red" },
]

export const SEVERITY_LEVELS = [
  { value: "low", label: "Low", color: "outline" },
  { value: "medium", label: "Medium", color: "hatch" },
  { value: "high", label: "High", color: "dense" },
  { value: "critical", label: "Critical", color: "critical" },
]