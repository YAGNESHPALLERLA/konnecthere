import { PageShell } from "@/components/layouts/PageShell"

export default function PressPage() {
  return (
    <PageShell title="Press & Media" description="Press resources and media inquiries">
      <div className="prose max-w-none">
        <h2>Press Inquiries</h2>
        <p>
          For media inquiries, please contact us at{" "}
          <a href="mailto:press@konnecthere.com">press@konnecthere.com</a>.
        </p>

        <h2>About KonnectHere</h2>
        <p>
          KonnectHere is a modern job platform that connects talented professionals with
          exceptional career opportunities. We focus on quality matches and streamlined
          experiences for both candidates and employers.
        </p>

        <h2>Press Kit</h2>
        <p>
          Our press kit includes logos, brand guidelines, and company information.
          Please contact us for access to these resources.
        </p>

        <h2>Recent News</h2>
        <p>Check back soon for updates and announcements.</p>
      </div>
    </PageShell>
  )
}

