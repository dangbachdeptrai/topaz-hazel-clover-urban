import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { MathText } from "@/lib/math-text";
import { getMyCultivation } from "@/lib/server/cultivation";
import { answerTower, getTowerStatus, startTowerFloor } from "@/lib/server/tower";
import type { AnswerKey, CultivationProfile, QuestionPublic, TowerRun } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

export const Route = createFileRoute("/tower")({ component: TowerPage });

function TowerPage() {
  const { user, isPending } = useCurrentUserState();
  const [best, setBest] = useState(0);
  const [run, setRun] = useState<TowerRun | null>(null);
  const [qs, setQs] = useState<QuestionPublic[]>([]);
  const [profile, setProfile] = useState<CultivationProfile | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [left, setLeft] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    getTowerStatus()
      .then((s) => {
        setBest(s.best);
        setRun(s.live?.run ?? null);
        setQs(s.live?.questions ?? []);
      })
      .catch(() => undefined);
    getMyCultivation({ data: { displayName: user?.displayName ?? undefined } })
      .then(setProfile)
      .catch(() => undefined);
  }, [user]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  useEffect(() => {
    if (!run || run.status !== "in_progress") return;
    setLeft(run.remaining);
    const t = window.setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(t);
  }, [run?.id, run?.status, run?.remaining]);

  const current = qs[run?.index ?? 0];
  const options = useMemo(() => {
    if (!current) return [];
    return [
      { key: "A" as const, value: current.optionA },
      { key: "B" as const, value: current.optionB },
      { key: "C" as const, value: current.optionC },
      { key: "D" as const, value: current.optionD },
    ];
  }, [current]);

  if (!isPending && !user) return <RedirectToSignIn />;

  async function enter(floor: number) {
    setBusy(true);
    setMsg(null);
    try {
      const r = await startTowerFloor({ data: floor });
      setRun(r.run);
      setQs(r.questions);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Không vào tầng được");
    } finally {
      setBusy(false);
    }
  }

  async function pick(answer: AnswerKey) {
    if (!run || !current) return;
    setBusy(true);
    try {
      const r = await answerTower({ data: { runId: run.id, questionId: current.id, answer } });
      setRun(r.run);
      setQs(r.questions);
      if ("correct" in r && r.correct === false) setMsg("Sai rồi — rơi khỏi tầng này.");
      if ("reward" in r && r.reward) setMsg(`Vượt tầng! +${r.reward.expGain} Tu Vi, +${r.reward.thach} Linh Thạch`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">PvE</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Cửu Trùng Thiên Tháp</h1>
        <p className="mt-2 text-muted">
          Mười tầng, độ khó tăng dần. Sai một câu là rơi. Tầng 10 là Boss. Cao nhất: tầng {best}.
        </p>
        {profile ? (
          <p className="mt-2 text-sm text-gold">
            {profile.realmName} · Băng Tâm đang cộng giờ nếu trang bị.
          </p>
        ) : null}
        {msg && <p className="mt-4 text-sm text-primary">{msg}</p>}

        {(!run || run.status !== "in_progress") && (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((f) => {
              const locked = f > best + 1;
              const boss = f === 10;
              return (
                <button
                  key={f}
                  type="button"
                  disabled={locked || busy}
                  onClick={() => void enter(f)}
                  className={cn(
                    "jade-frame min-h-24 rounded-[20px] p-3 text-center disabled:opacity-40",
                    boss && "ring-1 ring-gold/50",
                  )}
                >
                  <p className="text-xs text-gold">{boss ? "Boss" : `Tầng ${f}`}</p>
                  <p className="mt-1 font-display text-2xl font-semibold">{f}</p>
                  <p className="text-[10px] text-muted">{locked ? "Khóa" : f <= 3 ? "Dễ" : f <= 6 ? "TB" : "Khó"}</p>
                </button>
              );
            })}
          </div>
        )}

        {run?.status === "in_progress" && current && (
          <div className="scripture-sheet mt-8 rounded-[24px] p-6">
            <div className="flex items-center justify-between text-sm">
              <span>
                Tầng {run.floor} · Câu {run.index + 1}/{qs.length}
              </span>
              <span className="font-mono tabular-nums">{formatTime(left)}</span>
            </div>
            <h2 className="mt-3 font-display text-xl font-semibold">
              <MathText text={current.content} />
            </h2>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {options.map((opt) =>
                current.fadedOption === opt.key ? (
                  <div
                    key={opt.key}
                    className="min-h-14 rounded-[16px] border-2 border-dashed border-border/60 px-4 py-3 text-subtle line-through"
                  >
                    {opt.key}. Minh Nhãn
                  </div>
                ) : (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={busy}
                    onClick={() => void pick(opt.key)}
                    className="min-h-14 rounded-[16px] border-2 border-border px-4 py-3 text-left hover:border-primary/40"
                  >
                    <span className="font-semibold">{opt.key}.</span> <MathText text={opt.value} />
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        {run && run.status !== "in_progress" && (
          <div className="mt-8 flex gap-3">
            <Button onClick={() => setRun(null)}>Chọn tầng khác</Button>
            {run.status === "cleared" && run.floor < 10 && (
              <Button variant="gold" onClick={() => void enter(run.floor + 1)}>
                Tầng tiếp
              </Button>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
