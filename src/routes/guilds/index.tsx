import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { GUILD_CREATE_COST } from "@/lib/catalog";
import { createGuild, joinGuild, listGuilds } from "@/lib/server/guilds";
import type { CultivationProfile, GuildSummary } from "@/lib/types";

export const Route = createFileRoute("/guilds/")({ component: GuildsPage });

function GuildsPage() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [mine, setMine] = useState<CultivationProfile | null>(null);
  const [guilds, setGuilds] = useState<GuildSummary[]>([]);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [motto, setMotto] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    listGuilds()
      .then((r) => {
        setMine(r.mine);
        setGuilds(r.guilds);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (!isPending && !user) return <RedirectToSignIn />;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Tông Môn</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Bang hội</h1>
        <p className="mt-2 text-muted">
          Lập Tông, mời đạo hữu. Tông Môn Chiến tính tổng cống hiến từ Lôi Đài, Bí Cảnh và Thiên Tháp.
        </p>
        {mine?.guildId ? (
          <Link
            to="/guilds/$guildId"
            params={{ guildId: mine.guildId }}
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            Vào Tông [{mine.guildTag}] {mine.guildName}
          </Link>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="jade-frame rounded-[24px] p-6">
            <h2 className="font-display text-xl font-semibold">Lập Tông</h2>
            <p className="mt-1 text-sm text-muted">Tốn {GUILD_CREATE_COST} Linh Thạch.</p>
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="gname">Tên</Label>
                <Input id="gname" value={name} onChange={(e) => setName(e.target.value)} maxLength={28} />
              </div>
              <div>
                <Label htmlFor="gtag">Ký hiệu</Label>
                <Input
                  id="gtag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value.toUpperCase())}
                  maxLength={4}
                  className="font-mono uppercase"
                  placeholder="VD: LTC"
                />
              </div>
              <div>
                <Label htmlFor="gmotto">Tông huấn</Label>
                <Input id="gmotto" value={motto} onChange={(e) => setMotto(e.target.value)} maxLength={80} />
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button
                className="w-full"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError(null);
                  try {
                    const r = await createGuild({ data: { name, tag, motto } });
                    await navigate({ to: "/guilds/$guildId", params: { guildId: r.id } });
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Không lập được");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Lập Tông Môn
              </Button>
            </div>
          </div>
          <div className="jade-frame rounded-[24px] p-6">
            <h2 className="font-display text-xl font-semibold">Gia nhập</h2>
            <p className="mt-1 text-sm text-muted">Nhập mã mời của Tông chủ.</p>
            <div className="mt-4 flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Mã mời"
                className="font-mono uppercase"
              />
              <Button
                variant="gold"
                disabled={busy || !code}
                onClick={async () => {
                  setBusy(true);
                  setError(null);
                  try {
                    const r = await joinGuild({ data: { inviteCode: code } });
                    await navigate({ to: "/guilds/$guildId", params: { guildId: r.id } });
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Không vào được");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Vào
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted">
              Đang có {mine?.linhThach ?? 0} Linh Thạch.
            </p>
          </div>
        </div>

        <h2 className="mt-10 font-display text-xl font-semibold">Bảng Tông Môn Chiến</h2>
        <div className="jade-frame mt-3 divide-y divide-border rounded-[20px] p-0">
          {guilds.length === 0 && <p className="p-5 text-sm text-muted">Chưa có Tông Môn nào.</p>}
          {guilds.map((g, i) => (
            <Link
              key={g.id}
              to="/guilds/$guildId"
              params={{ guildId: g.id }}
              className="flex items-center justify-between px-5 py-3 hover:bg-surface"
            >
              <div>
                <p className="font-medium">
                  <span className="mr-2 font-mono text-xs text-gold">
                    {i === 0 ? "元" : i === 1 ? "魁" : i === 2 ? "罡" : `${i + 1}`}
                  </span>
                  [{g.tag}] {g.name}
                </p>
                <p className="text-xs text-muted">
                  {g.memberCount} thành viên · Elo {g.totalElo}
                </p>
              </div>
              <p className="font-mono tabular-nums text-primary">{g.totalContribution}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
