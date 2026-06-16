import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-DEFAULT text-[14.5px] font-semibold tracking-body transition-all duration-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-[0.5px] active:scale-[0.99]",
  {
    variants: {
      variant: {
        // Primary fill is the FILL-only blue (stays blue in both modes), white text
        primary: "bg-tg-blue text-white hover:brightness-110",
        dark: "bg-tg-inv text-tg-inv-text hover:opacity-90",
        outline:
          "border-[1.5px] border-tg-ink bg-transparent text-tg-ink hover:bg-tg-ink-05",
        // Outline that uses the swapping accent (blue in light, yellow in dark)
        outlineAccent:
          "border-[1.5px] border-tg-blue-accent bg-transparent text-tg-blue-accent hover:bg-tg-ink-05",
        ghost: "bg-tg-stone2 text-tg-ink hover:bg-tg-ink-08",
        quiet: "bg-transparent text-tg-brown hover:text-tg-ink",
        destructive:
          "bg-destructive text-destructive-foreground hover:brightness-110",
      },
      size: {
        sm: "px-3.5 py-2 text-[13px]",
        md: "px-[18px] py-[11px]",
        lg: "px-[22px] py-3.5 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Stretch to fill the container width. */
  full?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, full = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), full && "w-full")}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
