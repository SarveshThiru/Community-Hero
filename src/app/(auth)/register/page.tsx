"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Shield, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const { signUp, signInWithGoogle, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)
    const { error } = await signUp(formData.email, formData.password, formData.fullName)
    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  const handleGoogleSignIn = async () => {
    setError("")
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
    }
  }

  const passwordRequirements = [
    { met: formData.password.length >= 8, label: "At least 8 characters" },
    { met: /[A-Z]/.test(formData.password), label: "One uppercase letter" },
    { met: /[a-z]/.test(formData.password), label: "One lowercase letter" },
    { met: /[0-9]/.test(formData.password), label: "One number" },
    { met: /[^A-Za-z0-9]/.test(formData.password), label: "One special character" },
  ]

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
          <CardTitle className="text-2xl font-bold uppercase tracking-tight">Enroll</CardTitle>
          <CardDescription>Join citizens making a difference</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className={cn("p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-sm", "animate-in slide-in-from-top-2")}>
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
              autoComplete="name"
              disabled={isLoading || authLoading}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={isLoading || authLoading}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                disabled={isLoading || authLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Input
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              disabled={isLoading || authLoading}
            />

            {formData.password && (
              <div className="space-y-1.5">
                <p className="text-xs text-gray-500">Password strength:</p>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${(passwordRequirements.filter(r => r.met).length / passwordRequirements.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {passwordRequirements.map((req, i) => (
                    <span key={i} className={cn("flex items-center gap-1", req.met ? "text-green-600" : "text-gray-400")}>
                      <CheckCircle className="h-3 w-3" />
                      {req.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || authLoading} size="lg">
              {isLoading || authLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <Separator className="my-6" />

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading || authLoading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-sm text-black/60">
            Already have an account?{" "}
            <Link href={`/login?callbackUrl=${callbackUrl}`} className="font-semibold text-black underline underline-offset-4 hover:no-underline">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-black/50">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-black underline underline-offset-4 hover:no-underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-black underline underline-offset-4 hover:no-underline">Privacy Policy</Link>
          </p>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}