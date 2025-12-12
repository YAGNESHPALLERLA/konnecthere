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
        "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800 transition-colors duration-150",
        className
      )}
    >
      {children}
    </span>
  )
}






