import { ButtonHTMLAttributes, ReactElement, cloneElement, forwardRef, isValidElement } from "react"
import { cn } from "@/lib/utils"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline"
  size?: "sm" | "default" | "lg"
  fullWidth?: boolean
  asChild?: boolean
}

const baseStyles =
  "btn-elevate inline-flex items-center justify-center rounded-full font-semibold tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
const variantMap = {
  default: "bg-primary text-white shadow-sm hover:bg-primary-hover hover:shadow-md",
  ghost: "border-transparent text-foreground-primary hover:bg-muted hover:text-foreground-primary",
  outline: "border border-border bg-white text-foreground-primary hover:bg-background-primary hover:border-border-hover",
}
const sizeMap = {
  sm: "px-3 py-1.5 text-xs h-8",
  default: "px-4 py-2 text-sm h-10",
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

