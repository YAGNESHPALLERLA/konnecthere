import { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type TableColumn<T> = {
  key: keyof T
  header: string
  align?: "left" | "center" | "right"
  render?: (value: T[keyof T], row: T) => ReactNode
}

type TableProps<T> = {
  columns: TableColumn<T>[]
  data: T[]
  className?: string
  emptyState?: ReactNode
}

export function Table<T>({ columns, data, className, emptyState }: TableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <div className="rounded-lg border border-black/10 bg-white p-6 text-sm text-black/60">{emptyState}</div>
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-black/10 bg-white text-sm text-black", className)}>
      <table className="w-full border-collapse">
        <thead className="bg-[#F5F5F5] text-left text-[11px] font-semibold uppercase tracking-[0.08em]">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn("px-4 py-3", {
                  "text-right": column.align === "right",
                  "text-center": column.align === "center",
                })}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-black/5 transition-colors hover:bg-[#F5F5F5]">
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={cn("px-4 py-3 align-middle", {
                    "text-right": column.align === "right",
                    "text-center": column.align === "center",
                  })}
                >
                  {column.render ? column.render(row[column.key], row) : (row[column.key] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
