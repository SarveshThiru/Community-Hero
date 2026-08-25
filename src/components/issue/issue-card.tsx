"use client"

import Link from "next/link"
import { MapPin, Clock, ThumbsUp, MessageSquare, Eye, User, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatRelativeTime, getStatusColor, getSeverityColor, getCategoryIcon } from "@/lib/utils"
import type { Issue } from "@/types"
import { cn } from "@/lib/utils"

interface IssueCardProps {
  issue: Issue
  variant?: "default" | "compact" | "detailed"
  onClick?: () => void
  className?: string
}

export function IssueCard({ issue, variant = "default", onClick, className }: IssueCardProps) {
  const handleClick = () => {
    if (onClick) onClick()
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/issues/${issue.id}`}
        onClick={(e) => { e.preventDefault(); handleClick() }}
        className={cn("block p-3 hover:bg-gray-50 transition-colors", className)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-none border border-black bg-white flex items-center justify-center text-[11px] font-bold tracking-wider">
            {getCategoryIcon(issue.category)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-black truncate">{issue.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default" className="text-xs">{issue.category.replace("_", " ")}</Badge>
              <Badge variant={issue.severity as any} className="text-xs">{issue.severity}</Badge>
              <Badge className={cn(getStatusColor(issue.status), "text-xs")}>{issue.status.replace("_", " ")}</Badge>
            </div>
            <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {issue.address}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">{issue.upvotes} <ThumbsUp className="h-3 w-3" /></span>
            <span className="flex items-center gap-1">{issue.comments_count} <MessageSquare className="h-3 w-3" /></span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Card
      className={cn("transition-colors hover:bg-black/[0.03] hover:outline hover:outline-1 hover:outline-black", className)}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick() }} : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-none border border-black bg-white flex items-center justify-center text-xs font-bold tracking-wider">
            {getCategoryIcon(issue.category)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-black line-clamp-1">{issue.title}</h3>
              <Badge className={cn(getStatusColor(issue.status), "whitespace-nowrap")}>
                {issue.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{issue.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="default">{issue.category.replace("_", " ")}</Badge>
              <Badge variant={issue.severity as any}>{issue.severity}</Badge>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                {issue.address}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(issue.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-4 border-t border-black">
          <div className="flex items-center gap-4">
            <Avatar className="h-7 w-7 rounded-none border border-black bg-white">
              <AvatarImage src={issue.reporter?.avatar_url || ""} />
              <AvatarFallback>{issue.reporter?.full_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">{issue.reporter?.full_name || "Anonymous"}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1" title="Upvotes">
              <ThumbsUp className="h-4 w-4" />
              {issue.upvotes}
            </span>
            <span className="flex items-center gap-1" title="Comments">
              <MessageSquare className="h-4 w-4" />
              {issue.comments_count}
            </span>
            <span className="flex items-center gap-1" title="Views">
              <Eye className="h-4 w-4" />
              {(issue as any).views || 0}
            </span>
          </div>
        </div>

        {issue.images && issue.images.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {issue.images.slice(0, 3).map((image, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden">
                <img src={image} alt={`Issue image ${index + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
            {issue.images.length > 3 && (
              <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                +{issue.images.length - 3} more
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}