import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ScanEye, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { compressForOcr } from "@/lib/compress-image";
import { parseExamText, SAMPLE_EXAM_TEXT } from "@/lib/ocr-parse";
import { deleteDoc, listMyDocs, savePastedExam, uploadDoc } from "@/lib/server/documents";
import type { VaultDoc } from "@/lib/types";

export const Route = createFileRoute("/documents/")({ component: DocsPage });

function DocsPage() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [docs, setDocs] = useState<VaultDoc[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pasteRef = useRef<HTMLTextAreaElement>(null);

  function reload() {
    listMyDocs().then(setDocs).catch(() => setDocs([]));
  }

  useEffect(() => {
    if (user) reload();
  }, [user]);

  if (!isPending && !user) return <RedirectToSignIn />;

  async function upload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const packed = await compressForOcr(file);
      await uploadDoc({
        data: {
          title: title || file.name.replace(/\.[^.]+$/, ""),
          mime: packed.mime,
          dataB64: packed.dataB64,
        },
      });
      setTitle("");
      setFile(null);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload lỗi");
    } finally {
      setBusy(false);
    }
  }

  async function savePaste(raw: string) {
    setBusy(true);
    setError(null);
    try {
      const draft = parseExamText(raw, "Đề dán chữ");
      const saved = await savePastedExam({
        data: { title: draft.title, questions: draft.questions },
      });
      await navigate({ to: "/exams/$examId", params: { examId: saved.examId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không bóc được chữ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Không Gian Giới Chỉ</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Tàng Thư riêng</h1>
        <p className="mt-2 text-muted">
          Ảnh đề được nén trước khi cất. Thiên Nhãn OCR bóc trắc nghiệm; nếu hết linh khí thì dán chữ đề.
        </p>
        <div className="jade-frame mt-6 space-y-3 rounded-[24px] p-5">
          <div>
            <Label htmlFor="title">Tên tài liệu</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <input
            type="file"
            accept=".pdf,.doc,.docx,image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          {file?.type.startsWith("image/") ? (
            <p className="text-xs text-muted">Ảnh sẽ được nén về tối đa 1600px JPEG để OCR rõ và nhanh.</p>
          ) : null}
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button disabled={!file || busy} onClick={() => void upload()}>
            {busy ? "Đang nén & cất…" : "Cất vào thư"}
          </Button>
        </div>

        <div className="jade-frame mt-6 space-y-3 rounded-[24px] p-5">
          <p className="text-sm font-medium">Bóc đề từ chữ — không cần ảnh</p>
          <Textarea
            ref={pasteRef}
            rows={6}
            placeholder={"Câu 1. ...\nA. ...\nB. ...\nC. ...\nD. ...\nCâu 2. ..."}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void savePaste(pasteRef.current?.value ?? "")}
            >
              Bóc từ chữ & lưu
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => {
                if (pasteRef.current) pasteRef.current.value = SAMPLE_EXAM_TEXT;
                void savePaste(SAMPLE_EXAM_TEXT);
              }}
            >
              Dùng đề mẫu
            </Button>
          </div>
        </div>

        <div className="mt-6 divide-y divide-border overflow-hidden rounded-[20px] border border-border">
          {docs.length === 0 && <p className="p-5 text-sm text-muted">Thư còn trống.</p>}
          {docs.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-3 bg-bg-elevated px-4 py-3">
              <Link to="/documents/$docId" params={{ docId: d.id }} className="min-w-0 flex-1">
                <p className="truncate font-medium">{d.title}</p>
                <p className="text-xs text-muted">
                  {d.mime.startsWith("image/") ? "Ảnh đề" : d.mime} · {(d.sizeBytes / 1024).toFixed(0)} KB
                  {d.ocrCount ? ` · đã bóc ${d.ocrCount} câu` : ""}
                </p>
              </Link>
              <Link
                to="/documents/$docId"
                params={{ docId: d.id }}
                className="hidden items-center gap-1 rounded-[10px] px-2 py-2 text-xs text-primary hover:bg-surface sm:inline-flex"
              >
                <ScanEye className="size-4" />
                {d.ocrCount ? "Xem bản bóc" : "Bóc đề"}
              </Link>
              <button
                type="button"
                className="grid size-10 place-items-center rounded-[10px] text-muted hover:bg-surface hover:text-danger"
                onClick={() => void deleteDoc({ data: d.id }).then(reload)}
                aria-label="Xóa"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
