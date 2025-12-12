"use client"

import { useEffect, useRef, useState, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FadeInSectionProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function FadeInSection({ children, className, delay = 0 }: FadeInSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [delay])

  return (
    <div
      ref={ref}
      className={cn("fade-in-up", isVisible && "visible", className)}
    >
      {children}
    </div>
  )
}

