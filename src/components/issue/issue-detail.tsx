"use client"

import { useState } from "react"
import { MapPin, Clock, User, ThumbsUp, ThumbsDown, Share2, Flag, Bell, Image as ImageIcon, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ImageUpload } from "@/components/forms/image-upload"
import { CommentForm } from "@/components/forms/comment-form"
import { StatusTimeline, StatusBadge, SeverityBadge } from "./status-timeline"
import { formatDateTime, formatRelativeTime, getCategoryIcon } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { Issue, Comment } from "@/types"
import { useIssues, useComments, useVote, useFollow } from "@/hooks/use-issues"
import { useAuth } from "@/hooks/use-auth"

interface IssueDetailProps {
  issue: Issue
  onStatusChange?: (issueId: string, status: string) => void
  onDelete?: (issueId: string) => void
  className?: string
}

export function IssueDetail({ issue, onStatusChange, onDelete, className }: IssueDetailProps) {
  const { user } = useAuth()
  const { vote, loading: voteLoading } = useVote()
  const { toggleFollow, loading: followLoading } = useFollow()
  const { comments, loading: commentsLoading, addComment, refetch: refetchComments } = useComments(issue.id)
  const [showAllImages, setShowAllImages] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const isReporter = user && issue.reporter_id === user.id
  const isAssignee = user && issue.assignee_id === user.id
  const canManage = isReporter || isAssignee || user?.role === "authority" || user?.role === "admin"

  const handleUpvote = () => vote(issue.id, "up")
  const handleDownvote = () => vote(issue.id, "down")
  const handleFollow = () => toggleFollow(issue.id).then(() => refetchComments())

  const handleCommentSubmit = async (data: { content: string }, images: File[]) => {
    await addComment(data.content, images.map(f => URL.createObjectURL(f)))
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">{getCategoryIcon(issue.category)}</span>
                    <h1 className="text-2xl font-bold text-gray-900">{issue.title}</h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default">{issue.category.replace("_", " ")}</Badge>
                    <SeverityBadge severity={issue.severity} />
                    <StatusBadge status={issue.status} />
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onStatusChange?.(issue.id, "verified")}>
                      Mark as Verified
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange?.(issue.id, "assigned")}>
                      Assign to Department
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange?.(issue.id, "in_progress")}>
                      Start Work
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange?.(issue.id, "resolved")}>
                      Mark Resolved
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleFollow()}>
                      {issue.is_following ? "Unfollow" : "Follow Updates"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigator.share?.({ title: issue.title, text: issue.description, url: window.location.href })}>
                      <Share2 className="mr-2 h-4 w-4" /> Share
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => onDelete?.(issue.id)}>
                      <Flag className="mr-2 h-4 w-4" /> Report Issue
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
              </div>

              {issue.images && issue.images.length > 0 && (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                    {issue.images.slice(0, showAllImages ? undefined : 4).map((image, index) => (
                      <Dialog key={index}>
                        <DialogTrigger asChild>
                          <div
                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => { setActiveImageIndex(index); setShowAllImages(true) }}
                          >
                            <img src={image} alt={`Issue image ${index + 1}`} className="h-full w-full object-cover" />
                            {index === 3 && issue.images.length > 4 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-medium">
                                +{issue.images.length - 4} more
                              </div>
                            )}
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl p-0">
                          <div className="relative h-[80vh] flex items-center justify-center bg-black">
                            <button
                              onClick={() => setActiveImageIndex(Math.max(0, activeImageIndex - 1))}
                              className="absolute left-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                              disabled={activeImageIndex === 0}
                              aria-label="Previous image"
                            >
                              <ChevronDown className="h-6 w-6 rotate-180" />
                            </button>
                            <img
                              src={issue.images[activeImageIndex]}
                              alt={`Issue image ${activeImageIndex + 1}`}
                              className="max-h-[80vh] max-w-full object-contain"
                            />
                            <button
                              onClick={() => setActiveImageIndex(Math.min(issue.images.length - 1, activeImageIndex + 1))}
                              className="absolute right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                              disabled={activeImageIndex === issue.images.length - 1}
                              aria-label="Next image"
                            >
                              <ChevronDown className="h-6 w-6" />
                            </button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                  {issue.images.length > 4 && (
                    <Button variant="ghost" size="sm" onClick={() => setShowAllImages(!showAllImages)}>
                      {showAllImages ? "Show Less" : `View all ${issue.images.length} images`}
                    </Button>
                  )}
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant={issue.user_vote === "up" ? "default" : "outline"}
                    size="sm"
                    onClick={handleUpvote}
                    disabled={voteLoading || !user}
                    className="gap-1"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{issue.upvotes}</span>
                  </Button>
                  <Button
                    variant={issue.user_vote === "down" ? "destructive" : "outline"}
                    size="sm"
                    onClick={handleDownvote}
                    disabled={voteLoading || !user}
                    className="gap-1"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>{issue.downvotes}</span>
                  </Button>
                  <Button
                    variant={issue.is_following ? "default" : "outline"}
                    size="sm"
                    onClick={handleFollow}
                    disabled={followLoading || !user}
                    className="gap-1"
                  >
                    <Bell className="h-4 w-4" />
                    {issue.is_following ? "Following" : "Follow"}
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Reported by {issue.reporter?.full_name || "Anonymous"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatRelativeTime(issue.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {issue.address}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline issue={issue} updates={[]} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Community Discussion ({issue.comments_count})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CommentForm onSubmit={handleCommentSubmit} />

              <Separator className="my-4" />

              {commentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-10 w-10 rounded-full bg-gray-200" />
                      <div className="h-4 w-3/4 bg-gray-200 rounded" />
                      <div className="h-4 w-1/2 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={comment.user?.avatar_url || ""} />
                        <AvatarFallback>{comment.user?.full_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comment.user?.full_name || "Anonymous"}</span>
                          <span className="text-sm text-gray-500">{formatRelativeTime(comment.created_at)}</span>
                          {comment.user?.role === "authority" && (
                            <Badge variant="secondary" className="text-xs">Official</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-gray-700">{comment.content}</p>
                        {comment.images && comment.images.length > 0 && (
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            {comment.images.map((img, idx) => (
                              <img key={idx} src={img} alt={`Comment image ${idx + 1}`} className="h-20 w-full rounded-lg object-cover" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium">{issue.address}</p>
                    <p className="text-xs text-gray-400">
                      {issue.latitude.toFixed(6)}, {issue.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Reported</p>
                    <p className="font-medium">{formatDateTime(issue.created_at)}</p>
                  </div>
                </div>
                {issue.verified_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Verified</p>
                      <p className="font-medium">{formatDateTime(issue.verified_at)}</p>
                    </div>
                  </div>
                )}
                {issue.assigned_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Assigned</p>
                      <p className="font-medium">{formatDateTime(issue.assigned_at)}</p>
                    </div>
                  </div>
                )}
                {issue.resolved_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Resolved</p>
                      <p className="font-medium">{formatDateTime(issue.resolved_at)}</p>
                    </div>
                  </div>
                )}
              </div>

              {issue.assignee && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Assigned To</p>
                  <div className="mt-2 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={issue.assignee.avatar_url || ""} />
                      <AvatarFallback>{issue.assignee.full_name?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{issue.assignee.full_name}</p>
                      <p className="text-sm text-gray-500">{issue.department || "Municipal Department"}</p>
                    </div>
                  </div>
                </div>
              )}

              {issue.department && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="mt-1 font-medium">{issue.department}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {canManage && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full justify-start"
                  variant={issue.status === "verified" ? "default" : "outline"}
                  onClick={() => onStatusChange?.(issue.id, "verified")}
                >
                  Verify Issue
                </Button>
                <Button
                  className="w-full justify-start"
                  variant={issue.status === "assigned" ? "default" : "outline"}
                  onClick={() => onStatusChange?.(issue.id, "assigned")}
                >
                  Assign to Department
                </Button>
                <Button
                  className="w-full justify-start"
                  variant={issue.status === "in_progress" ? "default" : "outline"}
                  onClick={() => onStatusChange?.(issue.id, "in_progress")}
                >
                  Mark In Progress
                </Button>
                <Button
                  className="w-full justify-start"
                  variant={issue.status === "resolved" ? "default" : "outline"}
                  onClick={() => onStatusChange?.(issue.id, "resolved")}
                >
                  Mark Resolved
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}