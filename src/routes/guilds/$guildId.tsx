import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { SpiritAvatar } from "@/components/features/spirit-avatar";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getGuild, kickMember, leaveGuild } from "@/lib/server/guilds";
import type { GuildDetail } from "@/lib/types";

export const Route = createFileRoute("/guilds/$guildId")({ component: GuildDetailPage });

function GuildDetailPage() {
  const { guildId } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [guild, setGuild] = useState<GuildDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getGuild({ data: guildId })
      .then(setGuild)
      .catch(() => setGuild(null));
  }, [guildId]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (!isPending && !user) return <RedirectToSignIn />;
  if (!guild) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted">Đang mở sảnh Tông…</div>
      </AppShell>
    );
  }

  const isLeader = guild.myRole === "leader";
  const isMember = Boolean(guild.myRole);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Tông Môn</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl font-semibold">
              [{guild.tag}] {guild.name}
            </h1>
            {guild.motto ? <p className="mt-2 text-muted">{guild.motto}</p> : null}
          </div>
          <div className="text-right text-sm">
            <p className="font-mono tabular-nums text-primary">{guild.totalContribution} cống hiến</p>
            <p className="text-muted">{guild.memberCount} thành viên · Elo {guild.totalElo}</p>
          </div>
        </div>

        {isMember ? (
          <div className="jade-frame mt-6 rounded-[20px] p-5">
            <p className="text-xs text-muted">Mã mời</p>
            <p className="mt-1 font-mono text-2xl tracking-[0.24em]">{guild.inviteCode}</p>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

        <h2 className="mt-8 font-display text-xl font-semibold">Thành viên</h2>
        <ul className="jade-frame mt-3 divide-y divide-border rounded-[20px] p-0">
          {guild.members.map((m) => (
            <li key={m.userId} className="flex items-center gap-3 px-4 py-3">
              <SpiritAvatar name={m.displayName} frame={m.equippedFrame} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {m.displayName}
                  {m.daoTitle ? <span className="ml-2 text-xs text-gold">{m.daoTitle}</span> : null}
                </p>
                <p className="text-xs text-muted">
                  {m.role === "leader" ? "Tông chủ" : m.role === "elder" ? "Trưởng lão" : "Đệ tử"} ·{" "}
                  {m.realmHan} {m.realmName} · Elo {m.elo}
                </p>
              </div>
              <p className="font-mono text-sm tabular-nums text-primary">{m.contribution}</p>
              {isLeader && m.userId !== user?.id ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    setError(null);
                    try {
                      await kickMember({ data: { userId: m.userId } });
                      load();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Không trục xuất được");
                    }
                  }}
                >
                  Trục
                </Button>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/guilds">
            <Button variant="outline">Bảng xếp hạng</Button>
          </Link>
          {isMember ? (
            <Button
              variant="ghost"
              onClick={async () => {
                setError(null);
                try {
                  await leaveGuild();
                  await navigate({ to: "/guilds" });
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Không rời được");
                }
              }}
            >
              Rời Tông
            </Button>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
