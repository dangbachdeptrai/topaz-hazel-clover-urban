import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { TutorMessage } from "@/lib/types";

const SYSTEM = `Bạn là Linh Sư Toán Đạo trong Linh Toán Các. Trả lời tiếng Việt, rõ, từng bước.
Dùng LaTeX trong $...$ khi viết công thức. Không bịa định lý. Nếu thiếu dữ liệu, hỏi lại.`;

export const getTutorThread = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql.query<{ messages: unknown }>(
      `select messages from tutor_threads where user_id = $1`,
      [context.userId],
    );
    const raw = rows[0]?.messages;
    const messages = (typeof raw === "string" ? JSON.parse(raw) : raw) as TutorMessage[] | undefined;
    return messages ?? [];
  });

export const askTutor = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { prompt: string }) => input)
  .handler(async ({ context, data }) => {
    const prompt = data.prompt.trim().slice(0, 2000);
    if (!prompt) throw new Error("Hãy nêu câu hỏi");
    const apiKey = process.env.XAI_API_KEY;
    const sql = await getSql();
    const prev = await sql.query<{ messages: unknown }>(
      `select messages from tutor_threads where user_id = $1`,
      [context.userId],
    );
    const history = ((typeof prev[0]?.messages === "string"
      ? JSON.parse(prev[0].messages)
      : prev[0]?.messages) ?? []) as TutorMessage[];
    const userMsg: TutorMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
    };
    let replyText: string;
    if (!apiKey) {
      replyText =
        "Luyện đan lò chưa kết nối linh khí AI trên máy này. Hãy nêu đề, mình sẽ giải khi lò sáng — hoặc thử lại sau.";
    } else {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 900,
          messages: [
            { role: "system", content: SYSTEM },
            ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: prompt },
          ],
        }),
      });
      if (!res.ok) {
        replyText = `Linh Sư bị nhiễu (${res.status}). Thử lại sau.`;
      } else {
        const body = (await res.json()) as { choices: { message: { content: string } }[] };
        replyText = body.choices[0]?.message.content ?? "…";
      }
    }
    const assistant: TutorMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: replyText,
    };
    const next = [...history, userMsg, assistant].slice(-24);
    await sql.query(
      `insert into tutor_threads (id, user_id, messages, updated_at)
       values ($1,$2,$3::jsonb, now())
       on conflict (user_id) do update set messages = excluded.messages, updated_at = now()`,
      [crypto.randomUUID(), context.userId, JSON.stringify(next)],
    );
    return next;
  });
