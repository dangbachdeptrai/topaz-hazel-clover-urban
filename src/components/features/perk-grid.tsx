import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { listMyPerks, togglePerk, unlockPerk } from "@/lib/server/cultivation";
import { MAX_EQUIPPED_PERKS, realmMeets } from "@/lib/realms";
import type { CultivationProfile, Perk } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PerkGrid({
  perks,
  profile,
  onChange,
}: {
  perks: Perk[];
  profile: CultivationProfile;
  onChange: () => void;
}) {
  async function act(p: Perk) {
    try {
      if (!p.unlocked) {
        await unlockPerk({ data: p.id });
        toast.success(`Lĩnh ngộ ${p.name}`);
      } else {
        await togglePerk({ data: p.id });
      }
      onChange();
      void listMyPerks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không xong");
    }
  }

  return (
    <div>
      <h3 className="font-display text-xl font-semibold">Công Pháp</h3>
      <p className="mt-1 text-sm text-muted">
        Trang bị tối đa {MAX_EQUIPPED_PERKS} quyết. Băng Tâm được ban khi nhập môn.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {perks.map((p) => {
          const lockedRealm = !realmMeets(profile.realmId, p.minRealm);
          return (
            <article
              key={p.id}
              className={cn(
                "jade-frame rounded-[20px] p-4",
                p.equipped && "ring-1 ring-gold/50",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-gold">{p.han}</p>
                  <h4 className="font-display text-lg font-semibold">{p.name}</h4>
                </div>
                {p.equipped ? (
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] text-gold">
                    Đang trang bị
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-muted">{p.blurb}</p>
              <Button
                size="sm"
                variant={p.equipped ? "outline" : p.unlocked ? "default" : "gold"}
                className="mt-3"
                disabled={lockedRealm && !p.unlocked}
                onClick={() => void act(p)}
              >
                {lockedRealm && !p.unlocked
                  ? "Cần cảnh giới cao hơn"
                  : !p.unlocked
                    ? `Lĩnh ngộ · ${p.cost} Linh Thạch`
                    : p.equipped
                      ? "Gỡ ra"
                      : "Trang bị"}
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
