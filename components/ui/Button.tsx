import { ButtonHTMLAttributes, ReactElement, cloneElement, forwardRef, isValidElement } from "react"
import { cn } from "@/lib/utils"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline"
  size?: "sm" | "default" | "lg"
  fullWidth?: boolean
  asChild?: boolean
}

const baseStyles =
  "inline-flex items-center justify-center rounded-full font-semibold tracking-tight transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.03] hover:shadow-md active:scale-[0.99]"
const variantMap = {
  default: "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:shadow-md",
  ghost: "border-transparent text-slate-900 hover:bg-slate-100 hover:text-slate-900",
  outline: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-400",
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

