"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

type JobAlert = {
  id: string
  name: string
  query: string | null
  filters: any
  frequency: string
  active: boolean
  lastSentAt: string | null
  createdAt: string
}

export default function JobAlertsPage() {
  const { data: session } = useSession()
  const [alerts, setAlerts] = useState<JobAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    query: "",
    frequency: "DAILY" as "DAILY" | "WEEKLY" | "INSTANT",
  })

  useEffect(() => {
    if (session) {
      fetchAlerts()
    }
  }, [session])

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/alerts", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error("Error fetching alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          query: formData.query || undefined,
        }),
      })
      if (res.ok) {
        setShowCreateForm(false)
        setFormData({ name: "", query: "", frequency: "DAILY" })
        fetchAlerts()
      }
    } catch (error) {
      console.error("Error creating alert:", error)
    } finally {
      setCreating(false)
    }
  }

  const handleToggleActive = async (alertId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      })
      if (res.ok) {
        fetchAlerts()
      }
    } catch (error) {
      console.error("Error updating alert:", error)
    }
  }

  const handleDelete = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) return
    try {
      const res = await fetch(`/api/alerts/${alertId}`, { method: "DELETE" })
      if (res.ok) {
        fetchAlerts()
      }
    } catch (error) {
      console.error("Error deleting alert:", error)
    }
  }

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="mb-4 text-lg">Please sign in to manage your job alerts.</p>
        <Link href="/auth/signin" className="text-blue-600 font-semibold hover:underline">
          Go to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Job Alerts</h1>
          <p className="text-gray-600">Get notified when new jobs match your criteria</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showCreateForm ? "Cancel" : "+ Create Alert"}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Job Alert</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Software Engineer in SF"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Query (optional)
              </label>
              <input
                type="text"
                value={formData.query}
                onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., React Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="INSTANT">Instant</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Alert"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-lg text-gray-600 mb-4">You don't have any job alerts yet.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="text-blue-600 font-semibold hover:underline"
          >
            Create your first alert →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{alert.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        alert.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {alert.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {alert.query && (
                    <p className="text-sm text-gray-600 mb-1">
                      Query: <span className="font-medium">{alert.query}</span>
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>Frequency: {alert.frequency}</span>
                    {alert.lastSentAt && (
                      <span>Last sent: {new Date(alert.lastSentAt).toLocaleDateString()}</span>
                    )}
                    <span>Created: {new Date(alert.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(alert.id, alert.active)}
                    className={`px-4 py-2 rounded-lg transition ${
                      alert.active
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {alert.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


