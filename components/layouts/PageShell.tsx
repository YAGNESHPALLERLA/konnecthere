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
    <div className={cn(subdued ? "bg-slate-50" : "bg-white", "w-full")}>
      <div className={cn("mx-auto flex w-full max-w-site flex-col gap-6 px-4 py-6 md:py-8", className)}>
        {(title || description || actions) && (
          <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              {title && <h1 className="page-title">{title}</h1>}
              {description && <p className="max-w-2xl text-base md:text-lg text-slate-600 leading-relaxed">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </header>
        )}
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  )
}

