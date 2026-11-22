import * as React from "react"
import { cn } from "../../utils/cn"
import { motion } from "framer-motion"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, indicatorClassName, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-muted",
          className
        )}
        {...props}
      >
        <motion.div
          className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
          initial={{ x: "-100%" }}
          animate={{ x: `-${100 - (value || 0)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
