import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CultivationPanel } from "@/components/features/cultivation-panel";
import { PerkGrid } from "@/components/features/perk-grid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyCultivation, listMyPerks } from "@/lib/server/cultivation";
import { listMyAttempts } from "@/lib/server/exams";
import { getProfileStats } from "@/lib/server/profile";
import { listMyPvp } from "@/lib/server/pvp";
import type { CultivationProfile, ExamAttempt, Perk, ProfileStats, PvpMatch } from "@/lib/types";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user, isPending } = useCurrentUserState();
  const [cultivation, setCultivation] = useState<CultivationProfile | null>(null);
  const [perks, setPerks] = useState<Perk[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [pvp, setPvp] = useState<PvpMatch[]>([]);

  const load = useCallback(() => {
    if (!user) return;
    getMyCultivation({ data: { displayName: user.displayName ?? undefined } })
      .then(setCultivation)
      .catch(() => setCultivation(null));
    listMyPerks()
      .then((r) => {
        setCultivation(r.profile);
        setPerks(r.perks);
      })
      .catch(() => undefined);
    getProfileStats().then(setStats).catch(() => setStats(null));
    listMyAttempts().then(setAttempts).catch(() => setAttempts([]));
    listMyPvp().then(setPvp).catch(() => setPvp([]));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (!isPending && !user) return <RedirectToSignIn />;
  if (!user) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {cultivation ? <CultivationPanel profile={cultivation} /> : <Skeleton className="h-64 rounded-[28px]" />}
        <div className="mt-8">
          {cultivation ? <PerkGrid perks={perks} profile={cultivation} onChange={load} /> : null}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat k="Đề đã làm" v={stats?.examsTaken ?? 0} />
          <Stat k="Điểm TB" v={(stats?.avgScore ?? 0).toFixed(2)} />
          <Stat k="Cao nhất" v={(stats?.bestScore ?? 0).toFixed(2)} />
          <Stat k="Lôi Đài W-L-D" v={`${stats?.pvpWins ?? 0}-${stats?.pvpLosses ?? 0}-${stats?.pvpDraws ?? 0}`} />
        </div>
        <h2 className="mt-10 font-display text-xl font-semibold">Lịch sử thi</h2>
        <div className="jade-frame mt-3 divide-y divide-border rounded-[20px] p-0">
          {attempts.length === 0 && <p className="p-5 text-sm text-muted">Chưa có bài nộp.</p>}
          {attempts.map((a) => (
            <Link
              key={a.id}
              to="/exams/$examId/result/$attemptId"
              params={{ examId: a.examId, attemptId: a.id }}
              className="flex items-center justify-between px-5 py-3 hover:bg-surface"
            >
              <div>
                <p className="font-medium">{a.examTitle}</p>
                <p className="text-xs text-muted">{a.examType}</p>
              </div>
              <p className="font-mono tabular-nums text-primary">{(a.score ?? 0).toFixed(2)}</p>
            </Link>
          ))}
        </div>
        <h2 className="mt-10 font-display text-xl font-semibold">Trận Lôi Đài</h2>
        <div className="jade-frame mt-3 divide-y divide-border rounded-[20px] p-0">
          {pvp.length === 0 && <p className="p-5 text-sm text-muted">Chưa đấu trận nào.</p>}
          {pvp.map((m) => {
            const mine = m.player1Id === user.id ? m.player1Score : m.player2Score;
            const opp = m.player1Id === user.id ? m.player2Name : m.player1Name;
            const result = m.winnerId == null ? "Hòa" : m.winnerId === user.id ? "Thắng" : "Thua";
            return (
              <div key={m.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium">vs {opp}</p>
                  <p className="text-xs text-muted">
                    {m.examTitle}
                    {m.mode === "ranked" ? " · Ranked" : ""}
                  </p>
                </div>
                <p className="text-sm">
                  {result} · <span className="font-mono tabular-nums">{mine.toFixed(1)}</span>
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/pvp">
            <Button variant="gold">Vào Lôi Đài</Button>
          </Link>
          <Link to="/survival">
            <Button>Bí Cảnh</Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline">Chợ Linh Bảo</Button>
          </Link>
          <Link to="/guilds">
            <Button variant="outline">Tông Môn</Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ k, v }: { k: string; v: string | number }) {
  return (
    <div className="jade-frame rounded-[20px] p-4">
      <p className="text-xs text-muted">{k}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{v}</p>
    </div>
  );
}
