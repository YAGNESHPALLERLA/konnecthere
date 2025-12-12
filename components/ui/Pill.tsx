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
        "inline-flex items-center rounded-full bg-accent-light px-2.5 py-1 text-xs font-medium text-primary transition-colors duration-150",
        className
      )}
    >
      {children}
    </span>
  )
}






