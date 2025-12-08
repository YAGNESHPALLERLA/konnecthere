import { PageShell } from "@/components/layouts/PageShell"

export default function AboutPage() {
  return (
    <PageShell title="About KonnectHere" description="Learn about our mission and values">
      <div className="prose max-w-none">
        <h2>Our Mission</h2>
        <p>
          KonnectHere is a modern job platform built for ambitious talent and forward-thinking companies.
          We believe in connecting the right people with the right opportunities.
        </p>

        <h2>What We Do</h2>
        <p>
          We provide a streamlined platform where candidates can discover meaningful career opportunities
          and employers can find exceptional talent. Our focus is on quality over quantity, ensuring
          every connection matters.
        </p>

        <h2>Our Values</h2>
        <ul>
          <li><strong>Transparency:</strong> Clear communication and honest interactions</li>
          <li><strong>Quality:</strong> Curated opportunities and vetted candidates</li>
          <li><strong>Innovation:</strong> Leveraging technology to improve the hiring experience</li>
          <li><strong>Respect:</strong> Treating everyone with dignity and professionalism</li>
        </ul>
      </div>
    </PageShell>
  )
}

