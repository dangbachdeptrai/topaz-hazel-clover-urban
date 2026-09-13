import { SpiritAvatar } from "@/components/features/spirit-avatar";
import type { BrPlayer } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SurvivalRoster({ players, meId }: { players: BrPlayer[]; meId?: string }) {
  const alive = players.filter((p) => p.isAlive).length;
  return (
    <aside className="jade-frame rounded-[20px] p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Còn lại</p>
        <p className="font-mono text-sm tabular-nums text-primary">
          {alive}/{players.length}
        </p>
      </div>
      <ul className="mt-3 space-y-1.5">
        {players.map((p) => (
          <li
            key={p.userId}
            className={cn(
              "flex items-center gap-2 rounded-[12px] px-2 py-1.5",
              p.isAlive ? "bg-bg/50" : "opacity-45",
              p.userId === meId && "ring-1 ring-primary/40",
            )}
          >
            <SpiritAvatar name={p.displayName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                {p.displayName}
                {p.isBot ? <span className="ml-1 text-[10px] text-subtle">hóa thân</span> : null}
              </p>
              <p className="text-[10px] text-muted">
                {p.isAlive
                  ? p.hasAnswered
                    ? "Đã khóa"
                    : "Đang nghĩ"
                  : p.placement
                    ? `Hạng ${p.placement}`
                    : "Đã rơi"}
              </p>
            </div>
            {p.isAlive ? <span className="size-1.5 rounded-full bg-primary" /> : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}
