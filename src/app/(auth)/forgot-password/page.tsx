"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Suspense } from "react"

function ForgotPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/login"
  const { resetPassword } = useAuth()

  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const { error } = await resetPassword(email)

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="barcode-strip mb-0 h-4 w-full border border-b-0 border-black" aria-hidden="true" />
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="barcode-strip inline-block h-6 w-12" aria-hidden="true" />
              <span className="text-sm font-bold uppercase tracking-[0.18em]">Community Hero</span>
            </Link>
            {success ? (
              <>
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold uppercase tracking-tight">Check Your Email</CardTitle>
                <CardDescription>
                  We've sent a password reset link to <strong>{email}</strong>.
                  Please check your inbox and follow the link to reset your password.
                </CardDescription>
                <div className="mt-6">
                  <Link href="/login" className="text-blue-600 hover:underline font-medium">
                    Back to Sign In
                  </Link>
                </div>
              </>
            ) : (
              <>
                <CardTitle className="text-2xl font-bold uppercase tracking-tight">Reset Password</CardTitle>
                <CardDescription>Enter your email to receive a password reset link</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {!success && (
              <>
                {error && (
                  <div className={cn("p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-sm", "animate-in slide-in-from-top-2")}>
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-gray-600">
                  Remember your password?{" "}
                  <Link href={`/login?callbackUrl=${callbackUrl}`} className="font-semibold text-blue-600 hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
          <div className="w-full max-w-md">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <Link href="/" className="inline-flex items-center gap-2 mb-4">
                  <span className="barcode-strip inline-block h-6 w-12" aria-hidden="true" />
                  <span className="text-sm font-bold uppercase tracking-[0.18em]">Community Hero</span>
                </Link>
                <CardTitle className="text-2xl font-bold uppercase tracking-tight">Reset Password</CardTitle>
                <CardDescription>Enter your email to receive a password reset link</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="animate-pulse space-y-4">
                  <div className="h-10 w-full bg-gray-200 rounded" />
                  <div className="h-12 w-full bg-gray-200 rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    />
  )
}