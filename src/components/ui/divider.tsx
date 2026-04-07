import { cn } from "@/lib/utils";

interface DividerProps {
  size?: "default" | "lg";
  className?: string;
}

export function Divider({ size = "default", className }: DividerProps) {
  return (
    <div
      className={cn(
        "h-px bg-foreground/20",
        size === "lg" ? "w-24" : "w-16",
        className
      )}
    />
  );
}
