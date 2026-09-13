import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Swords } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CountdownSeal } from "@/components/features/countdown-seal";
import { SpiritField } from "@/components/spirit-field";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { MathText } from "@/lib/math-text";
import { getQuestionsPublic } from "@/lib/server/exams";
import { finishPvp, getPvpMatch, submitPvpAnswer } from "@/lib/server/pvp";
import type { AnswerKey, PvpMatch, QuestionPublic } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

export const Route = createFileRoute("/pvp/$matchId")({ component: PvpRoom });

function PvpRoom() {
  const { matchId } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const [match, setMatch] = useState<PvpMatch | null>(null);
  const [questions, setQuestions] = useState<QuestionPublic[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Record<string, AnswerKey>>({});
  const [left, setLeft] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [locking, setLocking] = useState(false);

  const refresh = useCallback(async () => {
    const m = await getPvpMatch({ data: matchId });
    setMatch(m);
    return m;
  }, [matchId]);

  useEffect(() => {
    void refresh();
    const t = window.setInterval(() => void refresh(), 1500);
    return () => window.clearInterval(t);
  }, [refresh]);

  useEffect(() => {
    if (!match?.examId) return;
    getQuestionsPublic({ data: { examId: match.examId, applyPerks: true } }).then(setQuestions);
  }, [match?.examId]);

  useEffect(() => {
    if (!match || match.status !== "in_progress") {
      setCountdown(0);
      return;
    }
    const fetched = Date.now();
    const baseCount = match.countdownLeft ?? 0;
    const baseFight = match.fightLeft ?? match.durationSeconds;
    const tick = () => {
      const elapsed = (Date.now() - fetched) / 1000;
      const c = Math.max(0, Math.ceil(baseCount - elapsed));
      setCountdown(c);
      setLeft(c > 0 ? match.durationSeconds : Math.max(0, Math.floor(baseFight - elapsed)));
    };
    tick();
    const t = window.setInterval(tick, 200);
    return () => window.clearInterval(t);
  }, [match?.id, match?.status, match?.countdownLeft, match?.fightLeft, match?.durationSeconds]);

  useEffect(() => {
    if (countdown > 0) return;
    if (left === 0 && match?.status === "in_progress") {
      void finishPvp({ data: matchId }).then(setMatch);
    }
  }, [left, countdown, match?.status, matchId]);

  const meId = user?.id;
  const iAmP1 = match?.player1Id === meId;
  const myScore = iAmP1 ? match?.player1Score ?? 0 : match?.player2Score ?? 0;
  const oppScore = iAmP1 ? match?.player2Score ?? 0 : match?.player1Score ?? 0;
  const oppName = iAmP1 ? match?.player2Name ?? "Đang chờ…" : match?.player1Name ?? "Đối thủ";
  const myDone = iAmP1 ? match?.player1Done : match?.player2Done;
  const fighting = match?.status === "in_progress" && countdown <= 0;
  const current = questions[index];
  const options = useMemo(() => {
    if (!current) return [];
    return [
      { key: "A" as const, value: current.optionA },
      { key: "B" as const, value: current.optionB },
      { key: "C" as const, value: current.optionC },
      { key: "D" as const, value: current.optionD },
    ];
  }, [current]);

  async function pick(answer: AnswerKey) {
    if (!current || picked[current.id] || locking || !fighting) return;
    setLocking(true);
    setPicked((p) => ({ ...p, [current.id]: answer }));
    try {
      const m = await submitPvpAnswer({ data: { matchId, questionId: current.id, answer } });
      if (m) setMatch(m);
      if (index < questions.length - 1) setIndex((i) => i + 1);
    } finally {
      setLocking(false);
    }
  }

  if (!isPending && !user) return <RedirectToSignIn />;

  if (match?.status === "waiting") {
    return (
      <div className="relative grid min-h-dvh place-items-center bg-bg px-4">
        <SpiritField />
        <div className="jade-frame relative z-10 w-full max-w-md rounded-[28px] p-8 text-center">
          <Swords className="mx-auto size-8 text-gold" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Chờ đối thủ</h1>
          <p className="mt-4 font-mono text-3xl font-semibold tracking-[0.3em]">{match.roomCode}</p>
        </div>
      </div>
    );
  }

  if (match?.status === "completed") {
    const win = match.winnerId == null ? "draw" : match.winnerId === meId ? "win" : "lose";
    const eloBefore = iAmP1 ? match.p1EloBefore : match.p2EloBefore;
    const eloAfter = iAmP1 ? match.p1EloAfter : match.p2EloAfter;
    const expGain = iAmP1 ? match.p1ExpGain : match.p2ExpGain;
    const eloDelta = eloBefore != null && eloAfter != null ? eloAfter - eloBefore : null;
    return (
      <div className="relative grid min-h-dvh place-items-center bg-bg px-4">
        <SpiritField />
        <div className="jade-frame relative z-10 w-full max-w-md rounded-[28px] p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Kết thúc</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">
            {win === "win" ? "Thắng" : win === "lose" ? "Thua" : "Hòa"}
          </h1>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-[16px] bg-primary/10 p-4">
              <p className="text-xs text-muted">Bạn</p>
              <p className="font-display text-4xl font-semibold tabular-nums text-primary">{myScore.toFixed(1)}</p>
            </div>
            <div className="rounded-[16px] bg-danger/10 p-4">
              <p className="text-xs text-muted">{oppName}</p>
              <p className="font-display text-4xl font-semibold tabular-nums text-danger">{oppScore.toFixed(1)}</p>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-[16px] bg-bg/70 p-3">
              <dt className="text-xs text-muted">Tu Vi</dt>
              <dd className="mt-1 font-mono tabular-nums text-primary">+{expGain}</dd>
            </div>
            <div className="rounded-[16px] bg-bg/70 p-3">
              <dt className="text-xs text-muted">Elo</dt>
              <dd className="mt-1 font-mono tabular-nums">
                {eloAfter ?? "—"}
                {eloDelta != null ? (
                  <span className={eloDelta >= 0 ? "text-primary" : "text-danger"}>
                    {" "}
                    ({eloDelta >= 0 ? "+" : ""}
                    {eloDelta})
                  </span>
                ) : null}
              </dd>
            </div>
          </dl>
          <Link to="/pvp" className="mt-6 inline-block">
            <Button>Đấu tiếp</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-bg">
      <SpiritField />
      {countdown > 0 && match?.status === "in_progress" ? (
        <CountdownSeal seconds={countdown} foeName={oppName} />
      ) : null}
      <header className="relative z-10 border-b border-border bg-bg-elevated">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium">
              Bạn <span className="font-mono tabular-nums text-primary">{myScore.toFixed(1)}</span>
            </span>
            <span className="text-subtle">vs</span>
            <span className="font-medium">
              {oppName} <span className="font-mono tabular-nums text-danger">{oppScore.toFixed(1)}</span>
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 font-mono text-sm tabular-nums">
            <Clock className="size-4" />
            {countdown > 0 ? `+${countdown}` : left == null ? "--:--" : formatTime(left)}
          </div>
        </div>
      </header>
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col p-4">
        {current && fighting && !myDone && (
          <div className="scripture-sheet rounded-[24px] p-6">
            <p className="text-xs text-subtle">
              Câu {index + 1}/{questions.length}
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold">
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
                    disabled={locking || Boolean(picked[current.id])}
                    onClick={() => void pick(opt.key)}
                    className={cn(
                      "min-h-14 rounded-[16px] border-2 px-4 py-3 text-left",
                      picked[current.id] === opt.key
                        ? "border-primary bg-primary/8"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <span className="font-semibold">{opt.key}.</span> <MathText text={opt.value} />
                  </button>
                ),
              )}
            </div>
            {index >= questions.length - 1 && picked[current.id] && (
              <Button className="mt-6 w-full" onClick={() => void finishPvp({ data: matchId }).then(setMatch)}>
                Hoàn thành
              </Button>
            )}
          </div>
        )}
        {myDone && match?.status === "in_progress" && countdown <= 0 && (
          <div className="grid flex-1 place-items-center text-center">
            <p className="font-display text-2xl font-semibold">Bạn đã xong</p>
            <p className="mt-2 text-sm text-muted">Đang chờ đối thủ nộp bài…</p>
          </div>
        )}
      </div>
    </div>
  );
}
