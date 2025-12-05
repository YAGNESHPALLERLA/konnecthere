import { auth } from "@/auth"
import { redirect } from "next/navigation"
import type { UserRole } from "@/types/next-auth"

/**
 * Get the current authenticated user's session
 * Throws/redirects if not authenticated
 */
export async function requireAuth() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      // Redirect to sign-in with callback URL to return after login
      redirect("/auth/signin")
    }

    return session.user
  } catch (error) {
    // If auth() fails, redirect to sign-in
    console.error("[requireAuth] Error fetching session:", error)
    redirect("/auth/signin")
  }
}

/**
 * Require the user to have one of the specified roles
 * @param roles - Single role or array of roles
 * @param redirectTo - Optional redirect path (default: redirects to user's dashboard)
 */
export async function requireRole(
  roles: UserRole | UserRole[],
  redirectTo?: string
): Promise<{ id: string; email: string; role: UserRole }> {
  const user = await requireAuth()
  
  const allowedRoles = Array.isArray(roles) ? roles : [roles]
  
  if (!allowedRoles.includes(user.role)) {
    // If wrong role, redirect to user's own dashboard instead of sign-in
    if (!redirectTo) {
      if (user.role === "ADMIN") {
        redirect("/dashboard/admin")
      } else if (user.role === "HR") {
        redirect("/dashboard/hr")
      } else if (user.role === "USER") {
        redirect("/dashboard/user")
      }
    }
    redirect(redirectTo || "/auth/signin")
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  }
}

/**
 * Check if user has a specific role (does not throw/redirect)
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const session = await auth()
  return session?.user?.role === role
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const session = await auth()
  if (!session?.user) return false
  return roles.includes(session.user.role)
}

/**
 * Get current user role (returns null if not authenticated)
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const session = await auth()
  return session?.user?.role || null
}

