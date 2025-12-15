"use client"

import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  variant?: "horizontal" | "icon"
  className?: string
  href?: string
  width?: number
  height?: number
}

export function Logo({ 
  variant = "horizontal", 
  className = "",
  href = "/",
  width,
  height
}: LogoProps) {
  const logoContent = variant === "horizontal" ? (
    <Image
      src="/logo.png"
      alt="KonnectHere"
      width={width || 240}
      height={height || 64}
      className={className}
      priority
    />
  ) : (
    <Image
      src="/favicon.png"
      alt="KonnectHere"
      width={width || 48}
      height={height || 48}
      className={className}
      priority
    />
  )

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}

