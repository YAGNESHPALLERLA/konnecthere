import { PageShell } from "@/components/layouts/PageShell"

export default function TermsPage() {
  return (
    <PageShell title="Terms of Service" description="Terms and conditions for using KonnectHere">
      <div className="prose max-w-none">
        <h2>Terms of Service</h2>
        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <h2>Acceptance of Terms</h2>
        <p>
          By accessing and using KonnectHere, you accept and agree to be bound by the terms
          and provision of this agreement.
        </p>

        <h2>Use License</h2>
        <p>
          Permission is granted to temporarily use KonnectHere for personal, non-commercial
          transitory viewing only. This is the grant of a license, not a transfer of title.
        </p>

        <h2>User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account and password.
          You agree to accept responsibility for all activities that occur under your account.
        </p>

        <h2>Prohibited Uses</h2>
        <p>You may not use our service:</p>
        <ul>
          <li>For any unlawful purpose</li>
          <li>To harass, abuse, or harm others</li>
          <li>To submit false or misleading information</li>
          <li>To interfere with or disrupt the service</li>
        </ul>

        <h2>Job Listings and Applications</h2>
        <p>
          Employers are responsible for the accuracy of job listings. Candidates are responsible
          for the accuracy of their applications and profile information.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          KonnectHere shall not be liable for any indirect, incidental, special, consequential,
          or punitive damages resulting from your use of the service.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Your continued use of the
          service constitutes acceptance of any changes.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about these Terms, please contact us at{" "}
          <a href="mailto:legal@konnecthere.com">legal@konnecthere.com</a>.
        </p>
      </div>
    </PageShell>
  )
}

