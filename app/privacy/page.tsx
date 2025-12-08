import { PageShell } from "@/components/layouts/PageShell"

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy" description="How we protect your data">
      <div className="prose max-w-none">
        <h2>Privacy Policy</h2>
        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <h2>Information We Collect</h2>
        <p>
          We collect information that you provide directly to us, including:
        </p>
        <ul>
          <li>Account information (name, email, password)</li>
          <li>Profile information (resume, skills, work experience)</li>
          <li>Application data (cover letters, job applications)</li>
          <li>Communication data (messages between users)</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide and improve our services</li>
          <li>Match candidates with job opportunities</li>
          <li>Facilitate communication between users</li>
          <li>Send important updates and notifications</li>
        </ul>

        <h2>Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your
          personal information against unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Opt out of certain communications</li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:privacy@konnecthere.com">privacy@konnecthere.com</a>.
        </p>
      </div>
    </PageShell>
  )
}

