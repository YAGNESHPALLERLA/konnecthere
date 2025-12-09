import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

/**
 * Admin role types
 */
export type AdminRole = "ADMIN" | "SUPER_ADMIN" | "MODERATOR"

/**
 * Require admin access (ADMIN, SUPER_ADMIN, or MODERATOR)
 * Redirects non-admin users to their dashboard
 */
export async function requireAdmin(): Promise<{ id: string; email: string; role: string }> {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin")
  }

  const role = (session.user as any).role
  const adminRoles: string[] = ["ADMIN", "SUPER_ADMIN", "MODERATOR"]

  if (!adminRoles.includes(role)) {
    // Redirect to user's own dashboard with error message
    if (role === "HR") {
      redirect("/dashboard/hr?error=admin_access_required")
    } else if (role === "USER") {
      redirect("/dashboard/user?error=admin_access_required")
    } else {
      redirect("/auth/signin?callbackUrl=/admin")
    }
  }

  return {
    id: (session.user as any).id,
    email: session.user.email,
    role,
  }
}

/**
 * Require super admin access (SUPER_ADMIN only)
 */
export async function requireSuperAdmin(): Promise<{ id: string; email: string; role: string }> {
  const user = await requireAdmin()
  
  if (user.role !== "SUPER_ADMIN") {
    redirect("/admin?error=super_admin_required")
  }

  return user
}

/**
 * Require moderator or higher (MODERATOR, ADMIN, SUPER_ADMIN)
 */
export async function requireModerator(): Promise<{ id: string; email: string; role: string }> {
  return requireAdmin() // Same as requireAdmin for now
}

/**
 * Check if user has admin access (does not redirect)
 */
export async function hasAdminAccess(): Promise<boolean> {
  const session = await auth()
  if (!session?.user) return false
  
  const role = (session.user as any).role
  return ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(role)
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const session = await auth()
  if (!session?.user) return false
  
  const role = (session.user as any).role
  return role === "SUPER_ADMIN"
}

/**
 * Log admin action to audit log
 */
export async function logAdminAction(params: {
  adminId: string
  actionType: string
  entityType: string
  entityId: string
  metadata?: any
  ipAddress?: string
  userAgent?: string
}) {
  try {
    await prisma.adminActionLog.create({
      data: {
        adminId: params.adminId,
        actionType: params.actionType,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata || {},
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
  } catch (error) {
    console.error("[ADMIN_ACTION_LOG] Failed to log action:", error)
    // Don't throw - logging failures shouldn't break admin operations
  }
}

