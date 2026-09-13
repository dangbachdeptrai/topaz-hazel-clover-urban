import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { listExams } from "@/lib/server/exams";
import type { Exam } from "@/lib/types";

export const Route = createFileRoute("/exams/")({ component: ExamsPage });

function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  useEffect(() => {
    listExams().then(setExams).catch(() => setExams([]));
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Trận pháp</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Kho Đề</h1>
        <p className="mt-2 max-w-xl text-muted">
          Đề rải từ phong cách minh họa Bộ, VACT, TSA. Sau này đạo hữu tự đăng thêm.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {exams.map((e) => (
            <Link
              key={e.id}
              to="/exams/$examId"
              params={{ examId: e.id }}
              className="jade-frame block rounded-[24px] p-5 hover:border-primary/40"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-gold">{e.examType}</p>
              <h2 className="mt-1 font-display text-2xl font-semibold">{e.title}</h2>
              <p className="mt-2 text-sm text-muted">{e.description}</p>
              <p className="mt-3 text-xs text-subtle">
                {e.totalQuestions} câu · {Math.round(e.durationSeconds / 60)} phút · {e.sourceLabel}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
