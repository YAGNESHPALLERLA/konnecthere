"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export function UserFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [role, setRole] = useState(searchParams.get("role") || "ALL")
  const [status, setStatus] = useState(searchParams.get("status") || "ALL")
  const [location, setLocation] = useState(searchParams.get("location") || "")

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (role !== "ALL") params.set("role", role)
    if (status !== "ALL") params.set("status", status)
    if (location) params.set("location", location)
    router.push(`/admin/users?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch("")
    setRole("ALL")
    setStatus("ALL")
    setLocation("")
    router.push("/admin/users")
  }

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          label="Search"
          placeholder="Name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") applyFilters()
          }}
        />
        <label className="text-sm font-medium text-black">
          Role
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">USER</option>
            <option value="HR">HR</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MODERATOR">MODERATOR</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
        </label>
        <label className="text-sm font-medium text-black">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </label>
        <Input
          label="Location"
          placeholder="City or region..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") applyFilters()
          }}
        />
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={applyFilters}>Apply Filters</Button>
        <Button variant="outline" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </Card>
  )
}

