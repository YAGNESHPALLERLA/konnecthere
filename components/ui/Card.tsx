import { ReactNode } from "react"
import { cn } from "@/lib/utils"

type CardProps = {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Card({ title, subtitle, actions, children, className, style }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-white p-6 text-foreground shadow-sm transition-shadow duration-200 hover:shadow-md",
        className
      )}
      style={style}
    >
      {(title || subtitle || actions) && (
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  )
}






