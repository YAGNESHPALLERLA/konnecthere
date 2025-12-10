import { ReactNode } from "react"
import { cn } from "@/lib/utils"

type SimpleTableProps = {
  children: ReactNode
  className?: string
}

export function SimpleTable({ children, className }: SimpleTableProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-white text-sm shadow-sm", className)}>
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  )
}

SimpleTable.Head = function TableHead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <thead className={cn("bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground", className)}>
      {children}
    </thead>
  )
}

SimpleTable.Body = function TableBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tbody className={cn("divide-y divide-border", className)}>
      {children}
    </tbody>
  )
}

SimpleTable.Row = function TableRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn("border-t border-border transition-colors duration-150 hover:bg-muted/50", className)}>
      {children}
    </tr>
  )
}

SimpleTable.Header = function TableHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={cn("px-6 py-4 text-left", className)}>
      {children}
    </th>
  )
}

SimpleTable.Cell = function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn("px-6 py-4 align-middle text-foreground", className)}>
      {children}
    </td>
  )
}




