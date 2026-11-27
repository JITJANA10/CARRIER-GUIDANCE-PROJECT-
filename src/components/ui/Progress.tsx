import * as React from "react"
import { cn } from "../../utils/cn"
import { motion } from "framer-motion"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, indicatorClassName, ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value || 0))
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-1.5 w-full overflow-hidden rounded-full bg-[#17191C] border border-[#34383D]/50",
          className
        )}
        {...props}
      >
        <motion.div
          className={cn("h-full bg-[#75D69A] rounded-full transition-all", indicatorClassName)}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

// Segmented Progress Bar as shown in the reference image (blocks of filled vs empty progress)
interface SegmentedProgressProps {
  totalSegments?: number;
  completedSegments?: number;
  className?: string;
}

export function SegmentedProgress({
  totalSegments = 8,
  completedSegments = 4,
  className
}: SegmentedProgressProps) {
  return (
    <div className={cn("flex items-center gap-1.5 w-full", className)}>
      {Array.from({ length: totalSegments }).map((_, i) => {
        const isCompleted = i < completedSegments;
        return (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              isCompleted
                ? "bg-[#75D69A] shadow-[0_0_8px_rgba(117,214,154,0.3)]"
                : "bg-[#26292E] border border-[#34383D]"
            )}
          />
        );
      })}
    </div>
  );
}

export { Progress }
