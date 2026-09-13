import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CountdownSeal } from "@/components/features/countdown-seal";
import { SurvivalRoster } from "@/components/features/survival-roster";
import { SpiritField } from "@/components/spirit-field";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { MathText } from "@/lib/math-text";
import { getBrQuestion, getBrRoom, submitBrAnswer } from "@/lib/server/survival";
import type { AnswerKey, BrRoom, QuestionPublic } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/survival/$roomId")({ component: SurvivalRoom });

function SurvivalRoom() {
  const { roomId } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const [room, setRoom] = useState<BrRoom | null>(null);
  const [question, setQuestion] = useState<QuestionPublic | null>(null);
  const [picked, setPicked] = useState<AnswerKey | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [roundLeft, setRoundLeft] = useState(0);
  const [locking, setLocking] = useState(false);

  const refresh = useCallback(async () => {
    const r = await getBrRoom({ data: roomId });
    setRoom(r);
    return r;
  }, [roomId]);

  useEffect(() => {
    void refresh();
    const t = window.setInterval(() => void refresh(), 1100);
    return () => window.clearInterval(t);
  }, [refresh]);

  useEffect(() => {
    if (!room || room.status !== "playing") {
      setQuestion(null);
      return;
    }
    getBrQuestion({ data: roomId })
      .then((res) => {
        setQuestion(res.question);
        setPicked(null);
      })
      .catch(() => setQuestion(null));
  }, [roomId, room?.status, room?.roundIndex]);

  useEffect(() => {
    if (!room) return;
    const fetched = Date.now();
    const baseCount = room.countdownLeft ?? 0;
    const baseRound = room.roundLeft ?? 0;
    const tick = () => {
      const elapsed = (Date.now() - fetched) / 1000;
      setCountdown(Math.max(0, Math.ceil(baseCount - elapsed)));
      setRoundLeft(Math.max(0, Math.floor(baseRound - elapsed)));
    };
    tick();
    const t = window.setInterval(tick, 200);
    return () => window.clearInterval(t);
  }, [room?.id, room?.status, room?.roundIndex, room?.countdownLeft, room?.roundLeft]);

  const options = useMemo(() => {
    if (!question) return [];
    return [
      { key: "A" as const, value: question.optionA },
      { key: "B" as const, value: question.optionB },
      { key: "C" as const, value: question.optionC },
      { key: "D" as const, value: question.optionD },
    ];
  }, [question]);

  async function pick(answer: AnswerKey) {
    if (!question || picked || locking || !room?.myAlive || room.status !== "playing") return;
    if (countdown > 0) return;
    setLocking(true);
    setPicked(answer);
    try {
      const r = await submitBrAnswer({ data: { roomId, answer } });
      setRoom(r);
    } catch {
      setPicked(null);
    } finally {
      setLocking(false);
    }
  }

  if (!isPending && !user) return <RedirectToSignIn />;

  if (room?.status === "completed") {
    const place = room.myPlacement;
    const title = place === 1 ? "Độc tôn Bí Cảnh" : place ? `Hạng ${place}` : "Kết thúc";
    return (
      <div className="relative grid min-h-dvh place-items-center bg-bg px-4">
        <SpiritField />
        <div className="jade-frame relative z-10 w-full max-w-md rounded-[28px] p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Bí Cảnh</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">{title}</h1>
          {room.winnerName ? (
            <p className="mt-2 text-sm text-muted">Người sống sót · {room.winnerName}</p>
          ) : null}
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-[16px] bg-bg/70 p-3">
              <dt className="text-xs text-muted">Tu Vi</dt>
              <dd className="mt-1 font-mono tabular-nums text-primary">+{room.myExpGain}</dd>
            </div>
            <div className="rounded-[16px] bg-bg/70 p-3">
              <dt className="text-xs text-muted">Linh Thạch</dt>
              <dd className="mt-1 font-mono tabular-nums text-gold">+{room.myThachGain}</dd>
            </div>
          </dl>
          <ol className="mt-5 space-y-1 text-left text-sm">
            {room.players
              .slice()
              .sort((a, b) => (a.placement ?? 99) - (b.placement ?? 99))
              .map((p) => (
                <li key={p.userId} className="flex justify-between rounded-[12px] bg-bg/40 px-3 py-2">
                  <span className={cn(p.userId === user?.id && "text-primary")}>
                    {p.placement ?? "—"}. {p.displayName}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted">{p.correctCount} đúng</span>
                </li>
              ))}
          </ol>
          <Link to="/survival" className="mt-6 inline-block">
            <Button>Vào Bí Cảnh khác</Button>
          </Link>
        </div>
      </div>
    );
  }

  const fighting = room?.status === "playing" && countdown <= 0;

  return (
    <div className="relative flex min-h-dvh flex-col bg-bg">
      <SpiritField />
      {countdown > 0 && room?.status === "countdown" ? (
        <CountdownSeal seconds={countdown} title="Bí Cảnh" foeName={`${room.players.length} đạo hữu`} />
      ) : null}
      <header className="relative z-10 border-b border-border bg-bg-elevated">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <p className="text-sm">
            Vòng {(room?.roundIndex ?? 0) + 1}/{room?.totalRounds ?? 8}
            {!room?.myAlive ? <span className="ml-2 text-danger">Đã rơi</span> : null}
          </p>
          <div className="flex items-center gap-3">
            <Link to="/survival" className="text-xs text-muted hover:text-fg">
              Rời
            </Link>
            <div className="inline-flex items-center gap-1.5 font-mono text-sm tabular-nums">
              <Clock className="size-4" />
              {countdown > 0 ? `+${countdown}` : `${roundLeft}s`}
            </div>
          </div>
        </div>
      </header>
      <div className="relative z-10 mx-auto grid w-full max-w-5xl flex-1 gap-4 p-4 lg:grid-cols-[1fr_260px]">
        <div>
          {question && fighting ? (
            <div className="scripture-sheet rounded-[24px] p-6">
              <p className="text-xs text-subtle">
                Câu {question.orderIndex} · {question.topic}
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold">
                <MathText text={question.content} />
              </h2>
              {!room?.myAlive ? (
                <p className="mt-4 text-sm text-danger">Đạo hữu đã rơi — đang quan chiến. Các hóa thân sẽ kết thúc vòng.</p>
              ) : null}

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {options.map((o) => {
                  const faded = question.fadedOption === o.key;
                  const selected = picked === o.key || (room?.myAnswered && picked === o.key);
                  return (
                    <button
                      key={o.key}
                      type="button"
                      disabled={!room?.myAlive || Boolean(picked) || Boolean(room?.myAnswered) || faded || locking}
                      onClick={() => void pick(o.key)}
                      className={cn(
                        "rounded-[16px] border border-border bg-bg/60 px-4 py-3 text-left text-sm transition",
                        selected && "border-primary bg-primary/10",
                        faded && "opacity-30",
                      )}
                    >
                      <span className="mr-2 font-mono text-gold">{o.key}.</span>
                      <MathText text={o.value} />
                    </button>
                  );
                })}
              </div>
              {room?.myAnswered || picked ? (
                <p className="mt-4 text-sm text-primary">Đã khóa đáp án. Chờ hết giờ vòng.</p>
              ) : null}
            </div>
          ) : (
            <div className="jade-frame rounded-[24px] p-8 text-center text-muted">
              {room?.status === "countdown" ? "Niêm phong khai trận…" : "Đang chuẩn bị vòng kế."}
            </div>
          )}
        </div>
        <SurvivalRoster players={room?.players ?? []} meId={user?.id} />
      </div>
    </div>
  );
}
