import { ReactNode } from "react"
import { cn } from "@/lib/utils"

type BadgeProps = {
  children: ReactNode
  variant?: "default" | "success" | "warning" | "error" | "info"
  className?: string
}

const variantStyles = {
  default: "bg-muted text-foreground border-border",
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  error: "bg-red-50 text-red-700 border-red-200",
  info: "bg-primary-50 text-primary-700 border-primary-200",
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors duration-200",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

