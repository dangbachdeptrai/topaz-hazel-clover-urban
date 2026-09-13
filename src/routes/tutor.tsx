import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { MathText } from "@/lib/math-text";
import { askTutor, getTutorThread } from "@/lib/server/tutor";
import type { TutorMessage } from "@/lib/types";

export const Route = createFileRoute("/tutor")({ component: TutorPage });

function TutorPage() {
  const { user, isPending } = useCurrentUserState();
  const [msgs, setMsgs] = useState<TutorMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) getTutorThread().then(setMsgs).catch(() => setMsgs([]));
  }, [user]);

  if (!isPending && !user) return <RedirectToSignIn />;

  async function send() {
    if (!prompt.trim()) return;
    setBusy(true);
    try {
      const next = await askTutor({ data: { prompt } });
      setMsgs(next);
      setPrompt("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto flex max-w-2xl flex-col px-4 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Linh Sư</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Hỏi đáp toán đạo</h1>
        <div className="mt-6 min-h-64 space-y-3">
          {msgs.length === 0 && (
            <p className="text-sm text-muted">Hỏi một bài — Linh Sư giải từng bước bằng LaTeX.</p>
          )}
          {msgs.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "ml-8 rounded-[16px] bg-primary/10 px-4 py-3 text-sm"
                  : "mr-8 jade-frame rounded-[16px] px-4 py-3 text-sm"
              }
            >
              <MathText text={m.content} />
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ví dụ: Giải ∫ x e^x dx"
          />
          <Button className="mt-3" disabled={busy} onClick={() => void send()}>
            {busy ? "Đang suy…" : "Hỏi Linh Sư"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
