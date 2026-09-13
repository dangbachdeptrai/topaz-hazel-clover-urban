import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { applyMatchRewards, equippedPerks, ensureProfile, perkBonus } from "@/lib/server/cultivation";
import { RANKED_ELO_BAND } from "@/lib/realms";
import { insertShuffledExam } from "@/lib/server/exams";
import { ensureSeed } from "@/lib/server/seed";
import type { AnswerKey, PvpMatch, PvpMode, PvpStatus } from "@/lib/types";
import { roomCode } from "@/lib/utils";

const BOTS = [
  { id: "bot:thanh-van", name: "Thanh Vân Tử" },
  { id: "bot:han-suong", name: "Hàn Sương" },
  { id: "bot:liet-hoa", name: "Liệt Hỏa" },
  { id: "bot:bich-hai", name: "Bích Hải" },
  { id: "bot:kim-dan", name: "Kim Đan" },
];
const QUEUE_BOT_MS = 7000;
const BOT_PACE_MS = 11000;
const BOT_ACCURACY = 0.68;
const SHUFFLE_KEY = "__shuffle__";

type MatchRow = {
  id: string;
  exam_id: string;
  exam_title: string;
  player1_id: string;
  player1_name: string;
  player2_id: string | null;
  player2_name: string | null;
  player1_score: string | number;
  player2_score: string | number;
  player1_answers: unknown;
  player2_answers: unknown;
  player1_done: boolean;
  player2_done: boolean;
  start_time: string | null;
  end_time: string | null;
  winner_id: string | null;
  status: PvpStatus;
  room_code: string;
  duration_seconds: number;
  is_bot: boolean;
  total_questions: number;
  mode: PvpMode | null;
  countdown_ends_at: string | null;
  p1_elo_before: number | null;
  p2_elo_before: number | null;
  p1_elo_after: number | null;
  p2_elo_after: number | null;
  p1_exp_gain: number | null;
  p2_exp_gain: number | null;
  countdown_left: number | string | null;
  fight_left: number | string | null;
};

type QueueSpec = {
  examId: string;
  displayName: string;
  shuffle?: boolean;
  topic?: string;
  difficulty?: string;
  questionCount?: number;
  ranked?: boolean;
};

function parseAnswers(raw: unknown): Record<string, AnswerKey> {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, AnswerKey>;
    } catch {
      return {};
    }
  }
  return raw as Record<string, AnswerKey>;
}

function mapMatch(r: MatchRow): PvpMatch {
  const a1 = parseAnswers(r.player1_answers);
  const a2 = parseAnswers(r.player2_answers);
  return {
    id: r.id,
    examId: r.exam_id,
    examTitle: r.exam_title,
    player1Id: r.player1_id,
    player1Name: r.player1_name,
    player2Id: r.player2_id,
    player2Name: r.player2_name,
    player1Score: Number(r.player1_score),
    player2Score: Number(r.player2_score),
    player1Answered: Object.keys(a1).length,
    player2Answered: Object.keys(a2).length,
    player1Done: Boolean(r.player1_done),
    player2Done: Boolean(r.player2_done),
    startTime: r.start_time,
    endTime: r.end_time,
    winnerId: r.winner_id,
    status: r.status,
    roomCode: r.room_code,
    durationSeconds: Number(r.duration_seconds),
    isBot: Boolean(r.is_bot),
    totalQuestions: Number(r.total_questions),
    mode: r.mode === "ranked" || r.mode === "shuffle" ? r.mode : "casual",
    countdownEndsAt: r.countdown_ends_at,
    countdownLeft: Math.max(0, Math.ceil(Number(r.countdown_left ?? 0))),
    fightLeft: Math.max(0, Math.ceil(Number(r.fight_left ?? r.duration_seconds))),
    p1EloBefore: r.p1_elo_before == null ? null : Number(r.p1_elo_before),
    p2EloBefore: r.p2_elo_before == null ? null : Number(r.p2_elo_before),
    p1EloAfter: r.p1_elo_after == null ? null : Number(r.p1_elo_after),
    p2EloAfter: r.p2_elo_after == null ? null : Number(r.p2_elo_after),
    p1ExpGain: Number(r.p1_exp_gain ?? 0),
    p2ExpGain: Number(r.p2_exp_gain ?? 0),
  };
}

const MATCH_SELECT = `
  select m.id, m.exam_id, e.title as exam_title,
         m.player1_id, m.player1_name, m.player2_id, m.player2_name,
         m.player1_score, m.player2_score, m.player1_answers, m.player2_answers,
         m.player1_done, m.player2_done,
         m.start_time::text as start_time, m.end_time::text as end_time,
         m.winner_id, m.status, m.room_code, m.duration_seconds, m.is_bot,
         e.total_questions, coalesce(m.mode, 'casual') as mode,
         m.countdown_ends_at::text as countdown_ends_at,
         greatest(0, ceil(extract(epoch from (
           coalesce(m.countdown_ends_at, m.start_time) - now()
         ))))::int as countdown_left,
         case
           when coalesce(m.countdown_ends_at, m.start_time) is null then m.duration_seconds
           when coalesce(m.countdown_ends_at, m.start_time) > now() then m.duration_seconds
           else greatest(0, ceil(extract(epoch from (
             m.start_time + (m.duration_seconds * interval '1 second') - now()
           ))))::int
         end as fight_left,
         m.p1_elo_before, m.p2_elo_before, m.p1_elo_after, m.p2_elo_after,
         m.p1_exp_gain, m.p2_exp_gain
  from pvp_matches m
  join exams e on e.id = m.exam_id
`;

function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}

async function resolveExamId(
  sql: Awaited<ReturnType<typeof getSql>>,
  spec: { examId: string; topic?: string; difficulty?: string; questionCount?: number; userId: string },
) {
  if (spec.examId !== SHUFFLE_KEY) return spec.examId || "pvp-blitz";
  return insertShuffledExam(sql, {
    topic: spec.topic ?? "",
    difficulty: spec.difficulty ?? "",
    count: spec.questionCount ?? 8,
    createdBy: spec.userId,
  });
}

async function applyBotProgress(sql: Awaited<ReturnType<typeof getSql>>, matchId: string) {
  const rows = await sql.query<{
    id: string;
    exam_id: string;
    is_bot: boolean;
    status: PvpStatus;
    start_time: string | null;
    player2_done: boolean;
    player1_done: boolean;
    player1_score: string | number;
    duration_seconds: number;
    elapsed_s: number | string | null;
  }>(
    `select id, exam_id, is_bot, status, start_time::text as start_time,
            player2_done, player1_done, player1_score, duration_seconds,
            extract(epoch from (now() - start_time)) as elapsed_s
     from pvp_matches where id = $1`,
    [matchId],
  );
  const m = rows[0];
  if (!m || !m.is_bot || m.status !== "in_progress" || !m.start_time) return;
  const elapsedMs = Number(m.elapsed_s) * 1000;
  if (elapsedMs < 0) return;

  const qs = await sql.query<{ id: string; correct_answer: AnswerKey; score: string | number }>(
    `select id, correct_answer, score from questions where exam_id = $1 order by order_index`,
    [m.exam_id],
  );
  const timedOut = elapsedMs >= m.duration_seconds * 1000;
  const shouldAnswer =
    timedOut || m.player1_done
      ? qs.length
      : Math.min(qs.length, Math.floor(elapsedMs / BOT_PACE_MS));

  const answers: Record<string, AnswerKey> = {};
  let score = 0;
  for (let i = 0; i < shouldAnswer; i++) {
    const question = qs[i]!;
    const correct = hash01(`${matchId}:${question.id}`) < BOT_ACCURACY;
    const pick: AnswerKey = correct
      ? question.correct_answer
      : ((["A", "B", "C", "D"].find((x) => x !== question.correct_answer) as AnswerKey) ?? "A");
    answers[question.id] = pick;
    if (correct) score += Number(question.score);
  }
  score = Math.round(score * 100) / 100;
  const botDone = shouldAnswer >= qs.length || timedOut;
  let winner: string | null = null;
  let status: PvpStatus = m.status;
  let end: string | null = null;
  if ((botDone && m.player1_done) || timedOut) {
    status = "completed";
    end = new Date().toISOString();
    const p1 = Number(m.player1_score);
    if (p1 > score) winner = "p1";
    else if (score > p1) winner = "p2";
  }
  await sql.query(
    `update pvp_matches
     set player2_answers = $1::jsonb, player2_score = $2, player2_done = $3,
         status = $4, winner_id = case when $5 = 'p1' then player1_id
                                       when $5 = 'p2' then player2_id else winner_id end,
         end_time = coalesce(end_time, $6::timestamptz)
     where id = $7`,
    [JSON.stringify(answers), score, botDone, status, winner, end, matchId],
  );
  if (status === "completed") await applyMatchRewards(sql, matchId);
}

async function createLiveMatch(
  sql: Awaited<ReturnType<typeof getSql>>,
  spec: {
    examId: string;
    p1Id: string;
    p1Name: string;
    p2Id: string;
    p2Name: string;
    isBot: boolean;
    mode: PvpMode;
    p1Elo: number;
    p2Elo: number;
    duration: number;
  },
): Promise<PvpMatch | null> {
  const id = crypto.randomUUID();
  const code = roomCode();
  await sql.query(
    `insert into pvp_matches
      (id, exam_id, player1_id, player1_name, player2_id, player2_name,
       status, room_code, start_time, countdown_ends_at, duration_seconds, is_bot,
       mode, p1_elo_before, p2_elo_before)
     values ($1,$2,$3,$4,$5,$6,'in_progress',$7,
             now() + interval '5 seconds',
             now() + interval '5 seconds',
             $8,$9,$10,$11,$12)`,
    [
      id, spec.examId, spec.p1Id, spec.p1Name, spec.p2Id, spec.p2Name, code,
      spec.duration, spec.isBot, spec.mode, spec.p1Elo, spec.p2Elo,
    ],
  );
  return fetchMatch(sql, id);
}

async function fetchMatch(sql: Awaited<ReturnType<typeof getSql>>, id: string) {
  const rows = await sql.query<MatchRow>(`${MATCH_SELECT} where m.id = $1`, [id]);
  return rows[0] ? mapMatch(rows[0]) : null;
}

export const joinPvpQueue = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: QueueSpec) => input)
  .handler(async ({ context, data }) => {
    await ensureSeed();
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId, data.displayName);
    const bonus = perkBonus(await equippedPerks(sql, context.userId));
    const duration = 480 + bonus.extraTime;
    const mode: PvpMode = data.ranked ? "ranked" : data.shuffle ? "shuffle" : "casual";
    const storedExam = data.shuffle ? SHUFFLE_KEY : data.examId || "pvp-blitz";
    const topic = data.topic ?? "";
    const difficulty = data.difficulty ?? "";
    const questionCount = data.questionCount ?? 8;

    const waiting = await sql.query<{
      user_id: string;
      user_name: string;
      exam_id: string;
      topic_filter: string | null;
      difficulty_filter: string | null;
      question_count: number | null;
      elo: number | null;
    }>(
      `select user_id, user_name, exam_id,
              coalesce(topic_filter, '') as topic_filter,
              coalesce(difficulty_filter, '') as difficulty_filter,
              coalesce(question_count, 8) as question_count,
              coalesce(elo, 1000) as elo
       from pvp_queue
       where user_id <> $1
         and coalesce(mode, 'casual') = $2
         and ($2 <> 'ranked' or abs(coalesce(elo, 1000) - $3) <= $4)
       order by joined_at asc limit 1`,
      [context.userId, mode, me.elo, RANKED_ELO_BAND],
    );

    if (waiting[0]) {
      const opp = waiting[0];
      await sql.query(`delete from pvp_queue where user_id = $1`, [opp.user_id]);
      const examId = await resolveExamId(sql, {
        examId: opp.exam_id,
        topic: opp.topic_filter ?? topic,
        difficulty: opp.difficulty_filter ?? difficulty,
        questionCount: Number(opp.question_count ?? questionCount),
        userId: context.userId,
      });
      const oppProfile = await ensureProfile(sql, opp.user_id, opp.user_name);
      const match = await createLiveMatch(sql, {
        examId,
        p1Id: context.userId,
        p1Name: data.displayName,
        p2Id: opp.user_id,
        p2Name: opp.user_name,
        isBot: false,
        mode,
        p1Elo: me.elo,
        p2Elo: oppProfile.elo,
        duration,
      });
      return { status: "matched" as const, match };
    }

    await sql.query(
      `insert into pvp_queue
        (user_id, user_name, exam_id, joined_at, topic_filter, difficulty_filter, question_count, mode, elo, realm_id)
       values ($1,$2,$3,now(),$4,$5,$6,$7,$8,$9)
       on conflict (user_id) do update set
         user_name=excluded.user_name, exam_id=excluded.exam_id, joined_at=now(),
         topic_filter=excluded.topic_filter, difficulty_filter=excluded.difficulty_filter,
         question_count=excluded.question_count, mode=excluded.mode, elo=excluded.elo, realm_id=excluded.realm_id`,
      [context.userId, data.displayName, storedExam, topic, difficulty, questionCount, mode, me.elo, me.realmId],
    );
    return { status: "queued" as const, match: null };
  });

export const pollPvpQueue = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const live = await sql.query<MatchRow>(
      `${MATCH_SELECT}
       where m.status in ('waiting','in_progress')
         and (m.player1_id = $1 or m.player2_id = $1)
       order by m.created_at desc limit 1`,
      [context.userId],
    );
    if (live[0]) {
      await sql.query(`delete from pvp_queue where user_id = $1`, [context.userId]);
      return { status: "matched" as const, match: mapMatch(live[0]) };
    }
    const q = await sql.query<{
      exam_id: string;
      user_name: string;
      topic_filter: string | null;
      difficulty_filter: string | null;
      question_count: number | null;
      mode: string | null;
      waited_s: number | string;
    }>(
      `select exam_id, user_name, coalesce(topic_filter,'') as topic_filter,
              coalesce(difficulty_filter,'') as difficulty_filter,
              coalesce(question_count,8) as question_count,
              coalesce(mode,'casual') as mode,
              extract(epoch from (now() - joined_at)) as waited_s
       from pvp_queue where user_id = $1`,
      [context.userId],
    );
    if (!q[0]) return { status: "idle" as const, match: null };
    if (Number(q[0].waited_s) * 1000 < QUEUE_BOT_MS) {
      return { status: "queued" as const, match: null };
    }
    await sql.query(`delete from pvp_queue where user_id = $1`, [context.userId]);
    const examId = await resolveExamId(sql, {
      examId: q[0].exam_id,
      topic: q[0].topic_filter ?? "",
      difficulty: q[0].difficulty_filter ?? "",
      questionCount: Number(q[0].question_count ?? 8),
      userId: context.userId,
    });
    const bot = BOTS[Math.floor(Math.random() * BOTS.length)]!;
    const me = await ensureProfile(sql, context.userId, q[0].user_name);
    const bonus = perkBonus(await equippedPerks(sql, context.userId));
    const mode: PvpMode =
      q[0].mode === "ranked" || q[0].mode === "shuffle" ? q[0].mode : "casual";
    const match = await createLiveMatch(sql, {
      examId,
      p1Id: context.userId,
      p1Name: q[0].user_name,
      p2Id: bot.id,
      p2Name: bot.name,
      isBot: true,
      mode,
      p1Elo: me.elo,
      p2Elo: 1000,
      duration: 480 + bonus.extraTime,
    });
    return { status: "matched" as const, match };
  });

export const leavePvpQueue = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql.query(`delete from pvp_queue where user_id = $1`, [context.userId]);
    return { ok: true as const };
  });

export const createPvpRoom = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: QueueSpec) => input)
  .handler(async ({ context, data }) => {
    await ensureSeed();
    const sql = await getSql();
    const examId = await resolveExamId(sql, {
      examId: data.shuffle ? SHUFFLE_KEY : data.examId || "pvp-blitz",
      topic: data.topic ?? "",
      difficulty: data.difficulty ?? "",
      questionCount: data.questionCount ?? 8,
      userId: context.userId,
    });
    const me = await ensureProfile(sql, context.userId, data.displayName);
    const bonus = perkBonus(await equippedPerks(sql, context.userId));
    const mode: PvpMode = data.ranked ? "ranked" : data.shuffle ? "shuffle" : "casual";
    const id = crypto.randomUUID();
    const code = roomCode();
    await sql.query(
      `insert into pvp_matches
        (id, exam_id, player1_id, player1_name, status, room_code, duration_seconds, is_bot, mode, p1_elo_before)
       values ($1,$2,$3,$4,'waiting',$5,$6,false,$7,$8)`,
      [id, examId, context.userId, data.displayName, code, 480 + bonus.extraTime, mode, me.elo],
    );
    return fetchMatch(sql, id);
  });

export const joinPvpRoom = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { roomCode: string; displayName: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const code = data.roomCode.trim().toUpperCase();
    const rows = await sql.query<{ id: string; player1_id: string; status: PvpStatus }>(
      `select id, player1_id, status from pvp_matches where room_code = $1`,
      [code],
    );
    const m = rows[0];
    if (!m) throw new Error("Không tìm thấy phòng");
    if (m.player1_id === context.userId) return fetchMatch(sql, m.id);
    if (m.status !== "waiting") throw new Error("Phòng đã bắt đầu hoặc đã đóng");
    const me = await ensureProfile(sql, context.userId, data.displayName);
    await sql.query(
      `update pvp_matches
       set player2_id = $1, player2_name = $2, status = 'in_progress',
           start_time = now() + interval '5 seconds',
           countdown_ends_at = now() + interval '5 seconds',
           p2_elo_before = $4
       where id = $3 and status = 'waiting'`,
      [context.userId, data.displayName, m.id, me.elo],
    );
    return fetchMatch(sql, m.id);
  });

export const getPvpMatch = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((matchId: string) => matchId)
  .handler(async ({ context, data: matchId }) => {
    const sql = await getSql();
    await applyBotProgress(sql, matchId);
    const match = await fetchMatch(sql, matchId);
    if (!match) return null;
    if (match.player1Id !== context.userId && match.player2Id !== context.userId) {
      throw new Error("Unauthorized");
    }
    return match;
  });

export const submitPvpAnswer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { matchId: string; questionId: string; answer: AnswerKey }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await applyBotProgress(sql, data.matchId);
    const rows = await sql.query<MatchRow>(`${MATCH_SELECT} where m.id = $1`, [data.matchId]);
    const m = rows[0];
    if (!m) throw new Error("Không tìm thấy trận");
    if (m.status !== "in_progress") return mapMatch(m);
    if (mapMatch(m).countdownLeft > 0) throw new Error("Trận chưa khai đấu");
    const isP1 = m.player1_id === context.userId;
    const isP2 = m.player2_id === context.userId;
    if (!isP1 && !isP2) throw new Error("Unauthorized");
    const q = await sql.query<{ correct_answer: AnswerKey; score: string | number }>(
      `select correct_answer, score from questions where id = $1 and exam_id = $2`,
      [data.questionId, m.exam_id],
    );
    if (!q[0]) throw new Error("Câu hỏi không hợp lệ");
    const colAns = isP1 ? "player1_answers" : "player2_answers";
    const colScore = isP1 ? "player1_score" : "player2_score";
    const current = parseAnswers(isP1 ? m.player1_answers : m.player2_answers);
    if (current[data.questionId]) return mapMatch(m);
    current[data.questionId] = data.answer;
    const add = data.answer === q[0].correct_answer ? Number(q[0].score) : 0;
    const nextScore =
      Math.round((Number(isP1 ? m.player1_score : m.player2_score) + add) * 100) / 100;
    await sql.query(`update pvp_matches set ${colAns} = $1::jsonb, ${colScore} = $2 where id = $3`, [
      JSON.stringify(current),
      nextScore,
      data.matchId,
    ]);
    return fetchMatch(sql, data.matchId);
  });

export const finishPvp = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((matchId: string) => matchId)
  .handler(async ({ context, data: matchId }) => {
    const sql = await getSql();
    await applyBotProgress(sql, matchId);
    const rows = await sql.query<MatchRow>(`${MATCH_SELECT} where m.id = $1`, [matchId]);
    const m = rows[0];
    if (!m) throw new Error("Không tìm thấy trận");
    const isP1 = m.player1_id === context.userId;
    const isP2 = m.player2_id === context.userId;
    if (!isP1 && !isP2) throw new Error("Unauthorized");
    if (isP1) {
      await sql.query(`update pvp_matches set player1_done = true where id = $1`, [matchId]);
    } else {
      await sql.query(`update pvp_matches set player2_done = true where id = $1`, [matchId]);
    }
    const after = await sql.query<MatchRow>(`${MATCH_SELECT} where m.id = $1`, [matchId]);
    const a = after[0]!;
    const live = mapMatch(a);
    const bothDone = a.player1_done && a.player2_done;
    const timedOut = live.countdownLeft <= 0 && live.fightLeft <= 0;
    if ((bothDone || timedOut) && a.status === "in_progress") {
      const s1 = Number(a.player1_score);
      const s2 = Number(a.player2_score);
      let winner: string | null = null;
      if (s1 > s2) winner = a.player1_id;
      else if (s2 > s1) winner = a.player2_id;
      await sql.query(
        `update pvp_matches set status = 'completed', end_time = now(), winner_id = $1 where id = $2`,
        [winner, matchId],
      );
      await applyMatchRewards(sql, matchId);
    }
    await applyBotProgress(sql, matchId);
    return fetchMatch(sql, matchId);
  });

export const listMyPvp = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql.query<MatchRow>(
      `${MATCH_SELECT}
       where m.status = 'completed' and (m.player1_id = $1 or m.player2_id = $1)
       order by m.end_time desc limit 20`,
      [context.userId],
    );
    return rows.map(mapMatch);
  });
