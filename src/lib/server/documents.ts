import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { describeApiError } from "@/lib/ocr-parse";
import { ensureProfile } from "@/lib/server/cultivation";
import type { AnswerKey, Difficulty, OcrConfidence, OcrDraft, OcrDraftQuestion, VaultDoc } from "@/lib/types";


const MAX = 1_800_000;
const OCR_SYSTEM = `Bạn là Thiên Nhãn OCR cho đề Toán THPTQG / VACT / TSA tiếng Việt.

Quy tắc:
- Chỉ bóc câu TRẮC NGHIỆM A-D thực sự có trên ảnh. Không bịa thêm câu.
- Giữ nguyên đề; mọi công thức viết $LaTeX$ (vd $x^2$, $\\int_0^1 x\\,dx$, $\\overrightarrow{AB}$).
- Tự giải để chọn đáp án. Nếu ảnh in sẵn đáp án thì dùng đáp án đó.
- Không chắc thì vẫn chọn 1 phương án và confidence="low".
- 3-12 câu. Lời giải 1-3 câu.

Trả ĐÚNG JSON (không markdown):
{"title":"...","questions":[{"content":"...","optionA":"...","optionB":"...","optionC":"...","optionD":"...","correct":"A","explanation":"...","topic":"...","difficulty":"easy|medium|hard","score":0.5,"confidence":"high|medium|low"}]}`;

function mapDoc(r: {
  id: string;
  title: string;
  mime: string;
  size_bytes: number;
  created_at: string;
  ocr_at: string | null;
  ocr_exam_id: string | null;
  ocr_count: number | string | null;
}): VaultDoc {
  return {
    id: r.id,
    title: r.title,
    mime: r.mime,
    sizeBytes: Number(r.size_bytes),
    createdAt: r.created_at,
    ocrAt: r.ocr_at,
    ocrExamId: r.ocr_exam_id,
    ocrCount: Number(r.ocr_count ?? 0),
  };
}

function asKey(v: unknown): AnswerKey {
  const s = String(v ?? "A").trim().toUpperCase();
  if (s.startsWith("B") || s === "2") return "B";
  if (s.startsWith("C") || s === "3") return "C";
  if (s.startsWith("D") || s === "4") return "D";
  return "A";
}

function asDiff(v: unknown): Difficulty {
  const s = String(v ?? "").toLowerCase();
  if (s === "easy" || s === "hard") return s;
  return "medium";
}

function asConf(v: unknown): OcrConfidence {
  const s = String(v ?? "").toLowerCase();
  if (s === "high" || s === "low") return s;
  return "medium";
}

function pickStr(obj: Record<string, unknown>, keys: string[], fallback: string) {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return fallback;
}

function normalizeQuestion(raw: unknown, i: number): OcrDraftQuestion | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const content = pickStr(o, ["content", "question", "stem", "de"], "");
  if (!content) return null;
  return {
    content: content.slice(0, 800),
    optionA: pickStr(o, ["optionA", "option_a", "A", "a"], "A").slice(0, 240),
    optionB: pickStr(o, ["optionB", "option_b", "B", "b"], "B").slice(0, 240),
    optionC: pickStr(o, ["optionC", "option_c", "C", "c"], "C").slice(0, 240),
    optionD: pickStr(o, ["optionD", "option_d", "D", "d"], "D").slice(0, 240),
    correct: asKey(o.correct ?? o.answer ?? o.dapAn),
    explanation: pickStr(o, ["explanation", "explain", "loiGiai"], "").slice(0, 600),
    topic: pickStr(o, ["topic", "chuDe"], "Tổng hợp").slice(0, 40),
    difficulty: asDiff(o.difficulty),
    score: Number(o.score) > 0 ? Number(o.score) : i < 4 ? 0.25 : 0.5,
    confidence: asConf(o.confidence),
  };
}

function stripFence(raw: string) {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) s = s.slice(start, end + 1);
  return s;
}

function salvageArray(s: string): unknown[] {
  const idx = s.search(/"questions"\s*:\s*\[/);
  if (idx < 0) return [];
  const from = s.indexOf("[", idx);
  let depth = 0;
  let lastGood = from;
  for (let i = from; i < s.length; i++) {
    const ch = s[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) lastGood = i;
    } else if (ch === "]" && depth === 0) {
      try {
        return JSON.parse(s.slice(from, i + 1)) as unknown[];
      } catch {
        break;
      }
    }
  }
  if (lastGood > from) {
    try {
      return JSON.parse(`${s.slice(from, lastGood + 1)}]`) as unknown[];
    } catch {
      return [];
    }
  }
  return [];
}

function parseDraft(raw: string, fallbackTitle: string): OcrDraft {
  const s = stripFence(raw);
  let parsed: { title?: string; questions?: unknown[] } = {};
  try {
    parsed = JSON.parse(s) as { title?: string; questions?: unknown[] };
  } catch {
    parsed = { questions: salvageArray(s) };
  }
  const qs = (parsed.questions ?? [])
    .map((q, i) => normalizeQuestion(q, i))
    .filter((q): q is OcrDraftQuestion => Boolean(q))
    .slice(0, 12);
  if (qs.length < 2) throw new Error("Ảnh chưa đủ câu trắc nghiệm — thử ảnh rõ, đủ sáng, thẳng trang.");
  return {
    title: (parsed.title ?? fallbackTitle).toString().slice(0, 80) || fallbackTitle,
    questions: qs,
  };
}

async function chatJson(apiKey: string, body: Record<string, unknown>) {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(describeApiError(res.status, text));

  const json = JSON.parse(text) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "{}";
}

export const listMyDocs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql.query<{
      id: string;
      title: string;
      mime: string;
      size_bytes: number;
      created_at: string;
      ocr_at: string | null;
      ocr_exam_id: string | null;
      ocr_count: number | string | null;
    }>(
      `select id, title, mime, size_bytes, created_at::text as created_at,
              ocr_at::text as ocr_at, ocr_exam_id,
              coalesce(jsonb_array_length(ocr_json->'questions'), 0) as ocr_count
       from documents where user_id = $1 order by created_at desc`,
      [context.userId],
    );
    return rows.map(mapDoc);
  });

export const uploadDoc = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; mime: string; dataB64: string }) => input)
  .handler(async ({ context, data }) => {
    const raw = data.dataB64.replace(/^data:[^;]+;base64,/, "");
    const size = Math.ceil((raw.length * 3) / 4);
    if (size > MAX) throw new Error("File quá lớn (tối đa ~1.3MB sau khi nén)");
    const title = data.title.trim().slice(0, 80) || "Tài liệu";
    const mime = data.mime.slice(0, 80) || "application/octet-stream";
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql.query(
      `insert into documents (id, user_id, title, mime, size_bytes, data_b64)
       values ($1,$2,$3,$4,$5,$6)`,
      [id, context.userId, title, mime, size, raw],
    );
    return { id };
  });

export const getDoc = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const rows = await sql.query<{
      id: string;
      title: string;
      mime: string;
      size_bytes: number;
      data_b64: string;
      created_at: string;
      ocr_json: OcrDraft | string | null;
      ocr_exam_id: string | null;
    }>(
      `select id, title, mime, size_bytes, data_b64, created_at::text as created_at, ocr_json, ocr_exam_id
       from documents where id = $1 and user_id = $2`,
      [id, context.userId],
    );
    const r = rows[0];
    if (!r) return null;
    let ocr: OcrDraft | null = null;
    if (r.ocr_json) {
      ocr = typeof r.ocr_json === "string" ? (JSON.parse(r.ocr_json) as OcrDraft) : r.ocr_json;
    }
    return {
      id: r.id,
      title: r.title,
      mime: r.mime,
      sizeBytes: Number(r.size_bytes),
      dataB64: r.data_b64,
      createdAt: r.created_at,
      ocr,
      ocrExamId: r.ocr_exam_id,
    };
  });

export const deleteDoc = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql.query(`delete from documents where id = $1 and user_id = $2`, [id, context.userId]);
    return { ok: true as const };
  });

export const extractExamFromDoc = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { docId: string; force?: boolean }) => input)
  .handler(async ({ context, data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) throw new Error("Linh khí AI chưa sẵn — thử lại sau");
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const rows = await sql.query<{
      title: string;
      mime: string;
      data_b64: string;
      ocr_json: OcrDraft | string | null;
    }>(
      `select title, mime, data_b64, ocr_json from documents where id = $1 and user_id = $2`,
      [data.docId, context.userId],
    );
    const doc = rows[0];
    if (!doc) throw new Error("Không tìm thấy tài liệu");
    if (!data.force && doc.ocr_json) {
      const cached = typeof doc.ocr_json === "string" ? (JSON.parse(doc.ocr_json) as OcrDraft) : doc.ocr_json;
      if (cached?.questions?.length) return cached;
    }
    if (!doc.mime.startsWith("image/")) {
      throw new Error("Thiên Nhãn đọc ảnh đề (JPG/PNG/WEBP). Chụp trang PDF rồi cất ảnh.");
    }

    const payload = {
      model: "grok-4.5",
      max_tokens: 3500,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: OCR_SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: `Bóc đề: ${doc.title}` },
            {
              type: "image_url",
              image_url: { url: `data:${doc.mime};base64,${doc.data_b64}`, detail: "high" },
            },
          ],
        },
      ],
    };

    let raw = await chatJson(apiKey, payload);
    let draft: OcrDraft;
    try {
      draft = parseDraft(raw, doc.title);
    } catch (first) {
      raw = await chatJson(apiKey, {
        model: "grok-4.5",
        max_tokens: 2500,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: OCR_SYSTEM },
          {
            role: "user",
            content: `Sửa thành JSON hợp lệ, giữ nguyên câu hỏi. Không markdown.\n${raw.slice(0, 12000)}`,
          },
        ],
      });
      try {
        draft = parseDraft(raw, doc.title);
      } catch {
        throw first instanceof Error ? first : new Error("Không đọc được trận pháp từ ảnh");
      }
    }

    await sql.query(
      `update documents set ocr_json = $3::jsonb, ocr_at = now() where id = $1 and user_id = $2`,
      [data.docId, context.userId, JSON.stringify(draft)],
    );
    return draft;
  });

async function insertExamFromDraft(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  title: string,
  qs: OcrDraftQuestion[],
  source: string,
) {
  const id = `ocr-${crypto.randomUUID()}`;
  const t = title.trim().slice(0, 80) || "Đề bóc tách";
  await sql.query(
    `insert into exams (id, title, exam_type, duration_seconds, total_questions, description, author_name, source_label, is_public, created_by)
     values ($1,$2,'FORGED',$3,$4,$5,$6,$7, true, $8)`,
    [
      id,
      t,
      Math.max(600, qs.length * 90),
      qs.length,
      `${source} · ${qs.length} câu`,
      "Thiên Nhãn OCR",
      source,
      userId,
    ],
  );
  for (let i = 0; i < qs.length; i++) {
    const q = qs[i]!;
    await sql.query(
      `insert into questions
        (id, exam_id, order_index, content, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty, score)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        `${id}-${i}`,
        id,
        i + 1,
        q.content.slice(0, 800),
        q.optionA.slice(0, 240),
        q.optionB.slice(0, 240),
        q.optionC.slice(0, 240),
        q.optionD.slice(0, 240),
        asKey(q.correct),
        (q.explanation ?? "").slice(0, 600),
        (q.topic || "Tổng hợp").slice(0, 40),
        asDiff(q.difficulty),
        Number(q.score) || 0.5,
      ],
    );
  }
  return { examId: id, title: t, count: qs.length };
}

export const saveOcrExam = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { docId: string; title: string; questions: OcrDraftQuestion[] }) => input)
  .handler(async ({ context, data }) => {
    const qs = data.questions.slice(0, 12).filter((q) => q.content.trim());
    if (qs.length < 2) throw new Error("Cần ít nhất 2 câu để lập đề");
    const sql = await getSql();
    const owned = await sql.query<{ id: string }>(
      `select id from documents where id = $1 and user_id = $2`,
      [data.docId, context.userId],
    );
    if (!owned[0]) throw new Error("Không tìm thấy tài liệu");
    const saved = await insertExamFromDraft(sql, context.userId, data.title, qs, "OCR Tàng Thư");
    await sql.query(
      `update documents set ocr_exam_id = $3, ocr_json = $4::jsonb where id = $1 and user_id = $2`,
      [data.docId, context.userId, saved.examId, JSON.stringify({ title: saved.title, questions: qs })],
    );
    return saved;
  });

export const savePastedExam = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; questions: OcrDraftQuestion[] }) => input)
  .handler(async ({ context, data }) => {
    const qs = data.questions.slice(0, 12).filter((q) => q.content.trim());
    if (qs.length < 2) throw new Error("Cần ít nhất 2 câu để lập đề");
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    return insertExamFromDraft(sql, context.userId, data.title, qs, "Dán chữ Tàng Thư");
  });

