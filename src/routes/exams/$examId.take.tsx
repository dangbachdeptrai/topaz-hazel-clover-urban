import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SpiritField } from "@/components/spirit-field";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { MathText } from "@/lib/math-text";
import { getExam, getQuestionsPublic, submitAttempt } from "@/lib/server/exams";
import type { AnswerKey, Exam, QuestionPublic } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

export const Route = createFileRoute("/exams/$examId/take")({ component: TakeExam });

function TakeExam() {
  const { examId } = Route.useParams();
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [exam, setExam] = useState<Exam | null>(null);
  const [qs, setQs] = useState<QuestionPublic[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Record<string, AnswerKey>>({});
  const [left, setLeft] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState("");

  useEffect(() => {
    setAttemptId(sessionStorage.getItem("ltc-attempt") ?? "");
  }, []);

  useEffect(() => {
    getExam({ data: examId }).then(setExam);
    getQuestionsPublic({ data: { examId, applyPerks: true } }).then(setQs);
  }, [examId]);

  useEffect(() => {
    if (!exam) return;
    setLeft(exam.durationSeconds);
    const t = window.setInterval(() => setLeft((v) => (v == null ? v : Math.max(0, v - 1))), 1000);
    return () => window.clearInterval(t);
  }, [exam]);

  useEffect(() => {
    if (left === 0) void submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const current = qs[index];
  const options = useMemo(() => {
    if (!current) return [];
    return [
      { key: "A" as const, value: current.optionA },
      { key: "B" as const, value: current.optionB },
      { key: "C" as const, value: current.optionC },
      { key: "D" as const, value: current.optionD },
    ];
  }, [current]);

  async function submit() {
    if (!attemptId) return;
    const res = await submitAttempt({ data: { attemptId, answers: picked } });
    await navigate({
      to: "/exams/$examId/result/$attemptId",
      params: { examId, attemptId },
    });
  }

  if (!isPending && !user) return <RedirectToSignIn />;

  return (
    <div className="relative flex min-h-dvh flex-col bg-bg">
      <SpiritField />
      <header className="relative z-10 border-b border-border bg-bg-elevated">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <p className="truncate text-sm">{exam?.title}</p>
          <span className="inline-flex items-center gap-1.5 font-mono text-sm tabular-nums">
            <Clock className="size-4" />
            {left == null ? "--:--" : formatTime(left)}
          </span>
        </div>
      </header>
      <div className="relative z-10 mx-auto w-full max-w-3xl flex-1 p-4">
        {current && (
          <div className="scripture-sheet rounded-[24px] p-6">
            <p className="text-xs text-subtle">
              Câu {index + 1}/{qs.length}
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold">
              <MathText text={current.content} />
            </h2>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {options.map((opt) => {
                if (current.fadedOption === opt.key) {
                  return (
                    <div
                      key={opt.key}
                      className="min-h-14 rounded-[16px] border-2 border-dashed border-border/60 px-4 py-3 text-left text-subtle line-through"
                    >
                      <span className="font-semibold">{opt.key}.</span> đã bị Minh Nhãn soi
                    </div>
                  );
                }
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setPicked((p) => ({ ...p, [current.id]: opt.key }))}
                    className={cn(
                      "min-h-14 rounded-[16px] border-2 px-4 py-3 text-left",
                      picked[current.id] === opt.key
                        ? "border-primary bg-primary/8"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <span className="font-semibold">{opt.key}.</span> <MathText text={opt.value} />
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
                Trước
              </Button>
              {index < qs.length - 1 ? (
                <Button onClick={() => setIndex((i) => i + 1)}>Sau</Button>
              ) : (
                <Button variant="gold" onClick={() => void submit()}>
                  Nộp bài
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
