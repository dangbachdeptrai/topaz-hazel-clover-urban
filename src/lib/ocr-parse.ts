import type { AnswerKey, OcrDraft, OcrDraftQuestion } from "@/lib/types";

const KEYS: AnswerKey[] = ["A", "B", "C", "D"];

function asKey(v: string): AnswerKey {
  const s = v.trim().toUpperCase();
  if (s.startsWith("B")) return "B";
  if (s.startsWith("C")) return "C";
  if (s.startsWith("D")) return "D";
  return "A";
}

/** Parse pasted THPTQG/VACT-style multiple choice without calling AI. */
export function parseExamText(raw: string, fallbackTitle = "Đề dán chữ"): OcrDraft {
  const text = raw.replace(/\r/g, "").trim();
  if (text.length < 20) throw new Error("Dán đủ nội dung đề (câu hỏi + A B C D)");

  const titleMatch = text.match(/^(?:đề|de)[^\n]{3,80}/i);
  const title = (titleMatch?.[0] ?? fallbackTitle).replace(/\s+/g, " ").slice(0, 80);

  const chunks = text.split(/(?=(?:^|\n)\s*(?:câu|cau|question)\s*\d+\s*[.:)]?)/i).filter((c) => c.trim());
  const questions: OcrDraftQuestion[] = [];

  for (const chunk of chunks) {
    const head = chunk.match(/^\s*(?:câu|cau|question)\s*\d+\s*[.:)]?\s*([\s\S]+)/i);
    if (!head) continue;
    const body = head[1] ?? chunk;
    const opt: Partial<Record<AnswerKey, string>> = {};
    const optRe = /(?:^|\n)\s*([A-Da-d])\s*[.)]\s*([^\n]+)/g;
    let m: RegExpExecArray | null;
    const indices: { key: AnswerKey; at: number; text: string }[] = [];
    while ((m = optRe.exec(body))) {
      indices.push({ key: asKey(m[1] ?? "A"), at: m.index, text: (m[2] ?? "").trim() });
    }
    if (indices.length < 2) continue;
    const stem = body.slice(0, indices[0]!.at).replace(/\s+/g, " ").trim();
    if (!stem) continue;
    for (const o of indices) opt[o.key] = o.text.slice(0, 240);
    const ans = body.match(/(?:đáp\s*án|dap\s*an|answer)\s*[:.]?\s*([A-Da-d])/i);
    questions.push({
      content: stem.slice(0, 800),
      optionA: opt.A ?? "A",
      optionB: opt.B ?? "B",
      optionC: opt.C ?? "C",
      optionD: opt.D ?? "D",
      correct: ans ? asKey(ans[1] ?? "A") : guessCorrect(stem, opt),
      explanation: ans ? "Theo đáp án in trên đề." : "Gợi ý máy — hãy kiểm lại.",
      topic: guessTopic(stem),
      difficulty: "medium",
      score: 0.5,
      confidence: ans ? "high" : "low",
    });
    if (questions.length >= 12) break;
  }

  if (questions.length < 2) {
    throw new Error("Chưa nhận ra đủ câu A-D. Mỗi câu cần 4 phương án, xuống dòng.");
  }
  return { title, questions };
}

function guessTopic(stem: string): string {
  const s = stem.toLowerCase();
  if (/đạo hàm|dao ham|f'\(/.test(s)) return "Đạo hàm";
  if (/tích phân|tich phan|\\int/.test(s)) return "Tích phân";
  if (/số phức|so phuc|modun/.test(s)) return "Số phức";
  if (/nghiệm|nghiem|phương trình|phuong trinh/.test(s)) return "Phương trình";
  if (/mặt cầu|mat cau|hình học|hinh hoc/.test(s)) return "Hình học";
  return "Tổng hợp";
}

function guessCorrect(stem: string, opt: Partial<Record<AnswerKey, string>>): AnswerKey {
  const t = `${stem} ${KEYS.map((k) => opt[k] ?? "").join(" ")}`;
  // x^2-5x+6 = (x-2)(x-3)
  if (/x\^2\s*-\s*5x\s*\+\s*6/.test(t) && /2.*3/.test(opt.A ?? "")) return "A";
  // f(x)=x^3-3x^2+2 => 3x^2-6x
  if (/x\^3\s*-\s*3x\^2/.test(t) && /3x\^2\s*-\s*6x/.test(opt.A ?? "")) return "A";
  // ∫0..1 2x = 1
  if (/2x/.test(t) && /tích phân|tich phan/.test(stem.toLowerCase()) && (opt.B ?? "").trim() === "1") return "B";
  // |3-4i|=5
  if (/3\s*-\s*4i/.test(t) && (opt.A ?? "").trim() === "5") return "A";
  return "A";
}

export function describeApiError(status: number, body: string): string {
  try {
    const err = JSON.parse(body) as { error?: string | { message?: string }; code?: string };
    const msg = typeof err.error === "string" ? err.error : err.error?.message;
    const code = err.code ?? "";
    if (code.includes("spending-limit") || /credits|subscription/i.test(msg ?? "")) {
      return "Linh khí AI tạm hết hạn mức. Dán chữ đề bên dưới để bóc thủ công, rồi lưu vào Kho Đề.";
    }
    if (msg) return msg.slice(0, 180);
  } catch {
    /* keep status */
  }
  if (status === 401 || status === 403) {
    return "Linh khí AI chưa mở. Dán chữ đề bên dưới để bóc thủ công.";
  }
  if (status === 429) return "Thiên Nhãn đang quá tải — đợi vài giây rồi bóc lại.";
  return `OCR lỗi ${status}`;
}
