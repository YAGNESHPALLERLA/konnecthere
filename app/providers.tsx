"use client"

import { SessionProvider } from "next-auth/react"

/**
 * SessionProvider wrapper
 * 
 * Configuration:
 * - refetchInterval={0} - Disable automatic polling to prevent unnecessary requests
 * - refetchOnWindowFocus={false} - Don't refetch when window regains focus
 * - refetchWhenOffline={false} - Don't refetch when offline
 * - baseUrl - Explicitly set to prevent redirect loops
 * 
 * The SessionProvider will fetch /api/auth/session on mount.
 * Since we use route-based auth (no middleware), /api/auth/session works without redirect loops.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={0} 
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
      baseUrl={typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}
    >
      {children}
    </SessionProvider>
  )
}


