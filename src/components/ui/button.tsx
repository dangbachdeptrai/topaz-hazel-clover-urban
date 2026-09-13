import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "talisman inline-flex h-11 items-center justify-center gap-2 rounded-[12px] px-4 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border border-primary/30 bg-primary text-primary-fg hover:brightness-110",
        gold: "border border-gold/40 bg-gold text-primary-fg hover:brightness-110",
        outline: "border border-border bg-transparent text-fg hover:bg-surface",
        paper: "border border-border bg-bg-elevated text-fg hover:bg-surface",
        ghost: "text-muted hover:bg-surface hover:text-fg",
      },
      size: {
        default: "h-11 px-4",
        lg: "h-12 px-5 text-base",
        sm: "h-9 px-3 text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
