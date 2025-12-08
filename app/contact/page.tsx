import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"

export default function ContactPage() {
  return (
    <PageShell title="Contact Us" description="Get in touch with our team">
      <div className="prose max-w-none">
        <h2>Get in Touch</h2>
        <p>
          Have a question or need help? We're here to assist you.
        </p>

        <h2>General Inquiries</h2>
        <p>
          Email: <a href="mailto:hello@konnecthere.com">hello@konnecthere.com</a>
        </p>

        <h2>Support</h2>
        <p>
          For technical support or account issues, please contact{" "}
          <a href="mailto:support@konnecthere.com">support@konnecthere.com</a>.
        </p>

        <h2>Business Inquiries</h2>
        <p>
          For partnership or business opportunities, reach out to{" "}
          <a href="mailto:business@konnecthere.com">business@konnecthere.com</a>.
        </p>

        <h2>Response Time</h2>
        <p>
          We aim to respond to all inquiries within 24-48 hours during business days.
        </p>

        <div className="mt-8">
          <a href="mailto:hello@konnecthere.com">
            <Button>Send Us an Email</Button>
          </a>
        </div>
      </div>
    </PageShell>
  )
}

