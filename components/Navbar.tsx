"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const userRole = (session?.user as any)?.role

  // Role-based navigation links
  const getNavLinks = () => {
    const baseLinks = [
      { href: "/", label: "Home" },
      { href: "/jobs", label: "Jobs" }
    ]

    if (!session) return baseLinks

    // Add Konnect and Messages for all authenticated users
    const authenticatedLinks = [
      ...baseLinks,
      { href: "/konnect", label: "Konnect" },
      { href: "/messages", label: "Messages" },
    ]

    // Add Dashboard link - will redirect to role-specific dashboard
    if (userRole === "ADMIN") {
      return [
        ...authenticatedLinks,
        { href: "/dashboard", label: "Admin" },
      ]
    }

    if (userRole === "HR") {
      return [
        ...authenticatedLinks,
        { href: "/dashboard", label: "HR Dashboard" },
      ]
    }

    // USER or default
    return [
      ...authenticatedLinks,
      { href: "/dashboard", label: "Dashboard" },
    ]
  }

  const links = getNavLinks()

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          KonnectHere
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-semibold uppercase tracking-[0.08em]",
                (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)) ? "text-black" : "text-black/45 hover:text-black"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {status === "loading" ? (
            <span className="text-sm text-black/40">Loading…</span>
          ) : session ? (
            <>
              <span className="text-sm font-medium text-black/70">
                {session.user?.name || session.user?.email}
              </span>
              {userRole && (
                <span className="text-xs font-medium text-black/50 uppercase">
                  {userRole}
                </span>
              )}
              <Button onClick={() => signOut()} className="px-5 py-2">
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="text-sm font-semibold uppercase tracking-[0.08em] text-black">
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center rounded-md border border-black px-5 py-2 text-sm font-semibold uppercase tracking-[0.08em]"
              >
                Join
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-black/10 bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-base font-semibold uppercase tracking-[0.08em] text-black"
              >
                {link.label}
              </Link>
            ))}
            {status === "loading" && <span className="text-sm text-black/40">Loading…</span>}
            {session ? (
              <>
                {userRole && (
                  <span className="text-xs font-medium text-black/50 uppercase mb-2">
                    {userRole}
                  </span>
                )}
                <Button onClick={() => signOut()} className="mt-2 w-full justify-center">
                  Sign out
                </Button>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link href="/auth/signin" onClick={() => setOpen(false)} className="text-sm font-semibold text-black">
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center rounded-md border border-black px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em]"
                >
                  Create account
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
