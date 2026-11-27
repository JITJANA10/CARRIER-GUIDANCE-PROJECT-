import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8B7CFF] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#8B7CFF] text-white shadow-sm hover:bg-[#7a6be6] active:scale-[0.98]",
        destructive:
          "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25",
        outline:
          "border border-[#34383D] bg-[#202327] text-[#F4F4F5] hover:bg-[#26292E] hover:border-[#4e535a] active:scale-[0.98]",
        secondary:
          "bg-[#26292E] text-[#F4F4F5] border border-[#34383D] hover:bg-[#34383D] active:scale-[0.98]",
        ghost:
          "text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#26292E]",
        link:
          "text-[#8B7CFF] underline-offset-4 hover:underline p-0 h-auto",
        success:
          "bg-[#75D69A]/15 text-[#75D69A] border border-[#75D69A]/30 hover:bg-[#75D69A]/25",
        accent:
          "bg-[#42C5E8]/15 text-[#42C5E8] border border-[#42C5E8]/30 hover:bg-[#42C5E8]/25",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        xs: "h-6 rounded px-2 text-[11px]",
        sm: "h-7 rounded-md px-2.5 text-xs",
        lg: "h-10 rounded-lg px-5 text-sm",
        icon: "h-8 w-8 p-0",
        iconSm: "h-7 w-7 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
