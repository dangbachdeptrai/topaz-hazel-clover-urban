import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getExam, startAttempt } from "@/lib/server/exams";
import type { Exam } from "@/lib/types";

export const Route = createFileRoute("/exams/$examId")({ component: ExamIntro });

function ExamIntro() {
  const { examId } = Route.useParams();
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [exam, setExam] = useState<Exam | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getExam({ data: examId }).then(setExam);
  }, [examId]);

  if (!isPending && !user) return <RedirectToSignIn />;

  async function go() {
    setBusy(true);
    try {
      const { attemptId } = await startAttempt({ data: examId });
      sessionStorage.setItem("ltc-attempt", attemptId);
      await navigate({ to: "/exams/$examId/take", params: { examId } });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-xs uppercase tracking-[0.16em] text-gold">{exam?.examType}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">{exam?.title ?? "…"}</h1>
        <p className="mt-3 text-muted">{exam?.description}</p>
        <p className="mt-2 text-sm text-subtle">
          {exam?.authorName} · {exam?.totalQuestions} câu · {Math.round((exam?.durationSeconds ?? 0) / 60)} phút
        </p>
        <div className="mt-8 flex gap-3">
          <Button size="lg" onClick={() => void go()} disabled={busy || !user}>
            Bắt đầu thi
          </Button>
          <Link to="/exams">
            <Button size="lg" variant="outline">
              Quay lại
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
