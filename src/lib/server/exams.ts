import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { equippedPerks, perkBonus } from "@/lib/server/cultivation";
import { ensureSeed, insertShuffledExam } from "@/lib/server/seed";
import type { AnswerKey, Difficulty, Exam, ExamAttempt, ExamType, QuestionPublic } from "@/lib/types";
import { answerKey } from "@/lib/utils";

function mapExam(r: {
  id: string;
  title: string;
  exam_type: string;
  duration_seconds: number;
  total_questions: number;
  description: string;
  author_name: string;
  source_label: string;
  is_public: boolean;
}): Exam {
  return {
    id: r.id,
    title: r.title,
    examType: r.exam_type as ExamType,
    durationSeconds: Number(r.duration_seconds),
    totalQuestions: Number(r.total_questions),
    description: r.description,
    authorName: r.author_name,
    sourceLabel: r.source_label,
    isPublic: Boolean(r.is_public),
  };
}

export { insertShuffledExam };

export const listExams = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql.query<Parameters<typeof mapExam>[0]>(
    `select id, title, exam_type, duration_seconds, total_questions, description, author_name, source_label, is_public
     from exams where is_public = true and exam_type in ('VACT','THPTQG','TSA','PVP','FORGED')
     order by exam_type, title`,
  );
  return rows.map(mapExam);
});

export const getExam = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await ensureSeed();
    const sql = await getSql();
    const rows = await sql.query<Parameters<typeof mapExam>[0]>(
      `select id, title, exam_type, duration_seconds, total_questions, description, author_name, source_label, is_public
       from exams where id = $1`,
      [id],
    );
    return rows[0] ? mapExam(rows[0]) : null;
  });

function keyOf(v: unknown): AnswerKey {
  return answerKey(v);
}

function fadeWrong(q: {
  id: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}): AnswerKey | null {
  const correct = keyOf(q.correct_answer);
  const wrong = (["A", "B", "C", "D"] as const).filter((k) => k !== correct);
  let h = 2166136261;
  for (let i = 0; i < q.id.length; i++) h = Math.imul(h ^ q.id.charCodeAt(i), 16777619);
  return wrong[(h >>> 0) % wrong.length] ?? null;
}

export const getQuestionsPublic = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { examId: string; applyPerks?: boolean }) => input)
  .handler(async ({ context, data }) => {
    await ensureSeed();
    const sql = await getSql();
    const rows = await sql.query<{
      id: string;
      order_index: number;
      content: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      correct_answer: string;
      topic: string;
      difficulty: Difficulty;
      score: string | number;
    }>(
      `select id, order_index, content, option_a, option_b, option_c, option_d, correct_answer, topic, difficulty, score
       from questions where exam_id = $1 order by order_index`,
      [data.examId],
    );
    const bonus = data.applyPerks
      ? perkBonus(await equippedPerks(sql, context.userId))
      : perkBonus([]);
    return rows.map((r): QuestionPublic => ({
      id: r.id,
      orderIndex: Number(r.order_index),
      content: r.content,
      optionA: r.option_a,
      optionB: r.option_b,
      optionC: r.option_c,
      optionD: r.option_d,
      topic: r.topic,
      difficulty: r.difficulty,
      score: Number(r.score),
      fadedOption: bonus.eliminate ? fadeWrong(r) : null,
    }));
  });

export const listQuestionTopics = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql.query<{ topic: string }>(
    `select distinct topic from questions where topic <> '' order by topic`,
  );
  return rows.map((r) => r.topic);
});

export const startAttempt = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((examId: string) => examId)
  .handler(async ({ context, data: examId }) => {
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql.query(
      `insert into exam_attempts (id, exam_id, user_id) values ($1,$2,$3)`,
      [id, examId, context.userId],
    );
    return { attemptId: id };
  });

export const submitAttempt = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { attemptId: string; answers: Record<string, AnswerKey> }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const att = await sql.query<{ exam_id: string; started_at: string }>(
      `select exam_id, started_at::text as started_at from exam_attempts where id = $1 and user_id = $2`,
      [data.attemptId, context.userId],
    );
    if (!att[0]) throw new Error("Không tìm thấy bài làm");
    const qs = await sql.query<{ id: string; correct_answer: AnswerKey; score: string | number }>(
      `select id, correct_answer, score from questions where exam_id = $1`,
      [att[0].exam_id],
    );
    let score = 0;
    for (const q of qs) {
      if (data.answers[q.id] === keyOf(q.correct_answer)) score += Number(q.score);

    }
    score = Math.round(score * 100) / 100;
    const spent = Math.max(
      0,
      Math.floor((Date.now() - new Date(att[0].started_at).getTime()) / 1000),
    );
    await sql.query(
      `update exam_attempts set answers=$1::jsonb, score=$2, submitted_at=now(), time_spent_seconds=$3
       where id=$4 and user_id=$5`,
      [JSON.stringify(data.answers), score, spent, data.attemptId, context.userId],
    );
    return { score, total: qs.length };
  });

export const getAttemptResult = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((attemptId: string) => attemptId)
  .handler(async ({ context, data: attemptId }) => {
    const sql = await getSql();
    const rows = await sql.query<{
      id: string;
      exam_id: string;
      title: string;
      score: string | number | null;
      answers: unknown;
    }>(
      `select a.id, a.exam_id, e.title, a.score, a.answers
       from exam_attempts a join exams e on e.id = a.exam_id
       where a.id = $1 and a.user_id = $2`,
      [attemptId, context.userId],
    );
    const r = rows[0];
    if (!r) return null;
    const qs = await sql.query<{
      id: string;
      content: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      correct_answer: AnswerKey;
      explanation: string;
    }>(
      `select id, content, option_a, option_b, option_c, option_d, correct_answer, explanation
       from questions where exam_id = $1 order by order_index`,
      [r.exam_id],
    );
    const answers = (typeof r.answers === "string" ? JSON.parse(r.answers) : r.answers) as Record<
      string,
      AnswerKey
    >;
    return {
      id: r.id,
      examId: r.exam_id,
      examTitle: r.title,
      score: Number(r.score ?? 0),
      items: qs.map((q) => ({
        ...q,
        picked: answers[q.id] ?? null,
        ok: answers[q.id] === keyOf(q.correct_answer),
        correct_answer: keyOf(q.correct_answer),
      })),
    };
  });

export const listMyAttempts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql.query<{
      id: string;
      exam_id: string;
      title: string;
      exam_type: ExamType;
      score: string | number | null;
      submitted_at: string | null;
    }>(
      `select a.id, a.exam_id, e.title, e.exam_type, a.score, a.submitted_at::text as submitted_at
       from exam_attempts a join exams e on e.id = a.exam_id
       where a.user_id = $1 and a.submitted_at is not null
       order by a.submitted_at desc limit 20`,
      [context.userId],
    );
    return rows.map(
      (r): ExamAttempt => ({
        id: r.id,
        examId: r.exam_id,
        examTitle: r.title,
        examType: r.exam_type,
        score: r.score == null ? null : Number(r.score),
        submittedAt: r.submitted_at,
      }),
    );
  });
