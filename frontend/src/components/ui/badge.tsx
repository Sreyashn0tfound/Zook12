import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variantStyles: Record<string, string> = {
  default: "border-transparent bg-primary text-primary-foreground shadow",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  outline: "text-foreground",
};

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: string;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles[variant] ?? variantStyles.default,
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
