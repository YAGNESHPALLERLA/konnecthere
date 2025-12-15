"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Handle specific error types
        console.error("[SIGNIN] Login error:", result.error)
        if (result.error === "CredentialsSignin") {
          setError("Invalid email or password")
        } else if (result.error === "AccessDenied") {
          setError("Your account has been suspended or access denied")
        } else {
          setError(`Authentication error: ${result.error}`)
        }
        // Don't redirect on error - show error message on sign-in page
        return
      } else if (result?.ok) {
        // Successful login - fetch session to get user role
        try {
          const sessionRes = await fetch("/api/auth/session")
          const session = await sessionRes.json()
          const userRole = session?.user?.role

          // Determine redirect URL - use /dashboard which auto-routes based on role
          let redirectUrl = "/dashboard"
          
          // Use callbackUrl if provided and valid
          if (callbackUrl && callbackUrl !== "/" && !callbackUrl.startsWith("/auth")) {
            redirectUrl = callbackUrl
          }
          
          // Use window.location for a full page reload to ensure session is loaded
          window.location.href = redirectUrl
        } catch (sessionError) {
          console.error("[SIGNIN] Error fetching session after login:", sessionError)
          // Fallback redirect
          window.location.href = callbackUrl || "/"
        }
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setLoading(true)
    await signIn(provider, { callbackUrl })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <h2 className="page-title mb-2 text-slate-900">
            Sign in to your account
          </h2>
          <p className="text-base text-slate-600">
            Or{" "}
            <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors duration-150">
              create a new account
            </Link>
          </p>
        </div>
        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleEmailSignIn}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                label="Email address"
              />
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  label="Password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-slate-500 hover:text-slate-700 transition-colors duration-150"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m13.42 13.42l-3.29-3.29m0 0a10.05 10.05 0 01-4.121 2.825m-4.121-8.242a3 3 0 00-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg" variant="default">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* OAuth buttons (LinkedIn / Google) temporarily removed as requested */}
        </Card>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-slate-600">Loading…</div>}>
      <SignInContent />
    </Suspense>
  )
}

