import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-28 w-full rounded-[12px] border border-border bg-bg-elevated px-3 py-2 text-sm text-fg outline-none placeholder:text-subtle focus:border-primary",
          className,
        )}
        {...props}
      />
    );
  },
);
