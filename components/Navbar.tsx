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
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
        <Link 
          href="/" 
          className="text-xl font-bold tracking-tight text-foreground transition-opacity duration-200 hover:opacity-80"
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
                  "relative px-4 py-2 text-sm font-medium tracking-tight transition-colors duration-200 rounded-lg",
                  isActive 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {status === "loading" ? (
            <span className="text-sm text-muted-foreground">Loading…</span>
          ) : session ? (
            <>
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-muted/50">
                {/* Profile Picture with Upload */}
                <ProfilePictureUpload
                  currentImage={session.user?.image}
                  userName={session.user?.name || session.user?.email || undefined}
                  size="sm"
                  showEditButton={true}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground leading-tight">
                    {session.user?.name || session.user?.email}
                  </span>
                  {userRole && (
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {userRole}
                    </span>
                  )}
                </div>
              </div>
              <Button onClick={() => signOut()} variant="outline" size="sm">
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link 
                href="/auth/signin" 
                className="text-sm font-medium text-foreground transition-colors duration-200 hover:text-primary"
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background transition-colors duration-200 hover:bg-muted md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <svg className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-white px-6 py-4 md:hidden animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2">
            {links.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-4 py-2 text-base font-medium rounded-lg transition-colors duration-200",
                    isActive 
                      ? "text-primary bg-primary/10 font-semibold" 
                      : "text-foreground hover:bg-muted"
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
                  <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50">
                    {/* Profile Picture with Upload */}
                    <ProfilePictureUpload
                      currentImage={session.user?.image}
                      userName={session.user?.name || session.user?.email || undefined}
                      size="md"
                      showEditButton={true}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {session.user?.name || session.user?.email}
                      </p>
                      {userRole && (
                        <p className="text-xs text-muted-foreground uppercase">
                          {userRole}
                        </p>
                      )}
                    </div>
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
                  className="px-4 py-2 text-sm font-medium text-foreground text-center rounded-lg hover:bg-muted transition-colors duration-200"
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
