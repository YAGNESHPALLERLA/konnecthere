import { ReactNode } from "react"
import { cn } from "@/lib/utils"

type SimpleTableProps = {
  children: ReactNode
  className?: string
}

export function SimpleTable({ children, className }: SimpleTableProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-black/10 bg-white text-sm text-black", className)}>
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  )
}

SimpleTable.Head = function TableHead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <thead className={cn("bg-[#F5F5F5] text-left text-[11px] font-semibold uppercase tracking-[0.08em]", className)}>
      {children}
    </thead>
  )
}

SimpleTable.Body = function TableBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tbody className={cn("", className)}>
      {children}
    </tbody>
  )
}

SimpleTable.Row = function TableRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn("border-t border-black/5 transition-colors hover:bg-[#F5F5F5]", className)}>
      {children}
    </tr>
  )
}

SimpleTable.Header = function TableHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={cn("px-4 py-3", className)}>
      {children}
    </th>
  )
}

SimpleTable.Cell = function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn("px-4 py-3 align-middle", className)}>
      {children}
    </td>
  )
}




