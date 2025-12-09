"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

const adminNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/hr", label: "HR / Employers" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/skills", label: "Skills & Categories" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit-logs", label: "Audit Logs" },
]

export function AdminNav() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const userRole = (session?.user as any)?.role

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-lg font-semibold tracking-tight">
            Admin Portal
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                    ? "bg-black text-white"
                    : "text-black/60 hover:text-black hover:bg-gray-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-black/60">
            {session?.user?.name || session?.user?.email}
          </span>
          {userRole && (
            <span className="hidden sm:inline text-xs font-medium text-black/50 uppercase">
              {userRole}
            </span>
          )}
          <Link href="/" className="text-sm font-medium text-black/60 hover:text-black">
            View Site
          </Link>
          <Button onClick={() => signOut()} variant="outline" size="sm">
            Sign Out
          </Button>
          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-black/10 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md",
                  pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                    ? "bg-black text-white"
                    : "text-black"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

