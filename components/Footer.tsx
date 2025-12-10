import Link from "next/link"

const columns = [
  {
    title: "Overview",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
  },
  {
    title: "Candidates",
    links: [
      { label: "Browse roles", href: "/jobs" },
      { label: "Create profile", href: "/auth/signup" },
      { label: "Saved jobs", href: "/dashboard/saved" },
    ],
  },
  {
    title: "Employers",
    links: [
      { label: "Post a role", href: "/hr/jobs/new" },
      { label: "Dashboard", href: "/dashboard/hr" },
      { label: "Company profiles", href: "/hr/jobs" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security", href: "/security" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          {columns.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">{section.title}</h4>
              <ul className="space-y-3 text-sm">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} KonnectHere. Built for modern teams.
          </p>
          <div className="flex gap-6 text-sm">
            <Link 
              href="/contact" 
              className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Contact
            </Link>
            <Link 
              href="/support" 
              className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Support
            </Link>
            <Link 
              href="/status" 
              className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              System status
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
