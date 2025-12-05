import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { PageShell } from "@/components/layouts/PageShell"
import { Pill } from "@/components/ui/Pill"

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

export default async function Home() {
  // Get session - redirect() throws a special error that must not be caught
  try {
    const session = await auth()
    
    // Only redirect if we have a valid session with a role
    if (session?.user) {
      const role = (session.user as any)?.role
      if (role === "ADMIN") {
        redirect("/dashboard/admin")
      } else if (role === "HR") {
        redirect("/dashboard/hr")
      } else if (role === "USER") {
        redirect("/dashboard/user")
      }
    }
  } catch (error: any) {
    // Check if this is a redirect error - if so, re-throw it
    // Next.js redirect() throws a special error that must propagate
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error
    }
    
    // For other errors (like auth() failures), just show the home page
    // This prevents redirect loops
    if (process.env.NODE_ENV === "development") {
      console.error("[HOME] Session fetch error:", error)
    }
    // Continue to render home page for unauthenticated users
  }

  return (
    <div className="bg-white text-black">
      <section className="border-b border-black/10">
        <PageShell
          title="Work doesn't need noise"
          description="KonnectHere is a deliberately minimal hiring surface for people who value signal over scroll."
          actions={
            <>
              <Button asChild className="px-6 py-3 text-base">
                <Link href="/jobs">Browse roles</Link>
              </Button>
              <Button variant="ghost" asChild className="px-6 py-3 text-base">
                <Link href="/auth/signup">Join the waitlist</Link>
              </Button>
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-lg border border-black/10 p-6">
                <p className="text-3xl font-semibold">{item.label}</p>
                <p className="text-sm uppercase tracking-[0.08em] text-black/50">{item.description}</p>
              </div>
            ))}
          </div>
        </PageShell>
      </section>

      <PageShell>
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.title} title={pillar.title}>
              <p className="text-sm text-black/70">{pillar.copy}</p>
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
            <div key={step.title} className="rounded-lg border border-black/10 p-5">
              <Pill>Phase {index + 1}</Pill>
              <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm text-black/70">{step.body}</p>
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
        <div className="rounded-2xl border border-black/10 bg-white p-10 text-center">
          <h2 className="text-3xl font-semibold">Hire or get hired with intent</h2>
          <p className="mt-4 text-base text-black/70">
            KonnectHere keeps the experience simple so you can focus on the conversations that matter.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="px-6 py-3 text-base">
              <Link href="/jobs">Explore open roles</Link>
            </Button>
            <Button variant="ghost" asChild className="px-6 py-3 text-base">
              <Link href="/auth/signup">Talk to our team</Link>
            </Button>
          </div>
        </div>
      </PageShell>
    </div>
  )
}
