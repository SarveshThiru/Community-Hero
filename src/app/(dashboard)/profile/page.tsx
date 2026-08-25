"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, MapPin, Shield, Camera, Loader2, CheckCircle, AlertCircle, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import { useNotifications } from "@/hooks/use-notifications"
import { useDashboardStats } from "@/hooks/use-analytics"
import { formatDateTime, formatRelativeTime } from "@/lib/utils"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut, refreshUser } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading: notifLoading } = useNotifications()
  const { stats } = useDashboardStats()
  const [activeTab, setActiveTab] = useState("profile")
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaveError("")
    setSaveSuccess(false)

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (!result.success) throw new Error(result.error || "Failed to save")

      await refreshUser()
      setSaveSuccess(true)
      setEditing(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

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
            <Button onClick={() => router.push("/login?callbackUrl=/profile")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold uppercase tracking-tight text-black">Profile & Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account, preferences, and notifications</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="activity">My Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.avatar_url || ""} alt={user.full_name || ""} />
                      <AvatarFallback className="text-2xl">
                        {user.full_name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold uppercase tracking-tight text-black">{user.full_name || "User"}</h2>
                      <p className="text-gray-600">{user.email}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant={user.role === "authority" ? "default" : user.role === "admin" ? "destructive" : "secondary"}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                        {user.department && (
                          <Badge variant="outline">{user.department}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setEditing(!editing)}>
                    {editing ? "Cancel" : "Edit Profile"}
                  </Button>
                </CardHeader>
                <CardContent className="pt-0">
                  {saveSuccess && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span>Profile saved successfully!</span>
                    </div>
                  )}

                  {saveError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <span>{saveError}</span>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Full Name"
                      value={editing ? formData.full_name : user.full_name || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      disabled={!editing}
                      placeholder="Enter your full name"
                    />
                    <Input
                      label="Email"
                      value={user.email}
                      disabled
                      type="email"
                    />
                    <Input
                      label="Phone"
                      value={editing ? formData.phone : user.phone || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!editing}
                      placeholder="Enter phone number"
                      type="tel"
                    />
                    <Input
                      label="Address"
                      value={editing ? formData.address : user.address || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      disabled={!editing}
                      placeholder="Enter your address"
                    />
                  </div>

                  {editing && (
                    <div className="mt-6 flex gap-4">
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setFormData({
                          full_name: user.full_name || "",
                          email: user.email,
                          phone: user.phone || "",
                          address: user.address || "",
                        })
                        setEditing(false)
                      }}>
                        Cancel
                      </Button>
                    </div>
                  )}

                  <Separator className="my-6" />

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Button variant="outline" onClick={() => signOut()}>
                        <Loader2 className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                      <Button variant="destructive" onClick={() => {}}>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {user.role === "authority" || user.role === "admin" ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Authority Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="p-4 rounded-lg bg-blue-50">
                        <p className="text-3xl font-bold text-blue-600">{stats.totalReports}</p>
                        <p className="text-sm text-blue-700">Total Reports</p>
                      </div>
                      <div className="p-4 rounded-lg bg-amber-50">
                        <p className="text-3xl font-bold text-amber-600">{stats.pendingIssues}</p>
                        <p className="text-sm text-amber-700">Pending Review</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50">
                        <p className="text-3xl font-bold text-green-600">{stats.resolvedIssues}</p>
                        <p className="text-sm text-green-700">Resolved</p>
                      </div>
                      <div className="p-4 rounded-lg bg-red-50">
                        <p className="text-3xl font-bold text-red-600">{stats.criticalIssues}</p>
                        <p className="text-sm text-red-700">Critical</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="p-4 rounded-lg bg-blue-50">
                        <p className="text-3xl font-bold text-blue-600">{stats.myReports}</p>
                        <p className="text-sm text-blue-700">My Reports</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50">
                        <p className="text-3xl font-bold text-green-600">{stats.myUpvotes}</p>
                        <p className="text-sm text-green-700">Upvotes Given</p>
                      </div>
                      <div className="p-4 rounded-lg bg-purple-50">
                        <p className="text-3xl font-bold text-purple-600">{stats.myFollows}</p>
                        <p className="text-sm text-purple-700">Following</p>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-3xl font-bold text-gray-600">0</p>
                        <p className="text-sm text-gray-700">Badges Earned</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                <div className="flex items-center gap-2">
                  <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>{unreadCount} unread</Badge>
                  <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                    Mark all read
                  </Button>
                </div>
              </div>

              {notifLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="animate-pulse flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/2 bg-gray-200 rounded" />
                            <div className="h-3 w-1/3 bg-gray-200 rounded" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Bell className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                    <p className="text-gray-500">You'll see updates about your reports here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {notifications.map(notification => (
                    <Card key={notification.id} className={cn(!notification.read && "border-blue-200 bg-blue-50/50")}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={cn("font-medium", !notification.read && "font-semibold")}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <Badge variant="default" className="text-xs">New</Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                            <p className="mt-1 text-xs text-gray-500">{formatRelativeTime(notification.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                                Mark read
                              </Button>
                            )}
                            {notification.issue_id && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={`/issues/${notification.issue_id}`}>View Issue</a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Your recent reports and interactions will appear here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
