import { PageShell } from "@/components/layouts/PageShell"

export default function SecurityPage() {
  return (
    <PageShell title="Security" description="How we keep your data secure">
      <div className="prose max-w-none">
        <h2>Security Practices</h2>
        <p>
          At KonnectHere, we take security seriously. We implement industry-standard practices
          to protect your data and ensure a safe experience.
        </p>

        <h2>Data Encryption</h2>
        <p>
          All data transmitted between your browser and our servers is encrypted using TLS/SSL.
          Your passwords are hashed using bcrypt and never stored in plain text.
        </p>

        <h2>Authentication</h2>
        <p>
          We use secure authentication methods including:
        </p>
        <ul>
          <li>Password-based authentication with strong hashing</li>
          <li>OAuth integration with trusted providers (Google, LinkedIn)</li>
          <li>Session management with secure cookies</li>
        </ul>

        <h2>Access Controls</h2>
        <p>
          We implement role-based access control to ensure users can only access data
          they're authorized to view. Your personal information is only visible to you
          and authorized parties (e.g., employers for job applications).
        </p>

        <h2>Regular Security Audits</h2>
        <p>
          We regularly review and update our security practices to address emerging threats
          and maintain compliance with industry standards.
        </p>

        <h2>Reporting Security Issues</h2>
        <p>
          If you discover a security vulnerability, please report it to{" "}
          <a href="mailto:security@konnecthere.com">security@konnecthere.com</a>.
          We appreciate responsible disclosure and will work to address issues promptly.
        </p>

        <h2>Your Responsibility</h2>
        <p>
          While we work to keep your data secure, you also play a role:
        </p>
        <ul>
          <li>Use a strong, unique password</li>
          <li>Don't share your account credentials</li>
          <li>Log out when using shared devices</li>
          <li>Report suspicious activity immediately</li>
        </ul>
      </div>
    </PageShell>
  )
}

