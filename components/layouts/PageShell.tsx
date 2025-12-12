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
    <div className={cn(subdued ? "bg-bg-strip" : "bg-white", "w-full")}>
      <div className={cn("mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:py-10", className)}>
        {(title || description || actions) && (
          <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3">
              {title && <h1 className="page-title">{title}</h1>}
              {description && <p className="max-w-2xl text-lg text-secondary leading-relaxed">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
          </header>
        )}
        <div className="space-y-8">{children}</div>
      </div>
    </div>
  )
}

