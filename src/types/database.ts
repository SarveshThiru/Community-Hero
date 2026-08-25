export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: "citizen" | "authority" | "admin"
          department: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "citizen" | "authority" | "admin"
          department?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "citizen" | "authority" | "admin"
          department?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      issues: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          severity: "low" | "medium" | "high" | "critical"
          status: "reported" | "verified" | "assigned" | "in_progress" | "resolved" | "rejected"
          latitude: number
          longitude: number
          address: string
          images: string[] | null
          reporter_id: string
          assignee_id: string | null
          department: string | null
          upvotes: number
          downvotes: number
          created_at: string
          updated_at: string
          resolved_at: string | null
          verified_at: string | null
          assigned_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          severity: "low" | "medium" | "high" | "critical"
          status?: "reported" | "verified" | "assigned" | "in_progress" | "resolved" | "rejected"
          latitude: number
          longitude: number
          address: string
          images?: string[] | null
          reporter_id: string
          assignee_id?: string | null
          department?: string | null
          upvotes?: number
          downvotes?: number
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
          verified_at?: string | null
          assigned_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          severity?: "low" | "medium" | "high" | "critical"
          status?: "reported" | "verified" | "assigned" | "in_progress" | "resolved" | "rejected"
          latitude?: number
          longitude?: number
          address?: string
          images?: string[] | null
          reporter_id?: string
          assignee_id?: string | null
          department?: string | null
          upvotes?: number
          downvotes?: number
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
          verified_at?: string | null
          assigned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issues_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          id: string
          issue_id: string
          user_id: string
          content: string
          images: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          issue_id: string
          user_id: string
          content: string
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          issue_id?: string
          user_id?: string
          content?: string
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      issue_updates: {
        Row: {
          id: string
          issue_id: string
          user_id: string
          previous_status: string | null
          new_status: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          issue_id: string
          user_id: string
          previous_status?: string | null
          new_status: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          issue_id?: string
          user_id?: string
          previous_status?: string | null
          new_status?: string
          message?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_updates_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_updates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      votes: {
        Row: {
          id: string
          issue_id: string
          user_id: string
          vote_type: "up" | "down"
          created_at: string
        }
        Insert: {
          id?: string
          issue_id: string
          user_id: string
          vote_type: "up" | "down"
          created_at?: string
        }
        Update: {
          id?: string
          issue_id?: string
          user_id?: string
          vote_type?: "up" | "down"
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      follows: {
        Row: {
          id: string
          issue_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          issue_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          issue_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: "status_change" | "comment" | "upvote" | "assignment" | "verification" | "resolution"
          title: string
          message: string
          issue_id: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "status_change" | "comment" | "upvote" | "assignment" | "verification" | "resolution"
          title: string
          message: string
          issue_id?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: "status_change" | "comment" | "upvote" | "assignment" | "verification" | "resolution"
          title?: string
          message?: string
          issue_id?: string | null
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      issue_with_details: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          severity: "low" | "medium" | "high" | "critical"
          status: "reported" | "verified" | "assigned" | "in_progress" | "resolved" | "rejected"
          latitude: number
          longitude: number
          address: string
          images: string[] | null
          reporter_id: string
          reporter_name: string
          reporter_avatar: string | null
          assignee_id: string | null
          assignee_name: string | null
          assignee_avatar: string | null
          department: string | null
          upvotes: number
          downvotes: number
          comments_count: number
          is_following: boolean
          user_vote: "up" | "down" | null
          created_at: string
          updated_at: string
          resolved_at: string | null
          verified_at: string | null
          assigned_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_nearby_issues: {
        Args: {
          lat: number
          lng: number
          radius_meters?: number
          limit?: number
        }
        Returns: {
          id: string
          title: string
          category: string
          severity: string
          status: string
          latitude: number
          longitude: number
          address: string
          distance: number
        }[]
      }
      find_duplicate_issues: {
        Args: {
          lat: number
          lng: number
          category: string
          radius_meters?: number
        }
        Returns: {
          id: string
          title: string
          category: string
          status: string
          latitude: number
          longitude: number
          address: string
          distance: number
          created_at: string
        }[]
      }
      get_issue_analytics: {
        Args: {
          start_date?: string
          end_date?: string
          department?: string
        }
        Returns: Json
      }
    }
    Enums: {
      user_role: "citizen" | "authority" | "admin"
      issue_status: "reported" | "verified" | "assigned" | "in_progress" | "resolved" | "rejected"
      issue_severity: "low" | "medium" | "high" | "critical"
      vote_type: "up" | "down"
      notification_type: "status_change" | "comment" | "upvote" | "assignment" | "verification" | "resolution"
    }
    CompositeTypes: {
      _unused: never
    }
  }
}