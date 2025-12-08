import { PageShell } from "@/components/layouts/PageShell"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function SupportPage() {
  return (
    <PageShell title="Support" description="Get help and find answers">
      <div className="prose max-w-none">
        <h2>Frequently Asked Questions</h2>

        <h3>How do I create an account?</h3>
        <p>
          Click the "Sign Up" button in the navigation bar and follow the prompts to create
          your account. You can sign up as a candidate or employer.
        </p>

        <h3>How do I apply for a job?</h3>
        <p>
          Browse available jobs, click on a job that interests you, and click the "Apply" button.
          You'll need to upload a resume and optionally include a cover letter.
        </p>

        <h3>How do I post a job?</h3>
        <p>
          Employers can post jobs by navigating to the employer dashboard and clicking
          "Post New Job". You'll need to create a company profile first if you haven't already.
        </p>

        <h3>How does messaging work?</h3>
        <p>
          Once you've applied to a job or received an application, you can message the other
          party through the Messages section. This allows for direct communication about
          opportunities.
        </p>

        <h2>Still Need Help?</h2>
        <p>
          If you can't find the answer you're looking for, please{" "}
          <Link href="/contact">contact our support team</Link>.
        </p>

        <div className="mt-8 flex gap-4">
          <Link href="/contact">
            <Button>Contact Support</Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </div>
    </PageShell>
  )
}

