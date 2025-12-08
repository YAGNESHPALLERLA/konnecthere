import { TextareaHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-black/15 bg-white px-4 py-2 text-sm text-black placeholder:text-black/40 transition-colors focus:border-black focus:outline-none focus:ring-2 focus:ring-black/40",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"

