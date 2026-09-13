import type { RealmId } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RealmBadge({
  realmId,
  realmName,
  realmHan,
  layer,
}: {
  realmId: RealmId;
  realmName: string;
  realmHan: string;
  layer: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
        realmId === "kim_dan" || realmId === "nguyen_anh"
          ? "border-gold/40 text-gold"
          : "border-primary/40 text-primary",
      )}
    >
      <span className="font-display text-sm">{realmHan}</span>
      {realmName} · tầng {layer}
    </span>
  );
}
