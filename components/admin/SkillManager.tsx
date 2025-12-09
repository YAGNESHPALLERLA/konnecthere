"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

type SkillManagerProps = {
  type: "skill" | "jobRole" | "industry"
}

export function SkillManager({ type }: SkillManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/${type}s`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ...(type !== "industry" && { category }),
        }),
      })

      if (res.ok) {
        alert(`${type} created successfully`)
        setName("")
        setCategory("")
        setShowForm(false)
        window.location.reload()
      } else {
        const error = await res.json()
        alert(error.error || "Failed to create")
      }
    } catch (error) {
      console.error("Error creating:", error)
      alert("Failed to create")
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} size="sm">
        Add {type === "skill" ? "Skill" : type === "jobRole" ? "Job Role" : "Industry"}
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-48"
      />
      {type !== "industry" && (
        <Input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-48"
        />
      )}
      <Button type="submit" disabled={loading} size="sm">
        {loading ? "Creating..." : "Create"}
      </Button>
      <Button
        type="button"
        onClick={() => {
          setShowForm(false)
          setName("")
          setCategory("")
        }}
        variant="outline"
        size="sm"
      >
        Cancel
      </Button>
    </form>
  )
}

