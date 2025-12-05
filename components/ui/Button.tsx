import { ButtonHTMLAttributes, ReactElement, cloneElement, forwardRef, isValidElement } from "react"
import { cn } from "@/lib/utils"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline"
  size?: "sm" | "default"
  fullWidth?: boolean
  asChild?: boolean
}

const baseStyles =
  "inline-flex items-center justify-center rounded-md border border-black/80 bg-white px-4 py-2 text-sm font-semibold uppercase tracking-tight text-black transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
const variantMap = {
  default: "hover:bg-[#F5F5F5]",
  ghost: "border-transparent hover:bg-[#F5F5F5]",
  outline: "border-black/20 hover:border-black/40 hover:bg-[#F5F5F5]",
}
const sizeMap = {
  sm: "px-3 py-1 text-xs",
  default: "px-4 py-2 text-sm",
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

