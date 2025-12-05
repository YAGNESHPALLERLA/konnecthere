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
          "w-full rounded-lg border border-black/15 bg-white px-4 py-2 text-sm text-black placeholder:text-black/40 transition-colors focus:border-black focus:outline-none focus:ring-2 focus:ring-black/40",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
    )

    return (
      <label className="flex w-full flex-col gap-2 text-sm font-medium text-black">
        {label && <span>{label}</span>}
        {inputElement}
        {(helperText || error) && (
          <span className={cn("text-xs text-black/50", error && "text-red-600")}>
            {error ?? helperText}
          </span>
        )}
      </label>
    )
  }
)

Input.displayName = "Input"






