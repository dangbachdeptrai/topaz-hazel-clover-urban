import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-[12px] border border-border bg-bg-elevated px-3 text-sm text-fg outline-none placeholder:text-subtle focus:border-primary",
        className,
      )}
      {...props}
    />
  );
}
