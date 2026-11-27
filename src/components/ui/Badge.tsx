import React from "react"
import { cn } from "../../utils/cn"

export type BadgeVariant = 
  | "default" 
  | "todo" 
  | "progress" 
  | "done" 
  | "critical" 
  | "high" 
  | "medium" 
  | "skill" 
  | "expert"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({ 
  children, 
  variant = "default", 
  dot = false, 
  className, 
  ...props 
}: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "todo":
        return {
          container: "bg-[#42C5E8]/10 text-[#42C5E8] border-[#42C5E8]/30",
          dotColor: "bg-[#42C5E8]"
        };
      case "progress":
        return {
          container: "bg-amber-400/10 text-amber-300 border-amber-400/30",
          dotColor: "bg-amber-400"
        };
      case "done":
        return {
          container: "bg-[#75D69A]/10 text-[#75D69A] border-[#75D69A]/30",
          dotColor: "bg-[#75D69A]"
        };
      case "critical":
        return {
          container: "bg-rose-500/15 text-rose-400 border-rose-500/30 font-semibold",
          dotColor: "bg-rose-500"
        };
      case "high":
        return {
          container: "bg-amber-500/15 text-amber-400 border-amber-500/30 font-semibold",
          dotColor: "bg-amber-500"
        };
      case "medium":
        return {
          container: "bg-[#8B7CFF]/15 text-[#8B7CFF] border-[#8B7CFF]/30",
          dotColor: "bg-[#8B7CFF]"
        };
      case "skill":
        return {
          container: "bg-[#26292E] text-[#A1A1AA] border-[#34383D] hover:text-[#F4F4F5] hover:border-[#4a5057]",
          dotColor: null
        };
      case "expert":
        return {
          container: "bg-[#8B7CFF]/10 text-[#8B7CFF] border-[#8B7CFF]/40 font-medium",
          dotColor: "bg-[#8B7CFF]"
        };
      default:
        return {
          container: "bg-[#202327] text-[#A1A1AA] border-[#34383D]",
          dotColor: null
        };
    }
  };

  const { container, dotColor } = getVariantStyles();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border tracking-wide transition-colors select-none",
        container,
        className
      )}
      {...props}
    >
      {dot && dotColor && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
      )}
      {children}
    </span>
  );
}
