import { cn } from "@/lib/utils";

/**
 * The signature yellow chip (4px radius, wide all-caps). Yellow background
 * swaps to blue in dark (G15); the label stays readable in both modes.
 * Precious — roughly one per screen.
 */
export function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("tangle-chip", className)}>{children}</span>;
}
