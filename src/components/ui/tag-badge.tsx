import { Badge, type badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

interface TagBadgeProps
  extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  variant?: VariantProps<typeof badgeVariants>["variant"];
}

export function TagBadge({
  variant = "secondary",
  className,
  ...props
}: TagBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={cn("font-mono text-micro font-normal", className)}
      {...props}
    />
  );
}
