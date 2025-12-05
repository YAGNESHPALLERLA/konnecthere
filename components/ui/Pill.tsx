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
        "inline-flex items-center rounded-full border border-black/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-black",
        className
      )}
    >
      {children}
    </span>
  )
}






