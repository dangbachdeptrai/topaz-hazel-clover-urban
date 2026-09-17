import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  BR_BOTS,
  BR_CAPACITY,
  BR_COUNTDOWN_SECONDS,
  BR_QUEUE_FILL_MS,
  BR_QUESTION_COUNT,
  BR_ROUND_SECONDS,
  brRewards,
} from "@/lib/catalog";
import { getSql } from "@/lib/db";
import { equippedPerks, ensureProfile, grantBrPlacement, perkBonus } from "@/lib/server/cultivation";
import { insertShuffledExam } from "@/lib/server/exams";
import { ensureSeed } from "@/lib/server/seed";
import type { AnswerKey, BrPlayer, BrRoom, BrStatus, QuestionPublic } from "@/lib/types";
import { isBotId } from "@/lib/realms";
import { answerKey } from "@/lib/utils";

type RoomRow = {
  id: string;
  exam_id: string;
  status: BrStatus;
  capacity: number;
  round_index: number;
  question_ids: unknown;
  countdown_ends_at: string | null;
  round_ends_at: string | null;
  winner_id: string | null;
  rewarded: boolean;
  countdown_left: number | string | null;
  round_left: number | string | null;
};

type PlayerRow = {
  user_id: string;
  display_name: string;
  is_bot: boolean;
  is_alive: boolean;
  answer: string | null;
  answered_at: string | null;
  correct_count: number;
  placement: number | null;
  eliminated_round: number | null;
};

function parseIds(raw: unknown): string[] {
  if (!raw) return [];
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }
  return raw as string[];
}

function mapPlayer(r: PlayerRow): BrPlayer {
  return {
    userId: r.user_id,
    displayName: r.display_name,
    isBot: Boolean(r.is_bot),
    isAlive: Boolean(r.is_alive),
    hasAnswered: Boolean(r.answer),
    correctCount: Number(r.correct_count),
    placement: r.placement == null ? null : Number(r.placement),
    eliminatedRound: r.eliminated_round == null ? null : Number(r.eliminated_round),
  };
}

const ROOM_SELECT = `
  select r.id, r.exam_id, r.status, r.capacity, r.round_index, r.question_ids,
         r.countdown_ends_at::text as countdown_ends_at, r.round_ends_at::text as round_ends_at,
         r.winner_id, r.rewarded,
         extract(epoch from (r.countdown_ends_at - now())) as countdown_left,
         extract(epoch from (r.round_ends_at - now())) as round_left
  from br_rooms r
`;

async function loadPlayers(sql: Awaited<ReturnType<typeof getSql>>, roomId: string) {
  return sql.query<PlayerRow>(
    `select user_id, display_name, is_bot, is_alive, answer, answered_at::text as answered_at,
            correct_count, placement, eliminated_round
     from br_players where room_id = $1
     order by is_alive desc, placement nulls first, correct_count desc, display_name`,
    [roomId],
  );
}

function toRoom(row: RoomRow, players: PlayerRow[], userId: string, gains?: { exp: number; thach: number }): BrRoom {
  const mine = players.find((p) => p.user_id === userId);
  const winner = players.find((p) => p.user_id === row.winner_id);
  const ids = parseIds(row.question_ids);
  return {
    id: row.id,
    examId: row.exam_id,
    status: row.status,
    capacity: Number(row.capacity),
    roundIndex: Number(row.round_index),
    totalRounds: ids.length,
    countdownLeft: Math.max(0, Math.ceil(Number(row.countdown_left ?? 0))),
    roundLeft: Math.max(0, Math.ceil(Number(row.round_left ?? 0))),
    winnerId: row.winner_id,
    winnerName: winner?.display_name ?? null,
    players: players.map(mapPlayer),
    myAlive: Boolean(mine?.is_alive),
    myPlacement: mine?.placement == null ? null : Number(mine.placement),
    myAnswered: Boolean(mine?.answer),
    myExpGain: gains?.exp ?? 0,
    myThachGain: gains?.thach ?? 0,
  };
}

async function findLiveRoom(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const rows = await sql.query<RoomRow>(
    `${ROOM_SELECT}
     inner join br_players p on p.room_id = r.id
     where p.user_id = $1 and r.status in ('countdown','playing') and p.is_alive = true

     order by r.created_at desc limit 1`,
    [userId],
  );
  return rows[0] ?? null;
}

async function fetchRoom(sql: Awaited<ReturnType<typeof getSql>>, roomId: string) {
  const rows = await sql.query<RoomRow>(`${ROOM_SELECT} where r.id = $1`, [roomId]);
  return rows[0] ?? null;
}

async function tickRoom(
  sql: Awaited<ReturnType<typeof getSql>>,
  room: RoomRow,
): Promise<RoomRow> {
  if (room.status === "countdown") {
    const due = await sql.query<{ due: boolean }>(
      `select (countdown_ends_at is null or countdown_ends_at <= now()) as due from br_rooms where id = $1`,
      [room.id],
    );
    if (due[0]?.due) {
      await sql.query(
        `update br_rooms
         set status = 'playing',
             round_ends_at = now() + interval '18 seconds'
         where id = $1 and status = 'countdown'`,
        [room.id],
      );
    }
    return (await fetchRoom(sql, room.id)) ?? room;
  }

  if (room.status !== "playing") return room;

  const latest = (await fetchRoom(sql, room.id)) ?? room;
  if (latest.status !== "playing") return latest;

  const players = await loadPlayers(sql, latest.id);
  const livingHumans = players.some((p) => p.is_alive && p.is_bot !== true);
  const dueRows = await sql.query<{ due: boolean }>(
    `select (round_ends_at is not null and round_ends_at <= now()) as due from br_rooms where id = $1`,
    [latest.id],
  );
  if (livingHumans && !dueRows[0]?.due) return latest;

  let current: RoomRow | null = latest;
  for (let i = 0; i < 12 && current?.status === "playing"; i++) {
    const roster = await loadPlayers(sql, current.id);
    const humansLive = roster.some((p) => p.is_alive && p.is_bot !== true);
    const roundDue = await sql.query<{ due: boolean }>(
      `select (round_ends_at is not null and round_ends_at <= now()) as due from br_rooms where id = $1`,
      [current.id],
    );
    if (humansLive && !roundDue[0]?.due) break;
    if (!humansLive) {
      await sql.query(
        `update br_rooms set round_ends_at = now() where id = $1 and status = 'playing'`,
        [current.id],
      );
    }
    await resolveRound(sql, current);
    current = await fetchRoom(sql, room.id);
    if (!current) break;
  }
  return current ?? latest;
}

function randomWrong(correct: string): AnswerKey {
  const opts: AnswerKey[] = ["A", "B", "C", "D"].filter((k) => k !== correct) as AnswerKey[];
  return opts[Math.floor(Math.random() * opts.length)] ?? "A";
}

async function resolveRound(sql: Awaited<ReturnType<typeof getSql>>, room: RoomRow) {
  const claimed = await sql.query<{ id: string; round_index: number }>(
    `update br_rooms
     set round_ends_at = now() + interval '1 hour'
     where id = $1 and status = 'playing' and round_ends_at <= now()
     returning id, round_index`,
    [room.id],
  );

  if (!claimed[0]) return;

  const roundIndex = Number(claimed[0].round_index);
  const ids = parseIds(room.question_ids);
  const qid = ids[roundIndex];
  if (!qid) {
    await finishRoom(sql, room.id);
    return;
  }

  const qrows = await sql.query<{ correct_answer: string }>(
    `select correct_answer from questions where id = $1`,
    [qid],
  );
  const correct = answerKey(qrows[0]?.correct_answer);

  const players = await loadPlayers(sql, room.id);
  const alive = players.filter((p) => p.is_alive);

  for (const bot of alive.filter((p) => p.is_bot && !p.answer)) {
    const pick = Math.random() < 0.62 ? correct : randomWrong(correct);
    await sql.query(
      `update br_players set answer = $3, answered_at = now()
       where room_id = $1 and user_id = $2 and is_alive = true and answer is null`,
      [room.id, bot.user_id, pick],
    );
    bot.answer = pick;
  }

  const afterBots = await loadPlayers(sql, room.id);
  const stillAlive = afterBots.filter((p) => p.is_alive);
  const survivors: PlayerRow[] = [];
  const eliminated: PlayerRow[] = [];
  for (const p of stillAlive) {
    if ((p.answer ?? "").toUpperCase() === correct) survivors.push(p);
    else eliminated.push(p);
  }

  if (survivors.length === 0) {
    const answered = eliminated
      .filter((p) => p.answer)
      .sort((a, b) => (a.answered_at ?? "").localeCompare(b.answered_at ?? ""));
    if (answered[0]) {
      survivors.push(answered[0]);
      const idx = eliminated.findIndex((p) => p.user_id === answered[0]!.user_id);
      if (idx >= 0) eliminated.splice(idx, 1);
    }
  }

  eliminated.sort((a, b) => {
    if (!a.answer && b.answer) return -1;
    if (a.answer && !b.answer) return 1;
    return (b.answered_at ?? "").localeCompare(a.answered_at ?? "");
  });

  let place = survivors.length + eliminated.length;
  for (const p of eliminated) {
    await sql.query(
      `update br_players
       set is_alive = false, placement = $3, eliminated_round = $4, answer = null, answered_at = null
       where room_id = $1 and user_id = $2`,
      [room.id, p.user_id, place, roundIndex],
    );
    place -= 1;
  }

  for (const p of survivors) {
    await sql.query(
      `update br_players
       set correct_count = correct_count + 1, answer = null, answered_at = null
       where room_id = $1 and user_id = $2`,
      [room.id, p.user_id],
    );
  }

  const lastRound = roundIndex >= ids.length - 1;
  if (survivors.length <= 1 || lastRound || survivors.length === 0) {
    const remaining = survivors.sort((a, b) => Number(b.correct_count) - Number(a.correct_count));
    let winPlace = 1;
    for (const p of remaining) {
      await sql.query(
        `update br_players set is_alive = false, placement = $3, answer = null, answered_at = null
         where room_id = $1 and user_id = $2`,
        [room.id, p.user_id, winPlace],
      );
      winPlace += 1;
    }
    await finishRoom(sql, room.id);
    return;
  }

  await sql.query(
    `update br_rooms
     set round_index = $2,
         round_ends_at = now() + interval '18 seconds'
     where id = $1 and status = 'playing'`,
    [room.id, roundIndex + 1],
  );

}

async function finishRoom(sql: Awaited<ReturnType<typeof getSql>>, roomId: string) {
  const players = await loadPlayers(sql, roomId);
  const ranked = [...players].sort((a, b) => {
    const pa = a.placement ?? 99;
    const pb = b.placement ?? 99;
    return pa - pb;
  });
  const winner = ranked.find((p) => Number(p.placement) === 1) ?? ranked[0];
  const claimed = await sql.query<{ id: string }>(
    `update br_rooms set status = 'completed', winner_id = $2, rewarded = true
     where id = $1 and rewarded = false
     returning id`,
    [roomId, winner?.user_id ?? null],
  );
  if (!claimed[0]) {
    await sql.query(`update br_rooms set status = 'completed', winner_id = $2 where id = $1`, [
      roomId,
      winner?.user_id ?? null,
    ]);
    return;
  }
  for (const p of players) {
    if (isBotId(p.user_id)) continue;
    const place = Number(p.placement ?? 8);
    const rew = brRewards(place);
    await grantBrPlacement(sql, p.user_id, place, rew);
  }
}

async function createRoom(
  sql: Awaited<ReturnType<typeof getSql>>,
  humans: { user_id: string; user_name: string }[],
) {
  await ensureSeed();
  const examId = await insertShuffledExam(sql, {
    topic: "",
    difficulty: "",
    count: BR_QUESTION_COUNT,
    createdBy: humans[0]?.user_id ?? "system",
    title: "Bí Cảnh Sinh Tồn",
    source: "Bí Cảnh",
  });
  const qs = await sql.query<{ id: string }>(
    `select id from questions where exam_id = $1 order by order_index`,
    [examId],
  );
  const qids = qs.map((q) => q.id);
  const roomId = crypto.randomUUID();
  const botsNeeded = Math.max(0, BR_CAPACITY - humans.length);
  const bots = BR_BOTS.slice(0, botsNeeded);

  await sql.query(
    `insert into br_rooms (id, exam_id, status, capacity, round_index, question_ids, countdown_ends_at)
     values ($1,$2,'countdown',$3,0,$4::jsonb, now() + interval '5 seconds')`,
    [roomId, examId, BR_CAPACITY, JSON.stringify(qids)],
  );

  for (const h of humans) {
    await sql.query(
      `insert into br_players (room_id, user_id, display_name, is_bot)
       values ($1,$2,$3,false)`,
      [roomId, h.user_id, h.user_name],
    );
  }
  for (const b of bots) {
    await sql.query(
      `insert into br_players (room_id, user_id, display_name, is_bot)
       values ($1,$2,$3,true)`,
      [roomId, b.id, b.name],
    );
  }
  const ids = humans.map((h) => h.user_id);
  if (ids.length) {
    await sql.query(`delete from br_queue where user_id = any($1::text[])`, [ids]);
  }
  return roomId;
}

async function tryMatch(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const live = await findLiveRoom(sql, userId);
  if (live) return live.id;

  const mine = await sql.query<{ waited_s: number | string }>(
    `select extract(epoch from (now() - joined_at)) as waited_s
     from br_queue where user_id = $1`,
    [userId],
  );
  if (!mine[0]) return null;
  if (Number(mine[0].waited_s) * 1000 < BR_QUEUE_FILL_MS) return null;

  const waiting = await sql.query<{ user_id: string; user_name: string }>(
    `select user_id, user_name from br_queue order by joined_at asc limit $1`,
    [BR_CAPACITY],
  );
  if (!waiting.find((w) => w.user_id === userId)) return null;
  try {
    return await createRoom(sql, waiting);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "không tạo được Bí Cảnh";
    throw new Error(`Ghép Bí Cảnh thất bại: ${msg}`);
  }
}

export const joinBrQueue = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { displayName?: string } | undefined) => input ?? {})
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId, data.displayName);
    const live = await findLiveRoom(sql, context.userId);
    if (live) {
      const players = await loadPlayers(sql, live.id);
      return { status: "matched" as const, room: toRoom(live, players, context.userId) };
    }
    await sql.query(
      `insert into br_queue (user_id, user_name, elo, joined_at)
       values ($1,$2,$3,now())
       on conflict (user_id) do update set user_name = excluded.user_name, elo = excluded.elo, joined_at = now()`,
      [context.userId, me.displayName, me.elo],
    );
    const roomId = await tryMatch(sql, context.userId);
    if (roomId) {
      const room = await fetchRoom(sql, roomId);
      const players = await loadPlayers(sql, roomId);
      if (room) return { status: "matched" as const, room: toRoom(room, players, context.userId) };
    }
    return { status: "queuing" as const, room: null };
  });

export const pollBrQueue = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const roomId = await tryMatch(sql, context.userId);
    if (roomId) {
      let room = await fetchRoom(sql, roomId);
      if (room) {
        room = await tickRoom(sql, room);
        const players = await loadPlayers(sql, room.id);
        return { status: "matched" as const, room: toRoom(room, players, context.userId) };
      }
    }
    const live = await findLiveRoom(sql, context.userId);
    if (live) {
      const ticked = await tickRoom(sql, live);
      const players = await loadPlayers(sql, ticked.id);
      return { status: "matched" as const, room: toRoom(ticked, players, context.userId) };
    }
    return { status: "queuing" as const, room: null };
  });

export const leaveBrQueue = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql.query(`delete from br_queue where user_id = $1`, [context.userId]);
    return { ok: true as const };
  });

export const getBrRoom = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((roomId: string) => roomId)
  .handler(async ({ context, data: roomId }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    let room = await fetchRoom(sql, roomId);
    if (!room) throw new Error("Không tìm thấy Bí Cảnh");
    room = await tickRoom(sql, room);
    const players = await loadPlayers(sql, room.id);
    const mine = players.find((p) => p.user_id === context.userId);
    let gains: { exp: number; thach: number } | undefined;
    if (room.status === "completed" && mine?.placement != null) {
      const rew = brRewards(Number(mine.placement));
      const bonus = perkBonus(await equippedPerks(sql, context.userId));
      gains = {
        exp: Math.round(rew.exp * bonus.expMul),
        thach: rew.thach + (Number(mine.placement) === 1 ? bonus.extraThach : 0),
      };
    }
    return toRoom(room, players, context.userId, gains);
  });

export const submitBrAnswer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { roomId: string; answer: AnswerKey }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    let room = await fetchRoom(sql, data.roomId);
    if (!room) throw new Error("Không tìm thấy Bí Cảnh");
    room = await tickRoom(sql, room);
    if (room.status !== "playing") throw new Error("Chưa đến lượt trả lời");
    if (Number(room.countdown_left ?? 0) > 0) throw new Error("Đang niêm phong");
    const mine = await sql.query<{ is_alive: boolean; answer: string | null }>(
      `select is_alive, answer from br_players where room_id = $1 and user_id = $2`,
      [data.roomId, context.userId],
    );
    if (!mine[0]?.is_alive) throw new Error("Đạo hữu đã rơi");
    if (mine[0].answer) {
      const players = await loadPlayers(sql, room.id);
      return toRoom(room, players, context.userId);
    }
    await sql.query(
      `update br_players set answer = $3, answered_at = now()
       where room_id = $1 and user_id = $2 and is_alive = true and answer is null`,
      [data.roomId, context.userId, data.answer],
    );
    const players = await loadPlayers(sql, room.id);
    return toRoom(room, players, context.userId);
  });

export const getBrQuestion = createServerFn({ method: "POST" })

  .middleware([authMiddleware])
  .validator((roomId: string) => roomId)
  .handler(async ({ context, data: roomId }) => {
    const sql = await getSql();
    let room = await fetchRoom(sql, roomId);
    if (!room) throw new Error("Không tìm thấy Bí Cảnh");
    const ids = parseIds(room.question_ids);

    const qid = ids[Number(room.round_index)];
    if (!qid || room.status === "countdown") return { question: null as QuestionPublic | null };
    const rows = await sql.query<{
      id: string;
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
      `select id, content, option_a, option_b, option_c, option_d, correct_answer, topic, difficulty, score
       from questions where id = $1`,
      [qid],
    );
    const q = rows[0];
    if (!q) return { question: null as QuestionPublic | null };
    const bonus = perkBonus(await equippedPerks(sql, context.userId));
    const wrong = (["A", "B", "C", "D"] as const).filter((k) => k !== answerKey(q.correct_answer));

    const faded = bonus.eliminate ? wrong[Number(room.round_index) % wrong.length] : null;
    const question: QuestionPublic = {
      id: q.id,
      orderIndex: Number(room.round_index) + 1,
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
    return { question };
  });
