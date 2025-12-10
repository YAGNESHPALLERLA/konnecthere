import Link from "next/link"
import { auth } from "@/auth"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { PageShell } from "@/components/layouts/PageShell"
import { Pill } from "@/components/ui/Pill"
import { JobsList } from "@/components/JobsList"

export const dynamic = "force-dynamic"

const highlights = [
  { label: "2.4M+", description: "talent profiles" },
  { label: "180", description: "cities covered" },
  { label: "72h", description: "avg. time to shortlist" },
]

const pillars = [
  {
    title: "Precision search",
    copy: "Filter by craft, seniority, geography, and compensation with zero noise.",
  },
  {
    title: "Private profiles",
    copy: "Share a single curated profile with employers. No clutter, no guesswork.",
  },
  {
    title: "One-click follow up",
    copy: "Respond, shortlist, or decline in one place. Every action remains in sync.",
  },
]

const steps = [
  { title: "Curate", body: "Import your resume or job spec. We clean, structure, and surface what matters." },
  { title: "Signal", body: "Set salary bands, regions, and collaboration rules. No cold calls, ever." },
  { title: "Decide", body: "Shortlists land in a single queue with context, notes, and nudges." },
]

/**
 * Public home page - shows job listings for all users (logged in or not)
 * 
 * This page does NOT redirect authenticated users to dashboards.
 * Users can access their dashboards via the navbar or after login.
 * 
 * Testing checklist:
 * - As logged-out user: Visit `/` → see public job list (no redirect)
 * - As USER: Login → redirected to user dashboard. Click HOME → see public job listing (no redirect)
 * - As HR: Login → redirected to HR dashboard. Click HOME → see public job listing (no redirect)
 * - As ADMIN: Login → redirected to admin dashboard. Click HOME → see public job listing (no redirect)
 */
export default async function Home() {
  // Get session for conditional rendering (e.g., welcome message), but DO NOT redirect
  const session = await auth().catch(() => null)

  return (
    <div className="bg-white text-foreground">
      <section className="border-b border-border bg-gradient-to-br from-white via-primary-50/20 to-white">
        <PageShell
          title={session?.user ? `Welcome back, ${session.user.name || session.user.email}` : "Work doesn't need noise"}
          description={session?.user ? "Browse all available job opportunities below." : "KonnectHere is a deliberately minimal hiring surface for people who value signal over scroll."}
          actions={
            session?.user ? (
              <>
                <Button asChild size="lg">
                  <Link href="/jobs">Browse all jobs</Link>
                </Button>
                {(session.user as any)?.role === "USER" && (
                  <Button variant="ghost" asChild size="lg">
                    <Link href="/dashboard/user">Go to Dashboard</Link>
                  </Button>
                )}
                {(session.user as any)?.role === "HR" && (
                  <Button variant="ghost" asChild size="lg">
                    <Link href="/dashboard/hr">Go to HR Dashboard</Link>
                  </Button>
                )}
                {(session.user as any)?.role === "ADMIN" && (
                  <Button variant="ghost" asChild size="lg">
                    <Link href="/dashboard/admin">Go to Admin Dashboard</Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/jobs">Browse roles</Link>
                </Button>
                <Button variant="ghost" asChild size="lg">
                  <Link href="/auth/signup">Join the waitlist</Link>
                </Button>
              </>
            )
          }
        >
          <div className="grid gap-6 sm:grid-cols-3 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            {highlights.map((item, index) => (
              <div 
                key={item.label} 
                className="rounded-xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-4xl font-bold text-foreground mb-2">{item.label}</p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{item.description}</p>
              </div>
            ))}
          </div>
        </PageShell>
      </section>

      <PageShell>
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <Card 
              key={pillar.title} 
              title={pillar.title}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <p className="text-base text-muted-foreground leading-relaxed">{pillar.copy}</p>
            </Card>
          ))}
        </div>
      </PageShell>

      <PageShell
        title="How teams use KonnectHere"
        description="Whether you're scaling a leadership bench or finding your next role, the workflow stays calm."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div 
              key={step.title} 
              className="group rounded-xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <Pill className="bg-primary-50 text-primary-700 border-primary-200">Phase {index + 1}</Pill>
              <h3 className="mt-5 text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </PageShell>

      <PageShell subdued className="mt-4" title="Stay private, stay visible" description="No feeds. No noisy dashboards. Just a single place to manage opportunities.">
        <div className="grid gap-6 md:grid-cols-2">
          <Card title="For talent" subtitle="One profile. Infinite intros.">
            <ul className="space-y-3 text-sm text-black/70">
              <li>• Upload once — resumes, portfolios, and context in one link.</li>
              <li>• Control who sees compensation, references, or availability.</li>
              <li>• Track intros and feedback without digging through inboxes.</li>
            </ul>
            <Button asChild className="mt-6 w-full">
              <Link href="/auth/signup">Create a profile</Link>
            </Button>
          </Card>
          <Card title="For teams" subtitle="A cleaner pipeline">
            <ul className="space-y-3 text-sm text-black/70">
              <li>• Brief stakeholders with shared notes and structured scorecards.</li>
              <li>• Search across talent, salaries, and location filters instantly.</li>
              <li>• Centralize feedback loops without adding more software.</li>
            </ul>
            <Button asChild className="mt-6 w-full">
              <Link href="/employer/onboarding">Open a role</Link>
            </Button>
          </Card>
        </div>
      </PageShell>

      <PageShell subdued className="mt-0">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-white to-primary-50/30 p-12 text-center shadow-sm">
          <h2 className="text-4xl font-bold text-foreground mb-4">Hire or get hired with intent</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            KonnectHere keeps the experience simple so you can focus on the conversations that matter.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/jobs">Explore open roles</Link>
            </Button>
            <Button variant="ghost" asChild size="lg">
              <Link href="/auth/signup">Talk to our team</Link>
            </Button>
          </div>
        </div>
      </PageShell>

      {/* Jobs Listing Section */}
      <PageShell
        title="All Open Roles"
        description="Browse all available job opportunities"
      >
        <JobsList />
      </PageShell>
    </div>
  )
}
