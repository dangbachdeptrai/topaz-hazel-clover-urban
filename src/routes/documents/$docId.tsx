import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { MathText } from "@/lib/math-text";
import { extractExamFromDoc, getDoc, saveOcrExam } from "@/lib/server/documents";
import type { AnswerKey, OcrDraft, OcrDraftQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/documents/$docId")({ component: DocView });

const KEYS: AnswerKey[] = ["A", "B", "C", "D"];

function DocView() {
  const { docId } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Awaited<ReturnType<typeof getDoc>>>(null);
  const [draft, setDraft] = useState<OcrDraft | null>(null);
  const [busy, setBusy] = useState<"ocr" | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDoc({ data: docId }).then((d) => {
      setDoc(d);
      if (d?.ocr) setDraft(d.ocr);
    });
  }, [docId]);

  if (!isPending && !user) return <RedirectToSignIn />;

  const href = doc ? `data:${doc.mime};base64,${doc.dataB64}` : "";
  const canOcr = Boolean(doc?.mime.startsWith("image/"));

  async function ocr(force = false) {
    setBusy("ocr");
    setError(null);
    try {
      const r = await extractExamFromDoc({ data: { docId, force } });
      setDraft(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bóc tách lỗi");
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    if (!draft) return;
    setBusy("save");
    setError(null);
    try {
      const r = await saveOcrExam({
        data: { docId, title: draft.title, questions: draft.questions },
      });
      await navigate({ to: "/exams/$examId", params: { examId: r.examId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được đề");
    } finally {
      setBusy(null);
    }
  }

  function patchQ(i: number, patch: Partial<OcrDraftQuestion>) {
    setDraft((d) => {
      if (!d) return d;
      const questions = d.questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q));
      return { ...d, questions };
    });
  }

  function dropQ(i: number) {
    setDraft((d) => (d ? { ...d, questions: d.questions.filter((_, idx) => idx !== i) } : d));
  }

  const low = draft?.questions.filter((q) => q.confidence === "low").length ?? 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/documents" className="text-sm text-primary">
          ← Tàng Thư
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold">{doc?.title ?? "…"}</h1>
        <p className="mt-2 text-sm text-muted">
          Thiên Nhãn đọc ảnh, tự giải đáp án. Sửa rồi mới lưu vào Kho Đề — không ghi đè khi bóc lại.
        </p>
        {doc?.mime.startsWith("image/") && href ? (
          <img src={href} alt="" className="mt-6 max-h-[52vh] rounded-[16px] border border-border" />
        ) : null}
        {doc?.mime === "application/pdf" && href ? (
          <iframe title={doc.title} src={href} className="mt-6 h-[52vh] w-full rounded-[16px] border border-border" />
        ) : null}
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          {doc ? (
            <a href={href} download={doc.title}>
              <Button variant="outline">Tải xuống</Button>
            </a>
          ) : null}
          <Button disabled={!canOcr || busy !== null} onClick={() => void ocr(Boolean(draft))}>
            {busy === "ocr" ? "Đang đọc đề…" : draft ? "Bóc lại" : "Thiên Nhãn · Bóc đề"}
          </Button>
          {doc?.ocrExamId ? (
            <Link to="/exams/$examId" params={{ examId: doc.ocrExamId }}>
              <Button variant="gold">Mở đề đã lưu</Button>
            </Link>
          ) : null}
        </div>
        {!canOcr && doc ? (
          <p className="mt-3 text-xs text-muted">Chụp trang PDF thành JPG/PNG rồi cất lại để bóc tách.</p>
        ) : null}

        {draft ? (
          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Bản bóc</p>
                <LabelTitle value={draft.title} onChange={(title) => setDraft({ ...draft, title })} />
                <p className="mt-1 text-xs text-muted">
                  {draft.questions.length} câu
                  {low ? ` · ${low} câu chưa chắc, nên kiểm đáp án` : ""}
                </p>
              </div>
              <Button disabled={busy !== null || draft.questions.length < 2} onClick={() => void save()}>
                {busy === "save" ? "Đang lập đề…" : "Lưu vào Kho Đề"}
              </Button>
            </div>
            <ol className="mt-5 space-y-4">
              {draft.questions.map((q, i) => (
                <li key={`${i}-${q.content.slice(0, 12)}`} className="jade-frame rounded-[20px] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs text-subtle">
                      Câu {i + 1} · {q.topic} · {q.difficulty}
                      {q.confidence === "low" ? (
                        <span className="ml-2 text-danger">chưa chắc</span>
                      ) : q.confidence === "high" ? (
                        <span className="ml-2 text-primary">tin cậy</span>
                      ) : null}
                    </p>
                    <button
                      type="button"
                      className="text-xs text-muted hover:text-danger"
                      onClick={() => dropQ(i)}
                    >
                      Bỏ câu
                    </button>
                  </div>
                  <p className="mt-2 text-sm font-medium">
                    <MathText text={q.content} />
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {KEYS.map((k) => {
                      const val = q[`option${k}` as "optionA"];
                      const selected = q.correct === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => patchQ(i, { correct: k, confidence: "high" })}
                          className={cn(
                            "rounded-[14px] border px-3 py-2 text-left text-sm",
                            selected ? "border-primary bg-primary/10" : "border-border bg-bg/50",
                          )}
                        >
                          <span className="mr-2 font-mono text-gold">{k}.</span>
                          <MathText text={val} />
                        </button>
                      );
                    })}
                  </div>
                  {q.explanation ? (
                    <p className="mt-3 text-xs text-muted">
                      Giải: <MathText text={q.explanation} />
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}

function LabelTitle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-2 max-w-xl font-display text-xl font-semibold"
    />
  );
}
