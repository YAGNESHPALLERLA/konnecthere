import { ReactNode } from "react"
import { cn } from "@/lib/utils"

type CardProps = {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function Card({ title, subtitle, actions, children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-black/10 bg-white p-6 text-black shadow-none",
        className
      )}
    >
      {(title || subtitle || actions) && (
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-xl font-semibold tracking-tight">{title}</h3>}
            {subtitle && <p className="text-sm text-black/60">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  )
}






