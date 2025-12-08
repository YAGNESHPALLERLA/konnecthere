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
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          {columns.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.08em] text-black">{section.title}</h4>
              <ul className="space-y-2 text-sm text-black/60">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-black">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 border-t border-black/10 pt-8 text-sm text-black/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} KonnectHere. Built for modern teams.</p>
          <div className="flex gap-4 text-sm">
            <Link href="/contact" className="hover:text-black">
              Contact
            </Link>
            <Link href="/support" className="hover:text-black">
              Support
            </Link>
            <Link href="/status" className="hover:text-black">
              System status
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
