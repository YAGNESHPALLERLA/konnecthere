import { ReactNode } from "react"
import { cn } from "@/lib/utils"

type PageShellProps = {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  subdued?: boolean
}

export function PageShell({ title, description, actions, children, className, subdued }: PageShellProps) {
  return (
    <div className={cn(subdued ? "bg-muted/30" : "bg-white", "w-full")}>
      <div className={cn("mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-16 sm:px-8 lg:px-10", className)}>
        {(title || description || actions) && (
          <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3">
              {title && <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h1>}
              {description && <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
          </header>
        )}
        <div className="space-y-8">{children}</div>
      </div>
    </div>
  )
}

