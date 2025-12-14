"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { ProfilePictureUpload } from "@/components/ui/ProfilePictureUpload"
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
      { href: "/dashboard", label: "My Profile" },
    ]
  }

  const links = getNavLinks()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
        <Link 
          href="/" 
          className="text-xl font-bold tracking-tight text-slate-900 transition-opacity duration-200 hover:opacity-80"
        >
          KonnectHere
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium tracking-tight transition-colors duration-150 rounded-lg nav-underline",
                  isActive && "active",
                  isActive 
                    ? "text-slate-900 font-semibold bg-slate-100" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-500 rounded-full transition-all duration-200" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {status === "loading" ? (
            <span className="text-sm text-slate-600">Loading…</span>
          ) : session ? (
            <>
              <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 shadow-sm">
                {/* Profile Picture with Upload */}
                <ProfilePictureUpload
                  currentImage={session.user?.image}
                  userName={session.user?.name || session.user?.email || undefined}
                  size="sm"
                  showEditButton={true}
                />
                <Link 
                  href="/dashboard" 
                  className="flex flex-col leading-tight hover:opacity-80 transition-opacity duration-150 min-w-0"
                >
                  <span className="text-sm font-medium text-slate-900 truncate">
                    {session.user?.name || session.user?.email}
                  </span>
                  {userRole && (
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {userRole}
                    </span>
                  )}
                </Link>
              </div>
              <Button onClick={() => signOut()} variant="outline" size="sm" className="ml-2 shrink-0">
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link 
                href="/auth/signin" 
                className="text-sm font-medium text-slate-700 transition-colors duration-150 hover:text-slate-900"
              >
                Sign in
              </Link>
              <Button asChild>
                <Link href="/auth/signup">Join</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white transition-colors duration-150 hover:bg-slate-50 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <svg className="h-5 w-5 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2">
            {links.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-4 py-2 text-base font-medium rounded-lg transition-colors duration-150",
                    isActive 
                      ? "text-slate-900 bg-slate-100 font-semibold" 
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
            {status === "loading" && <span className="text-sm text-muted-foreground">Loading…</span>}
            {session ? (
              <>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 shadow-sm">
                    {/* Profile Picture with Upload */}
                    <ProfilePictureUpload
                      currentImage={session.user?.image}
                      userName={session.user?.name || session.user?.email || undefined}
                      size="md"
                      showEditButton={true}
                    />
                    <Link 
                      href="/dashboard" 
                      className="flex flex-col leading-tight min-w-0 flex-1 hover:opacity-80 transition-opacity duration-150"
                    >
                      <p className="text-sm font-medium text-slate-900 truncate cursor-pointer">
                        {session.user?.name || session.user?.email}
                      </p>
                      {userRole && (
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          {userRole}
                        </p>
                      )}
                    </Link>
                  </div>
                  <Button onClick={() => signOut()} variant="outline" className="w-full justify-center">
                    Sign out
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link 
                  href="/auth/signin" 
                  onClick={() => setOpen(false)} 
                  className="px-4 py-2 text-sm font-medium text-slate-700 text-center rounded-lg hover:bg-slate-50 transition-colors duration-150"
                >
                  Sign in
                </Link>
                <Button asChild className="w-full">
                  <Link href="/auth/signup" onClick={() => setOpen(false)}>
                    Create account
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
