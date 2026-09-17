import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { equippedPerks, ensureProfile, grantTowerClear, perkBonus } from "@/lib/server/cultivation";
import { ensureSeed } from "@/lib/server/seed";
import type { AnswerKey, QuestionPublic, TowerRun } from "@/lib/types";
import { answerKey } from "@/lib/utils";

const FLOOR_SECONDS = 90;
const QS_PER_FLOOR = 5;

function floorDiff(floor: number): string[] {
  if (floor <= 3) return ["easy"];
  if (floor <= 6) return ["easy", "medium"];
  if (floor <= 9) return ["medium", "hard"];
  return ["hard"];
}

async function remainingOf(endsAt: string) {
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1000));
}

export const getTowerStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    const live = await sql.query<{
      id: string;
      floor: number;
      status: TowerRun["status"];
      lives: number;
      question_ids: unknown;
      q_index: number;
      correct_count: number;
      ends_at: string;
    }>(
      `select id, floor, status, lives, question_ids, q_index, correct_count, ends_at::text as ends_at
       from tower_runs where user_id = $1 and status = 'in_progress'
       order by started_at desc limit 1`,
      [context.userId],
    );
    return { best: me.towerBestFloor, live: live[0] ? await hydrate(sql, live[0], context.userId) : null };
  });

async function hydrate(
  sql: Awaited<ReturnType<typeof getSql>>,
  row: {
    id: string;
    floor: number;
    status: TowerRun["status"];
    lives: number;
    question_ids: unknown;
    q_index: number;
    correct_count: number;
    ends_at: string;
  },
  userId: string,
): Promise<{ run: TowerRun; questions: QuestionPublic[] }> {
  const ids = (typeof row.question_ids === "string"
    ? JSON.parse(row.question_ids)
    : row.question_ids) as string[];
  const rem = await remainingOf(row.ends_at);
  if (rem <= 0 && row.status === "in_progress") {
    await sql.query(
      `update tower_runs set status='failed', finished_at=now() where id=$1 and user_id=$2`,
      [row.id, userId],
    );
    row.status = "failed";
  }
  const qs = await sql.query<{
    id: string;
    order_index: number;
    content: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
    topic: string;
    difficulty: QuestionPublic["difficulty"];
    score: string | number;
  }>(
    `select id, order_index, content, option_a, option_b, option_c, option_d, correct_answer, topic, difficulty, score
     from questions where id = any($1::text[])`,
    [ids],
  );
  const byId = new Map(qs.map((q) => [q.id, q]));
  const bonus = perkBonus(await equippedPerks(sql, userId));
  const questions: QuestionPublic[] = ids
    .map((id, i) => {
      const q = byId.get(id);
      if (!q) return null;
      const wrong = (["A", "B", "C", "D"] as const).filter((k) => k !== answerKey(q.correct_answer));

      const faded = bonus.eliminate ? wrong[i % wrong.length] : null;
      return {
        id: q.id,
        orderIndex: i + 1,
        content: q.content,
        optionA: q.option_a,
        optionB: q.option_b,
        optionC: q.option_c,
        optionD: q.option_d,
        topic: q.topic,
        difficulty: q.difficulty,
        score: Number(q.score),
        fadedOption: faded ?? null,
      };
    })
    .filter((x): x is QuestionPublic => Boolean(x));

  return {
    run: {
      id: row.id,
      floor: Number(row.floor),
      status: row.status,
      lives: Number(row.lives),
      questionIds: ids,
      index: Number(row.q_index),
      correct: Number(row.correct_count),
      endsAt: row.ends_at,
      remaining: rem,
    },
    questions,
  };
}

export const startTowerFloor = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((floor: number) => floor)
  .handler(async ({ context, data: floor }) => {
    await ensureSeed();
    if (floor < 1 || floor > 10) throw new Error("Tầng không hợp lệ");
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    if (floor > me.towerBestFloor + 1) throw new Error("Phải vượt tầng trước");
    await sql.query(
      `update tower_runs set status='failed', finished_at=now()
       where user_id=$1 and status='in_progress'`,
      [context.userId],
    );
    const diffs = floorDiff(floor);
    const pool = await sql.query<{ id: string }>(
      `select id from questions where difficulty = any($1::text[]) order by random() limit $2`,
      [diffs, QS_PER_FLOOR],
    );
    if (pool.length < 3) throw new Error("Kho đề tầng này chưa đủ");
    const bonus = perkBonus(await equippedPerks(sql, context.userId));
    const id = crypto.randomUUID();
    const secs = FLOOR_SECONDS + (floor === 10 ? 30 : 0) + bonus.extraTime;
    await sql.query(
      `insert into tower_runs (id, user_id, floor, question_ids, ends_at)
       values ($1,$2,$3,$4::jsonb, now() + ($5 * interval '1 second'))`,
      [id, context.userId, floor, JSON.stringify(pool.map((p) => p.id)), secs],
    );
    const row = await sql.query<{
      id: string;
      floor: number;
      status: TowerRun["status"];
      lives: number;
      question_ids: unknown;
      q_index: number;
      correct_count: number;
      ends_at: string;
    }>(
      `select id, floor, status, lives, question_ids, q_index, correct_count, ends_at::text as ends_at
       from tower_runs where id = $1`,
      [id],
    );
    return hydrate(sql, row[0]!, context.userId);
  });

export const answerTower = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { runId: string; questionId: string; answer: AnswerKey }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql.query<{
      id: string;
      floor: number;
      status: TowerRun["status"];
      lives: number;
      question_ids: unknown;
      q_index: number;
      correct_count: number;
      ends_at: string;
      answers: unknown;
    }>(
      `select id, floor, status, lives, question_ids, q_index, correct_count,
              ends_at::text as ends_at, answers
       from tower_runs where id = $1 and user_id = $2`,
      [data.runId, context.userId],
    );
    const row = rows[0];
    if (!row) throw new Error("Không tìm thấy lượt leo tháp");
    if (row.status !== "in_progress") return hydrate(sql, row, context.userId);
    if (await remainingOf(row.ends_at) <= 0) {
      await sql.query(`update tower_runs set status='failed', finished_at=now() where id=$1`, [row.id]);
      row.status = "failed";
      return hydrate(sql, row, context.userId);
    }
    const ids = (typeof row.question_ids === "string"
      ? JSON.parse(row.question_ids)
      : row.question_ids) as string[];
    const currentId = ids[Number(row.q_index)];
    if (currentId !== data.questionId) throw new Error("Không đúng câu hiện tại");
    const q = await sql.query<{ correct_answer: AnswerKey }>(
      `select correct_answer from questions where id = $1`,
      [data.questionId],
    );
    const ok = q[0] ? answerKey(q[0].correct_answer) === data.answer : false;

    const answers = (typeof row.answers === "string" ? JSON.parse(row.answers) : row.answers) as Record<
      string,
      AnswerKey
    >;
    answers[data.questionId] = data.answer;
    if (!ok) {
      await sql.query(
        `update tower_runs set status='failed', answers=$2::jsonb, finished_at=now() where id=$1`,
        [row.id, JSON.stringify(answers)],
      );
      row.status = "failed";
      return { ...(await hydrate(sql, row, context.userId)), correct: false as const, reward: null };
    }
    const nextIndex = Number(row.q_index) + 1;
    const correct = Number(row.correct_count) + 1;
    const cleared = nextIndex >= ids.length;
    await sql.query(
      `update tower_runs set q_index=$2, correct_count=$3, answers=$4::jsonb, status=$5,
              finished_at = case when $5='cleared' then now() else finished_at end
       where id=$1`,
      [row.id, nextIndex, correct, JSON.stringify(answers), cleared ? "cleared" : "in_progress"],
    );
    row.q_index = nextIndex;
    row.correct_count = correct;
    row.status = cleared ? "cleared" : "in_progress";
    const reward = cleared ? await grantTowerClear(sql, context.userId, Number(row.floor)) : null;
    return { ...(await hydrate(sql, row, context.userId)), correct: true as const, reward };
  });
