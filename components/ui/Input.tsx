import { forwardRef, InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, ...props }, ref) => {
    const inputElement = (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 hover:border-slate-400",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/40",
          className
        )}
        {...props}
      />
    )

    return (
      <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-900">
        {label && <span>{label}</span>}
        {inputElement}
        {(helperText || error) && (
          <span className={cn("text-xs text-slate-500", error && "text-red-600")}>
            {error ?? helperText}
          </span>
        )}
      </label>
    )
  }
)

Input.displayName = "Input"






