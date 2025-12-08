import { redirect } from "next/navigation"

/**
 * Redirect /dashboard/saved to /candidate/saved for consistency
 */
export default function SavedPage() {
  redirect("/candidate/saved")
}

