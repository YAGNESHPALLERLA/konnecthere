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
          "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground-primary placeholder:text-foreground-secondary/60 transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-border-hover",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/40",
          className
        )}
        {...props}
      />
    )

    return (
      <label className="flex w-full flex-col gap-2 text-sm font-medium text-foreground-primary">
        {label && <span>{label}</span>}
        {inputElement}
        {(helperText || error) && (
          <span className={cn("text-xs text-foreground-secondary", error && "text-error")}>
            {error ?? helperText}
          </span>
        )}
      </label>
    )
  }
)

Input.displayName = "Input"






