import { ReactNode } from "react"
import { cn } from "@/lib/utils"

type PillProps = {
  children: ReactNode
  className?: string
}

export function Pill({ children, className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground transition-colors duration-200",
        className
      )}
    >
      {children}
    </span>
  )
}






