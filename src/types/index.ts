export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: "citizen" | "authority" | "admin"
  department?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Issue {
  id: string
  title: string
  description: string
  category: string
  severity: "low" | "medium" | "high" | "critical"
  status: "reported" | "verified" | "assigned" | "in_progress" | "resolved" | "rejected"
  latitude: number
  longitude: number
  address: string
  images: string[]
  reporter_id: string
  reporter?: User
  assignee_id?: string
  assignee?: User
  department?: string
  upvotes: number
  downvotes: number
  user_vote?: "up" | "down" | null
  is_following: boolean
  comments_count: number
  created_at: string
  updated_at: string
  resolved_at?: string
  verified_at?: string
  assigned_at?: string
}

export interface Comment {
  id: string
  issue_id: string
  user_id: string
  user?: User
  content: string
  images: string[]
  created_at: string
  updated_at: string
}

export interface IssueUpdate {
  id: string
  issue_id: string
  user_id: string
  user?: User
  previous_status?: string
  new_status: string
  message: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: "status_change" | "comment" | "upvote" | "assignment" | "verification" | "resolution"
  title: string
  message: string
  issue_id?: string
  issue?: Issue
  read: boolean
  created_at: string
}

export interface CategoryStats {
  category: string
  count: number
  percentage: number
}

export interface StatusStats {
  status: string
  count: number
  percentage: number
}

export interface MonthlyStats {
  month: string
  reported: number
  resolved: number
  pending: number
}

export interface GeographicHotspot {
  latitude: number
  longitude: number
  count: number
  category: string
}

export interface AnalyticsData {
  totalReports: number
  pendingIssues: number
  resolvedIssues: number
  criticalIssues: number
  categoryDistribution: CategoryStats[]
  statusDistribution: StatusStats[]
  monthlyTrends: MonthlyStats[]
  geographicHotspots: GeographicHotspot[]
  resolutionRate: number
  averageResolutionTime: number
  topCategories: CategoryStats[]
  departmentPerformance: {
    department: string
    resolved: number
    pending: number
    avgTime: number
  }[]
}

export interface DuplicateIssue {
  id: string
  title: string
  category: string
  status: string
  distance: number
  address: string
  created_at: string
}

export interface MapCluster {
  latitude: number
  longitude: number
  count: number
  issues: Issue[]
}

export interface AIClassificationResult {
  category: string
  confidence: number
  severity: "low" | "medium" | "high" | "critical"
  severityConfidence: number
  suggestedTitle: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ReportIssueFormData {
  title: string
  description: string
  category: string
  latitude: number
  longitude: number
  address: string
  images: File[]
}

export interface AuthUser {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
    role?: string
  }
}