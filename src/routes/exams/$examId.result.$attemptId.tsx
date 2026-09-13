import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { MathText } from "@/lib/math-text";
import { getAttemptResult } from "@/lib/server/exams";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/exams/$examId/result/$attemptId")({
  component: ResultPage,
});

function ResultPage() {
  const { examId, attemptId } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const [data, setData] = useState<Awaited<ReturnType<typeof getAttemptResult>>>(null);

  useEffect(() => {
    getAttemptResult({ data: attemptId }).then(setData);
  }, [attemptId]);

  if (!isPending && !user) return <RedirectToSignIn />;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-xs uppercase tracking-[0.16em] text-gold">Kết quả</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">{data?.examTitle ?? "…"}</h1>
        <p className="mt-3 font-display text-5xl font-semibold text-primary">
          {(data?.score ?? 0).toFixed(2)}
        </p>
        <div className="mt-8 space-y-4">
          {data?.items.map((q, i) => (
            <article key={q.id} className="jade-frame rounded-[20px] p-5">
              <p className="text-xs text-subtle">Câu {i + 1}</p>
              <h2 className="mt-1 font-medium">
                <MathText text={q.content} />
              </h2>
              <p className={cn("mt-2 text-sm", q.ok ? "text-primary" : "text-danger")}>
                Bạn chọn {q.picked ?? "—"} · Đáp án {q.correct_answer}
              </p>
              <p className="mt-2 text-sm text-muted">
                <MathText text={q.explanation} />
              </p>
            </article>
          ))}
        </div>
        <Link to="/exams/$examId" params={{ examId }} className="mt-8 inline-block">
          <Button>Thi lại</Button>
        </Link>
      </div>
    </AppShell>
  );
}
