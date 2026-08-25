"use client"

import { CheckCircle, Clock, Loader2, AlertCircle, MapPin, User, MessageSquare, Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import { getStatusColor, getSeverityColor, formatDateTime } from "@/lib/utils"
import type { Issue, IssueUpdate } from "@/types"

const STATUS_ORDER = [
  { value: "reported", label: "Reported", icon: MapPin, color: "blue" },
  { value: "verified", label: "Verified", icon: CheckCircle, color: "amber" },
  { value: "assigned", label: "Assigned", icon: User, color: "purple" },
  { value: "in_progress", label: "In Progress", icon: Loader2, color: "orange" },
  { value: "resolved", label: "Resolved", icon: CheckCircle, color: "green" },
  { value: "rejected", label: "Rejected", icon: AlertCircle, color: "red" },
] as const

type StatusValue = typeof STATUS_ORDER[number]["value"]

function getStatusInfo(status: string) {
  return STATUS_ORDER.find(s => s.value === status) || STATUS_ORDER[0]
}

interface StatusTimelineProps {
  issue: Issue
  updates?: IssueUpdate[]
  className?: string
}

export function StatusTimeline({ issue, updates = [], className }: StatusTimelineProps) {
  const currentStatusIndex = STATUS_ORDER.findIndex(s => s.value === issue.status)
  const isResolved = issue.status === "resolved"
  const isRejected = issue.status === "rejected"

  const getIconColor = (status: string, index: number) => {
    const info = getStatusInfo(status)
    if (index < currentStatusIndex || (index === currentStatusIndex && (isResolved || isRejected))) {
      return info.color
    }
    if (index === currentStatusIndex) {
      return info.color
    }
    return "gray"
  }

  const getIconComponent = (status: string, index: number) => {
    const info = getStatusInfo(status)
    const Icon = info.icon
    const color = getIconColor(status, index)
    const isCompleted = index < currentStatusIndex || (index === currentStatusIndex && (isResolved || isRejected))
    const isCurrent = index === currentStatusIndex && !isResolved && !isRejected

    return (
      <div
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
          `border-${color}-500`,
          isCompleted ? `bg-${color}-500 text-white` : "bg-white text-gray-400",
          isCurrent && "animate-pulse ring-2 ring-offset-2" && `ring-${color}-500`
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
    )
  }

  const getTimelineItem = (status: StatusValue, index: number) => {
    const info = getStatusInfo(status)
    const isCompleted = index < currentStatusIndex || (index === currentStatusIndex && (isResolved || isRejected))
    const isCurrent = index === currentStatusIndex && !isResolved && !isRejected
    const isFuture = index > currentStatusIndex

    const relatedUpdate = updates.find(u => u.new_status === status)
    const updateTime = relatedUpdate ? formatDateTime(relatedUpdate.created_at) : null
    const updateMessage = relatedUpdate?.message || ""

    return (
      <div key={status} className="relative flex flex-col sm:flex-row">
        <div className="relative flex items-start sm:items-center sm:w-16">
          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 sm:left-1/2 sm:top-10 sm:bottom-auto sm:h-0.5 sm:w-full" />
          {getIconComponent(status, index)}
        </div>
        <div className={cn(
          "flex-1 pb-8 sm:pb-0 sm:pl-6",
          isFuture && "opacity-50"
        )}>
          <div className="flex items-center gap-2">
            <h4 className={cn(
              "font-medium",
              isCompleted ? "text-gray-900" : isCurrent ? "text-blue-700" : "text-gray-500"
            )}>
              {info.label}
            </h4>
            {isCurrent && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full animate-pulse">
                Current
              </span>
            )}
            {isCompleted && updateTime && (
              <span className="text-xs text-gray-400 ml-auto">{updateTime}</span>
            )}
          </div>
          {updateMessage && (
            <p className="mt-1 text-sm text-gray-500">{updateMessage}</p>
          )}
          {isCompleted && relatedUpdate?.user && (
            <p className="mt-1 text-xs text-gray-400">
              Updated by {relatedUpdate.user.full_name}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-0", className)}>
      {STATUS_ORDER.map((status, index) => getTimelineItem(status.value, index))}
    </div>
  )
}

interface StatusBadgeProps {
  status: string
  size?: "sm" | "md" | "lg"
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const info = getStatusInfo(status as StatusValue)
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-medium rounded-full",
      sizes[size],
      getStatusColor(status)
    )}>
      <info.icon className="h-3 w-3" />
      {info.label}
    </span>
  )
}

interface SeverityBadgeProps {
  severity: string
  size?: "sm" | "md" | "lg"
}

export function SeverityBadge({ severity, size = "md" }: SeverityBadgeProps) {
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-medium rounded-full",
      sizes[size],
      getSeverityColor(severity)
    )}>
      <AlertCircle className="h-3 w-3" />
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  )
}