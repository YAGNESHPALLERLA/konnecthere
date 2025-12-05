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
    <div className={cn(subdued ? "bg-[#F5F5F5]" : "bg-white", "w-full")}>
      <div className={cn("mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 sm:px-8 lg:px-10", className)}>
        {(title || description || actions) && (
          <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              {title && <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>}
              {description && <p className="mt-2 max-w-2xl text-base text-black/70">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
          </header>
        )}
        <div className="space-y-8">{children}</div>
      </div>
    </div>
  )
}

