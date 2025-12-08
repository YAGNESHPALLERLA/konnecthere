import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

/**
 * Dashboard root route - redirects to role-specific dashboard
 * This ensures users always land on the correct dashboard for their role
 */
export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard")
  }

  const role = session.user.role

  // Redirect to role-specific dashboard
  if (role === "ADMIN") {
    redirect("/dashboard/admin")
  } else if (role === "HR") {
    redirect("/dashboard/hr")
  } else {
    redirect("/dashboard/user")
  }
}
