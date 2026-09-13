import type { FrameId } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

export function SpiritAvatar({
  name,
  frame,
  size = "md",
}: {
  name: string;
  frame?: FrameId | null;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "spirit-avatar inline-grid place-items-center rounded-full border border-border bg-surface font-display font-semibold text-primary",
        size === "sm" && "size-8 text-xs",
        size === "md" && "size-11 text-sm",
        size === "lg" && "size-16 text-lg",
        frame && `frame-${frame}`,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
