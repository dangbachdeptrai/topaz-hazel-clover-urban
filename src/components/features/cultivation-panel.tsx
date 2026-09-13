import { Coins, Flame, Swords, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { RealmBadge } from "@/components/features/realm-badge";
import { SpiritAvatar } from "@/components/features/spirit-avatar";
import { Progress } from "@/components/ui/progress";
import { nextRealm, realmProgress } from "@/lib/realms";
import type { CultivationProfile } from "@/lib/types";

export function CultivationPanel({
  profile,
  compact = false,
}: {
  profile: CultivationProfile;
  compact?: boolean;
}) {
  const bar = realmProgress(profile.exp);
  const nxt = nextRealm(profile.exp);

  if (compact) {
    return (
      <div className="jade-frame flex items-center gap-4 rounded-[20px] p-4">
        <SpiritAvatar name={profile.displayName} frame={profile.equippedFrame} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-display text-lg font-semibold">{profile.displayName}</p>
            <RealmBadge
              realmId={profile.realmId}
              realmName={profile.realmName}
              realmHan={profile.realmHan}
              layer={profile.realmLayer}
            />
          </div>
          <Progress value={bar.pct} className="mt-3 h-1.5" />
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-right text-xs">
          <dt className="text-muted">Elo</dt>
          <dd className="font-mono tabular-nums font-semibold">{profile.elo}</dd>
          <dt className="text-muted">Linh Thạch</dt>
          <dd className="font-mono tabular-nums text-gold">{profile.linhThach}</dd>
        </dl>
      </div>
    );
  }

  return (
    <section className="jade-frame rounded-[28px] p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Đạo Cơ</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-4">
          <SpiritAvatar name={profile.displayName} frame={profile.equippedFrame} size="lg" />
          <div>
            <h2 className="font-display text-3xl font-semibold">{profile.displayName}</h2>
            {profile.daoTitle ? <p className="mt-1 text-sm text-gold">{profile.daoTitle}</p> : null}
            {profile.guildTag ? (
              <Link
                to="/guilds/$guildId"
                params={{ guildId: profile.guildId ?? "" }}
                className="mt-1 inline-block text-xs text-primary hover:underline"
              >
                [{profile.guildTag}] {profile.guildName}
              </Link>
            ) : (
              <Link to="/guilds" className="mt-1 inline-block text-xs text-muted hover:text-fg">
                Chưa vào Tông Môn
              </Link>
            )}
          </div>
        </div>
        <RealmBadge
          realmId={profile.realmId}
          realmName={profile.realmName}
          realmHan={profile.realmHan}
          layer={profile.realmLayer}
        />
      </div>
      <div className="mt-6">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted">Tu Vi</span>
          <span className="font-mono tabular-nums">
            {profile.exp}
            {nxt ? (
              <span className="text-subtle">
                {" "}
                / {nxt.minExp} · {nxt.name}
              </span>
            ) : (
              <span className="text-subtle"> · viên mãn</span>
            )}
          </span>
        </div>
        <Progress value={bar.pct} className="mt-2" />
        {nxt ? (
          <p className="mt-2 text-xs text-muted">
            Còn {profile.expToNext} tu vi nữa để {nxt.name}.
          </p>
        ) : null}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={<Zap className="size-4 text-gold" />} k="Elo" v={profile.elo} />
        <Stat icon={<Coins className="size-4 text-gold" />} k="Linh Thạch" v={profile.linhThach} />
        <Stat icon={<Swords className="size-4 text-primary" />} k="Thắng" v={profile.pvpWins} />
        <Stat icon={<Flame className="size-4 text-danger" />} k="Chuỗi" v={profile.winStreak} />
      </div>
    </section>
  );
}

function Stat({ icon, k, v }: { icon: ReactNode; k: string; v: number }) {
  return (
    <div className="rounded-[16px] bg-bg/60 p-3">
      <p className="flex items-center gap-1.5 text-xs text-muted">
        {icon}
        {k}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{v}</p>
    </div>
  );
}
