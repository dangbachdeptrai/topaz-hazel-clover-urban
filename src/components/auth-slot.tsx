import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SpiritAvatar } from "@/components/features/spirit-avatar";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyCultivation } from "@/lib/server/cultivation";
import type { CultivationProfile } from "@/lib/types";

export function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  const [signingOut, setSigningOut] = useState(false);
  const [cultivation, setCultivation] = useState<CultivationProfile | null>(null);

  useEffect(() => {
    if (!user) {
      setCultivation(null);
      return;
    }
    getMyCultivation({ data: { displayName: user.displayName ?? undefined } })
      .then(setCultivation)
      .catch(() => setCultivation(null));
  }, [user]);

  if (isPending) {
    return <div className="h-11 w-24 animate-pulse rounded-[12px] bg-surface" />;
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className="talisman inline-flex h-11 items-center rounded-[12px] border border-primary/30 bg-primary px-4 text-sm font-medium text-primary-fg"
      >
        Nhập môn
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/profile"
        className="flex h-11 items-center gap-2 rounded-[12px] border border-border bg-bg-elevated px-2.5 pr-3"
      >
        <SpiritAvatar
          name={user.displayName ?? user.primaryEmail ?? "Đạo hữu"}
          frame={cultivation?.equippedFrame}
          size="sm"
        />
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-28 truncate text-sm font-medium leading-tight">
            {cultivation?.daoTitle || user.displayName || "Đạo hữu"}
          </span>
          {cultivation ? (
            <span className="block text-[10px] tabular-nums text-gold">
              {cultivation.realmName} · {cultivation.elo} Elo
            </span>
          ) : null}
        </span>
      </Link>
      <button
        type="button"
        disabled={signingOut}
        onClick={() => {
          setSigningOut(true);
          void signOut("/").catch(() => setSigningOut(false));
        }}
        className="hidden h-11 rounded-[12px] px-3 text-sm text-muted hover:bg-surface sm:inline"
      >
        {signingOut ? "Đang xuất…" : "Xuất quan"}
      </button>
    </div>
  );
}
