import { PageShell } from "@/components/layouts/PageShell"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function CareersPage() {
  return (
    <PageShell title="Careers at KonnectHere" description="Join our team">
      <div className="prose max-w-none">
        <h2>Join Our Team</h2>
        <p>
          We're always looking for talented individuals who share our passion for connecting people
          with opportunities. If you're interested in joining KonnectHere, we'd love to hear from you.
        </p>

        <h2>Open Positions</h2>
        <p>
          Currently, we don't have any open positions, but we're always open to hearing from exceptional
          candidates. Feel free to reach out to us at{" "}
          <a href="mailto:careers@konnecthere.com">careers@konnecthere.com</a>.
        </p>

        <h2>Why Work With Us</h2>
        <ul>
          <li>Competitive compensation and benefits</li>
          <li>Remote-first culture</li>
          <li>Opportunities for growth and development</li>
          <li>Work on meaningful projects that impact people's careers</li>
        </ul>

        <div className="mt-8">
          <Link href="/jobs">
            <Button>Browse All Jobs</Button>
          </Link>
        </div>
      </div>
    </PageShell>
  )
}

