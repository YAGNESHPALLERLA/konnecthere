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
          "w-full rounded-lg border border-subtle bg-white px-4 py-2.5 text-sm text-primary placeholder:text-muted transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 hover:border-hover",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/40",
          className
        )}
        {...props}
      />
    )

    return (
      <label className="flex w-full flex-col gap-2 text-sm font-medium text-primary">
        {label && <span>{label}</span>}
        {inputElement}
        {(helperText || error) && (
          <span className={cn("text-xs text-muted", error && "text-red-600")}>
            {error ?? helperText}
          </span>
        )}
      </label>
    )
  }
)

Input.displayName = "Input"






