"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

interface ProfilePictureUploadProps {
  currentImage?: string | null
  userName?: string | null
  size?: "sm" | "md" | "lg"
  showEditButton?: boolean
  onUpdate?: () => void
  className?: string
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-24 w-24",
}

const editButtonSizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
}

export function ProfilePictureUpload({
  currentImage,
  userName,
  size = "md",
  showEditButton = true,
  onUpdate,
  className,
}: ProfilePictureUploadProps) {
  const { data: session, update: updateSession } = useSession()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPG, PNG, GIF, etc.)")
      return
    }

    // Validate file size (max 5MB for profile pictures)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB")
      return
    }

    setUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/profile/upload-picture", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Upload failed" }))
        throw new Error(error.error || "Failed to upload image")
      }

      const data = await res.json()

      // Update session to reflect new image
      await updateSession()

      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate()
      }

      // Reload page to show updated image everywhere
      window.location.reload()
    } catch (error: any) {
      console.error("Error uploading profile picture:", error)
      alert(error.message || "Failed to upload profile picture")
      setPreview(currentImage || null) // Revert preview on error
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const getInitials = () => {
    if (userName) {
      return userName.charAt(0).toUpperCase()
    }
    if (session?.user?.name) {
      return session.user.name.charAt(0).toUpperCase()
    }
    if (session?.user?.email) {
      return session.user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <div className="relative group">
        {/* Profile Picture */}
        {preview ? (
          <img
            src={preview}
            alt={userName || "Profile"}
            className={cn(
              "rounded-full object-cover border-2 border-border transition-opacity duration-200",
              sizeClasses[size],
              uploading && "opacity-50"
            )}
          />
        ) : (
          <div
            className={cn(
              "rounded-full bg-primary flex items-center justify-center border-2 border-border transition-opacity duration-200",
              sizeClasses[size],
              uploading && "opacity-50"
            )}
          >
            <span
              className={cn(
                "font-semibold text-primary-foreground",
                size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-xl"
              )}
            >
              {getInitials()}
            </span>
          </div>
        )}

        {/* Edit Button Overlay */}
        {showEditButton && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground border-2 border-white shadow-md hover:bg-primary-700 transition-all duration-200 flex items-center justify-center",
              size === "sm"
                ? "h-5 w-5"
                : size === "md"
                ? "h-6 w-6"
                : "h-8 w-8",
              uploading && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Upload profile picture"
          >
            {uploading ? (
              <svg
                className={cn("animate-spin", editButtonSizes[size])}
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className={editButtonSizes[size]}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload profile picture"
      />
    </div>
  )
}

