import { ButtonHTMLAttributes, ReactElement, cloneElement, forwardRef, isValidElement } from "react"
import { cn } from "@/lib/utils"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline"
  size?: "sm" | "default" | "lg"
  fullWidth?: boolean
  asChild?: boolean
}

const baseStyles =
  "inline-flex items-center justify-center rounded-lg font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
const variantMap = {
  default: "bg-primary text-primary-foreground border border-primary hover:bg-primary-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
  ghost: "border-transparent text-foreground hover:bg-muted hover:text-foreground",
  outline: "border-border bg-background text-foreground hover:bg-muted hover:border-primary/50",
}
const sizeMap = {
  sm: "px-3 py-1.5 text-xs h-8",
  default: "px-5 py-2.5 text-sm h-10",
  lg: "px-6 py-3 text-base h-12",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", fullWidth, asChild, children, ...props }, ref) => {
    const classes = cn(
      baseStyles,
      variantMap[variant],
      sizeMap[size],
      fullWidth && "w-full",
      className
    )

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>
      return cloneElement(child, {
        className: cn(child.props.className, classes),
      })
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

