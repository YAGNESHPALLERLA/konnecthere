"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration. Please contact support.",
    AccessDenied: "You do not have permission to sign in. Please check your credentials.",
    Verification: "The verification token has expired or has already been used.",
    Default: "An error occurred during authentication. Please try again.",
    CredentialsSignin: "Invalid email or password. Please check your credentials and try again.",
    OAuthSignin: "Error occurred during OAuth sign in. Please try again.",
    OAuthCallback: "Error occurred during OAuth callback. Please try again.",
    OAuthCreateAccount: "Could not create OAuth account. Please try again.",
    EmailCreateAccount: "Could not create email account. Please try again.",
    Callback: "Error occurred during authentication callback. Please try again.",
    OAuthAccountNotLinked: "An account with this email already exists. Please sign in with your original provider.",
    EmailSignin: "Error sending email. Please try again.",
    SessionRequired: "Please sign in to access this page.",
  }

  // Handle undefined error - log to help debug
  const errorKey = error || "Default"
  const errorMessage = errorMessages[errorKey] || errorMessages.Default
  
  // Log undefined errors for debugging
  if (!error && process.env.NODE_ENV === "development") {
    console.error("[AUTH ERROR] Received error=undefined. This usually means:")
    console.error("1. An error occurred but wasn't properly passed to the error page")
    console.error("2. Check server logs for [AUTH] prefixed messages")
    console.error("3. Verify credentials are correct and user exists in database")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-bold text-black">Authentication Error</h2>
          <p className="mt-2 text-sm text-gray-600">{errorMessage}</p>
        </div>
        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center rounded-md border border-black bg-white px-6 py-3 text-sm font-semibold uppercase tracking-tight text-black hover:bg-gray-50"
          >
            Try Again
          </Link>
          <div>
            <Link href="/" className="text-sm text-gray-600 hover:text-black">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}

