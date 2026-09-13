import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-[12px] border border-border bg-bg-elevated px-3 py-2 text-sm text-fg outline-none placeholder:text-subtle focus:border-primary",
        className,
      )}
      {...props}
    />
  );
}
