import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { forgeExam } from "@/lib/server/forge";

export const Route = createFileRoute("/forge")({ component: ForgePage });

function ForgePage() {
  const { user, isPending } = useCurrentUserState();
  const [prompt, setPrompt] = useState(
    "Tạo 8 câu trắc nghiệm Toán 12 về nguyên hàm, mức vận dụng, có lời giải.",
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [made, setMade] = useState<{ examId: string; title: string; count: number } | null>(null);

  if (!isPending && !user) return <RedirectToSignIn />;

  async function run() {
    setBusy(true);
    setError(null);
    setMade(null);
    try {
      const r = await forgeExam({ data: { prompt } });
      setMade(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lò đan lỗi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Khởi tạo trận pháp</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Luyện Đan Lô</h1>
        <p className="mt-2 text-muted">
          Nêu yêu cầu. AI sinh đề chuẩn A–D, đáp án và lời giải, rồi lưu vào Kho Đề.
        </p>
        <Textarea className="mt-6" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        <Button className="mt-4" size="lg" disabled={busy} onClick={() => void run()}>
          {busy ? "Đang luyện…" : "Luyện đan"}
        </Button>
        {made && (
          <div className="jade-frame mt-6 rounded-[20px] p-5">
            <p className="font-display text-xl font-semibold">{made.title}</p>
            <p className="mt-1 text-sm text-muted">{made.count} câu đã vào kho.</p>
            <Link to="/exams/$examId" params={{ examId: made.examId }} className="mt-4 inline-block">
              <Button>Vào đề vừa luyện</Button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
