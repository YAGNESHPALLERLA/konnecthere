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
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex w-full max-w-site flex-col gap-8 px-4 py-8 md:py-10">
        <div className="grid gap-6 md:grid-cols-4">
          {columns.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="muted-label">{section.title}</h4>
              <ul className="space-y-3 text-sm">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-slate-600 ui-transition hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            &copy; {new Date().getFullYear()} KonnectHere. Built for modern teams.
          </p>
          <div className="flex gap-6 text-sm">
            <Link 
              href="/contact" 
              className="text-slate-600 ui-transition hover:text-slate-900"
            >
              Contact
            </Link>
            <Link 
              href="/support" 
              className="text-slate-600 ui-transition hover:text-slate-900"
            >
              Support
            </Link>
            <Link 
              href="/status" 
              className="text-slate-600 ui-transition hover:text-slate-900"
            >
              System status
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
