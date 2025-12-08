import { PageShell } from "@/components/layouts/PageShell"

export default function StatusPage() {
  return (
    <PageShell title="System Status" description="Current system status and uptime">
      <div className="prose max-w-none">
        <h2>System Status</h2>
        <p>
          All systems are operational. KonnectHere is running normally.
        </p>

        <h2>Service Status</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div>
              <strong>Website</strong> - Operational
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div>
              <strong>API</strong> - Operational
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div>
              <strong>Database</strong> - Operational
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div>
              <strong>Authentication</strong> - Operational
            </div>
          </div>
        </div>

        <h2>Recent Updates</h2>
        <p>No recent incidents or maintenance windows.</p>

        <h2>Monitoring</h2>
        <p>
          We continuously monitor our systems to ensure optimal performance and availability.
          If you experience any issues, please{" "}
          <a href="/contact">contact our support team</a>.
        </p>
      </div>
    </PageShell>
  )
}

