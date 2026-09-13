import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { ensureProfile } from "@/lib/server/cultivation";
import type { AnswerKey, Difficulty } from "@/lib/types";

type ForgedQ = {
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: AnswerKey;
  explanation: string;
  topic: string;
  difficulty: Difficulty;
  score: number;
};

export const forgeExam = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { prompt: string }) => input)
  .handler(async ({ context, data }) => {
    const prompt = data.prompt.trim().slice(0, 800);
    if (prompt.length < 8) throw new Error("Mô tả đề cụ thể hơn (chủ đề, số câu, độ khó)");
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) throw new Error("Luyện Đan Lô chưa có linh khí AI");
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 2500,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'Sinh đề trắc nghiệm toán tiếng Việt. Trả JSON: {"title":"...","questions":[{"content":"... dùng $latex$","optionA":"","optionB":"","optionC":"","optionD":"","correct":"A|B|C|D","explanation":"","topic":"","difficulty":"easy|medium|hard","score":0.5}]}. 6-10 câu.',
          },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Lò đan lỗi ${res.status}`);
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    const raw = body.choices[0]?.message.content ?? "{}";
    let parsed: { title?: string; questions?: ForgedQ[] };
    try {
      parsed = JSON.parse(raw) as { title?: string; questions?: ForgedQ[] };
    } catch {
      throw new Error("Không đọc được trận pháp từ AI");
    }
    const qs = (parsed.questions ?? []).slice(0, 10);
    if (qs.length < 4) throw new Error("AI sinh quá ít câu — thử prompt khác");
    const id = `forge-${crypto.randomUUID()}`;
    const title = (parsed.title ?? "Đề luyện đan").slice(0, 80);
    await sql.query(
      `insert into exams (id, title, exam_type, duration_seconds, total_questions, description, author_name, source_label, is_public, created_by)
       values ($1,$2,'FORGED',900,$3,$4,$5,'Luyện Đan', true, $6)`,
      [id, title, qs.length, prompt.slice(0, 200), "Luyện Đan Lô", context.userId],
    );
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i]!;
      const correct = (["A", "B", "C", "D"].includes(q.correct) ? q.correct : "A") as AnswerKey;
      await sql.query(
        `insert into questions
          (id, exam_id, order_index, content, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty, score)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          `${id}-${i}`,
          id,
          i + 1,
          q.content || "Câu hỏi",
          q.optionA || "A",
          q.optionB || "B",
          q.optionC || "C",
          q.optionD || "D",
          correct,
          q.explanation || "",
          q.topic || "Tổng hợp",
          q.difficulty || "medium",
          Number(q.score) || 0.5,
        ],
      );
    }
    return { examId: id, title, count: qs.length };
  });

