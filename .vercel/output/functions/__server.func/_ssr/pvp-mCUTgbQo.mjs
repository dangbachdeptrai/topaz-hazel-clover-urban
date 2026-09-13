import { r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-DvBmSZow.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { c as perkBonus, n as ensureProfile, r as equippedPerks, t as applyMatchRewards } from "./cultivation-CRtzj3Cp.mjs";
import { i as roomCode } from "./utils-GQBtw7X5.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { n as insertShuffledExam, t as ensureSeed } from "./seed-DGRl8yjE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pvp-mCUTgbQo.js
var BOTS = [
	{
		id: "bot:thanh-van",
		name: "Thanh Vân Tử"
	},
	{
		id: "bot:han-suong",
		name: "Hàn Sương"
	},
	{
		id: "bot:liet-hoa",
		name: "Liệt Hỏa"
	},
	{
		id: "bot:bich-hai",
		name: "Bích Hải"
	},
	{
		id: "bot:kim-dan",
		name: "Kim Đan"
	}
];
var QUEUE_BOT_MS = 7e3;
var BOT_PACE_MS = 11e3;
var BOT_ACCURACY = .68;
var SHUFFLE_KEY = "__shuffle__";
function parseAnswers(raw) {
	if (!raw) return {};
	if (typeof raw === "string") try {
		return JSON.parse(raw);
	} catch {
		return {};
	}
	return raw;
}
function mapMatch(r) {
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
		p2ExpGain: Number(r.p2_exp_gain ?? 0)
	};
}
var MATCH_SELECT = `
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
function hash01(s) {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
	return (h >>> 0) / 4294967296;
}
async function resolveExamId(sql, spec) {
	if (spec.examId !== SHUFFLE_KEY) return spec.examId || "pvp-blitz";
	return insertShuffledExam(sql, {
		topic: spec.topic ?? "",
		difficulty: spec.difficulty ?? "",
		count: spec.questionCount ?? 8,
		createdBy: spec.userId
	});
}
async function applyBotProgress(sql, matchId) {
	const m = (await sql.query(`select id, exam_id, is_bot, status, start_time::text as start_time,
            player2_done, player1_done, player1_score, duration_seconds,
            extract(epoch from (now() - start_time)) as elapsed_s
     from pvp_matches where id = $1`, [matchId]))[0];
	if (!m || !m.is_bot || m.status !== "in_progress" || !m.start_time) return;
	const elapsedMs = Number(m.elapsed_s) * 1e3;
	if (elapsedMs < 0) return;
	const qs = await sql.query(`select id, correct_answer, score from questions where exam_id = $1 order by order_index`, [m.exam_id]);
	const timedOut = elapsedMs >= m.duration_seconds * 1e3;
	const shouldAnswer = timedOut || m.player1_done ? qs.length : Math.min(qs.length, Math.floor(elapsedMs / BOT_PACE_MS));
	const answers = {};
	let score = 0;
	for (let i = 0; i < shouldAnswer; i++) {
		const question = qs[i];
		const correct = hash01(`${matchId}:${question.id}`) < BOT_ACCURACY;
		const pick = correct ? question.correct_answer : [
			"A",
			"B",
			"C",
			"D"
		].find((x) => x !== question.correct_answer) ?? "A";
		answers[question.id] = pick;
		if (correct) score += Number(question.score);
	}
	score = Math.round(score * 100) / 100;
	const botDone = shouldAnswer >= qs.length || timedOut;
	let winner = null;
	let status = m.status;
	let end = null;
	if (botDone && m.player1_done || timedOut) {
		status = "completed";
		end = (/* @__PURE__ */ new Date()).toISOString();
		const p1 = Number(m.player1_score);
		if (p1 > score) winner = "p1";
		else if (score > p1) winner = "p2";
	}
	await sql.query(`update pvp_matches
     set player2_answers = $1::jsonb, player2_score = $2, player2_done = $3,
         status = $4, winner_id = case when $5 = 'p1' then player1_id
                                       when $5 = 'p2' then player2_id else winner_id end,
         end_time = coalesce(end_time, $6::timestamptz)
     where id = $7`, [
		JSON.stringify(answers),
		score,
		botDone,
		status,
		winner,
		end,
		matchId
	]);
	if (status === "completed") await applyMatchRewards(sql, matchId);
}
async function createLiveMatch(sql, spec) {
	const id = crypto.randomUUID();
	const code = roomCode();
	await sql.query(`insert into pvp_matches
      (id, exam_id, player1_id, player1_name, player2_id, player2_name,
       status, room_code, start_time, countdown_ends_at, duration_seconds, is_bot,
       mode, p1_elo_before, p2_elo_before)
     values ($1,$2,$3,$4,$5,$6,'in_progress',$7,
             now() + interval '5 seconds',
             now() + interval '5 seconds',
             $8,$9,$10,$11,$12)`, [
		id,
		spec.examId,
		spec.p1Id,
		spec.p1Name,
		spec.p2Id,
		spec.p2Name,
		code,
		spec.duration,
		spec.isBot,
		spec.mode,
		spec.p1Elo,
		spec.p2Elo
	]);
	return fetchMatch(sql, id);
}
async function fetchMatch(sql, id) {
	const rows = await sql.query(`${MATCH_SELECT} where m.id = $1`, [id]);
	return rows[0] ? mapMatch(rows[0]) : null;
}
var joinPvpQueue_createServerFn_handler = createServerRpc({
	id: "3447315fcb0561f5949dc1b6617871322cce497994d9c4ee5a15e55170676235",
	name: "joinPvpQueue",
	filename: "src/lib/server/pvp.ts"
}, (opts) => joinPvpQueue.__executeServer(opts));
var joinPvpQueue = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(joinPvpQueue_createServerFn_handler, async ({ context, data }) => {
	await ensureSeed();
	const sql = await getSql();
	const me = await ensureProfile(sql, context.userId, data.displayName);
	const duration = 480 + perkBonus(await equippedPerks(sql, context.userId)).extraTime;
	const mode = data.ranked ? "ranked" : data.shuffle ? "shuffle" : "casual";
	const storedExam = data.shuffle ? SHUFFLE_KEY : data.examId || "pvp-blitz";
	const topic = data.topic ?? "";
	const difficulty = data.difficulty ?? "";
	const questionCount = data.questionCount ?? 8;
	const waiting = await sql.query(`select user_id, user_name, exam_id,
              coalesce(topic_filter, '') as topic_filter,
              coalesce(difficulty_filter, '') as difficulty_filter,
              coalesce(question_count, 8) as question_count,
              coalesce(elo, 1000) as elo
       from pvp_queue
       where user_id <> $1
         and coalesce(mode, 'casual') = $2
         and ($2 <> 'ranked' or abs(coalesce(elo, 1000) - $3) <= $4)
       order by joined_at asc limit 1`, [
		context.userId,
		mode,
		me.elo,
		300
	]);
	if (waiting[0]) {
		const opp = waiting[0];
		await sql.query(`delete from pvp_queue where user_id = $1`, [opp.user_id]);
		const examId = await resolveExamId(sql, {
			examId: opp.exam_id,
			topic: opp.topic_filter ?? topic,
			difficulty: opp.difficulty_filter ?? difficulty,
			questionCount: Number(opp.question_count ?? questionCount),
			userId: context.userId
		});
		const oppProfile = await ensureProfile(sql, opp.user_id, opp.user_name);
		return {
			status: "matched",
			match: await createLiveMatch(sql, {
				examId,
				p1Id: context.userId,
				p1Name: data.displayName,
				p2Id: opp.user_id,
				p2Name: opp.user_name,
				isBot: false,
				mode,
				p1Elo: me.elo,
				p2Elo: oppProfile.elo,
				duration
			})
		};
	}
	await sql.query(`insert into pvp_queue
        (user_id, user_name, exam_id, joined_at, topic_filter, difficulty_filter, question_count, mode, elo, realm_id)
       values ($1,$2,$3,now(),$4,$5,$6,$7,$8,$9)
       on conflict (user_id) do update set
         user_name=excluded.user_name, exam_id=excluded.exam_id, joined_at=now(),
         topic_filter=excluded.topic_filter, difficulty_filter=excluded.difficulty_filter,
         question_count=excluded.question_count, mode=excluded.mode, elo=excluded.elo, realm_id=excluded.realm_id`, [
		context.userId,
		data.displayName,
		storedExam,
		topic,
		difficulty,
		questionCount,
		mode,
		me.elo,
		me.realmId
	]);
	return {
		status: "queued",
		match: null
	};
});
var pollPvpQueue_createServerFn_handler = createServerRpc({
	id: "c3b4715ba59dd0ea8eaf2913c04e48c4c9cd078cd69dbf8ff940d2d5fc92776f",
	name: "pollPvpQueue",
	filename: "src/lib/server/pvp.ts"
}, (opts) => pollPvpQueue.__executeServer(opts));
var pollPvpQueue = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(pollPvpQueue_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const live = await sql.query(`${MATCH_SELECT}
       where m.status in ('waiting','in_progress')
         and (m.player1_id = $1 or m.player2_id = $1)
       order by m.created_at desc limit 1`, [context.userId]);
	if (live[0]) {
		await sql.query(`delete from pvp_queue where user_id = $1`, [context.userId]);
		return {
			status: "matched",
			match: mapMatch(live[0])
		};
	}
	const q = await sql.query(`select exam_id, user_name, coalesce(topic_filter,'') as topic_filter,
              coalesce(difficulty_filter,'') as difficulty_filter,
              coalesce(question_count,8) as question_count,
              coalesce(mode,'casual') as mode,
              extract(epoch from (now() - joined_at)) as waited_s
       from pvp_queue where user_id = $1`, [context.userId]);
	if (!q[0]) return {
		status: "idle",
		match: null
	};
	if (Number(q[0].waited_s) * 1e3 < QUEUE_BOT_MS) return {
		status: "queued",
		match: null
	};
	await sql.query(`delete from pvp_queue where user_id = $1`, [context.userId]);
	const examId = await resolveExamId(sql, {
		examId: q[0].exam_id,
		topic: q[0].topic_filter ?? "",
		difficulty: q[0].difficulty_filter ?? "",
		questionCount: Number(q[0].question_count ?? 8),
		userId: context.userId
	});
	const bot = BOTS[Math.floor(Math.random() * BOTS.length)];
	const me = await ensureProfile(sql, context.userId, q[0].user_name);
	const bonus = perkBonus(await equippedPerks(sql, context.userId));
	const mode = q[0].mode === "ranked" || q[0].mode === "shuffle" ? q[0].mode : "casual";
	return {
		status: "matched",
		match: await createLiveMatch(sql, {
			examId,
			p1Id: context.userId,
			p1Name: q[0].user_name,
			p2Id: bot.id,
			p2Name: bot.name,
			isBot: true,
			mode,
			p1Elo: me.elo,
			p2Elo: 1e3,
			duration: 480 + bonus.extraTime
		})
	};
});
var leavePvpQueue_createServerFn_handler = createServerRpc({
	id: "4972ba2fa8f32af96c4fa914ff3f7e9023a3cdae09438fcd52c2ab3035c22a3c",
	name: "leavePvpQueue",
	filename: "src/lib/server/pvp.ts"
}, (opts) => leavePvpQueue.__executeServer(opts));
var leavePvpQueue = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(leavePvpQueue_createServerFn_handler, async ({ context }) => {
	await (await getSql()).query(`delete from pvp_queue where user_id = $1`, [context.userId]);
	return { ok: true };
});
var createPvpRoom_createServerFn_handler = createServerRpc({
	id: "c16d3360fb78fa51e64da7a38b4e54f005c9ead506b9030cf6553011be5e374a",
	name: "createPvpRoom",
	filename: "src/lib/server/pvp.ts"
}, (opts) => createPvpRoom.__executeServer(opts));
var createPvpRoom = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createPvpRoom_createServerFn_handler, async ({ context, data }) => {
	await ensureSeed();
	const sql = await getSql();
	const examId = await resolveExamId(sql, {
		examId: data.shuffle ? SHUFFLE_KEY : data.examId || "pvp-blitz",
		topic: data.topic ?? "",
		difficulty: data.difficulty ?? "",
		questionCount: data.questionCount ?? 8,
		userId: context.userId
	});
	const me = await ensureProfile(sql, context.userId, data.displayName);
	const bonus = perkBonus(await equippedPerks(sql, context.userId));
	const mode = data.ranked ? "ranked" : data.shuffle ? "shuffle" : "casual";
	const id = crypto.randomUUID();
	const code = roomCode();
	await sql.query(`insert into pvp_matches
        (id, exam_id, player1_id, player1_name, status, room_code, duration_seconds, is_bot, mode, p1_elo_before)
       values ($1,$2,$3,$4,'waiting',$5,$6,false,$7,$8)`, [
		id,
		examId,
		context.userId,
		data.displayName,
		code,
		480 + bonus.extraTime,
		mode,
		me.elo
	]);
	return fetchMatch(sql, id);
});
var joinPvpRoom_createServerFn_handler = createServerRpc({
	id: "4b734c84b1322c916eb76c56c1f534a5c371bb8841be59c2a76cad2503d41c02",
	name: "joinPvpRoom",
	filename: "src/lib/server/pvp.ts"
}, (opts) => joinPvpRoom.__executeServer(opts));
var joinPvpRoom = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(joinPvpRoom_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const code = data.roomCode.trim().toUpperCase();
	const m = (await sql.query(`select id, player1_id, status from pvp_matches where room_code = $1`, [code]))[0];
	if (!m) throw new Error("Không tìm thấy phòng");
	if (m.player1_id === context.userId) return fetchMatch(sql, m.id);
	if (m.status !== "waiting") throw new Error("Phòng đã bắt đầu hoặc đã đóng");
	const me = await ensureProfile(sql, context.userId, data.displayName);
	await sql.query(`update pvp_matches
       set player2_id = $1, player2_name = $2, status = 'in_progress',
           start_time = now() + interval '5 seconds',
           countdown_ends_at = now() + interval '5 seconds',
           p2_elo_before = $4
       where id = $3 and status = 'waiting'`, [
		context.userId,
		data.displayName,
		m.id,
		me.elo
	]);
	return fetchMatch(sql, m.id);
});
var getPvpMatch_createServerFn_handler = createServerRpc({
	id: "5dd9007afbd90ee25de6435fd6528d811f2f96a25a95f5cf54db97be76f21d11",
	name: "getPvpMatch",
	filename: "src/lib/server/pvp.ts"
}, (opts) => getPvpMatch.__executeServer(opts));
var getPvpMatch = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((matchId) => matchId).handler(getPvpMatch_createServerFn_handler, async ({ context, data: matchId }) => {
	const sql = await getSql();
	await applyBotProgress(sql, matchId);
	const match = await fetchMatch(sql, matchId);
	if (!match) return null;
	if (match.player1Id !== context.userId && match.player2Id !== context.userId) throw new Error("Unauthorized");
	return match;
});
var submitPvpAnswer_createServerFn_handler = createServerRpc({
	id: "5e5e3553335910bec12bb703591eead87bad51c000fd2c00088f75bcad2b364f",
	name: "submitPvpAnswer",
	filename: "src/lib/server/pvp.ts"
}, (opts) => submitPvpAnswer.__executeServer(opts));
var submitPvpAnswer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(submitPvpAnswer_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await applyBotProgress(sql, data.matchId);
	const m = (await sql.query(`${MATCH_SELECT} where m.id = $1`, [data.matchId]))[0];
	if (!m) throw new Error("Không tìm thấy trận");
	if (m.status !== "in_progress") return mapMatch(m);
	if (mapMatch(m).countdownLeft > 0) throw new Error("Trận chưa khai đấu");
	const isP1 = m.player1_id === context.userId;
	const isP2 = m.player2_id === context.userId;
	if (!isP1 && !isP2) throw new Error("Unauthorized");
	const q = await sql.query(`select correct_answer, score from questions where id = $1 and exam_id = $2`, [data.questionId, m.exam_id]);
	if (!q[0]) throw new Error("Câu hỏi không hợp lệ");
	const colAns = isP1 ? "player1_answers" : "player2_answers";
	const colScore = isP1 ? "player1_score" : "player2_score";
	const current = parseAnswers(isP1 ? m.player1_answers : m.player2_answers);
	if (current[data.questionId]) return mapMatch(m);
	current[data.questionId] = data.answer;
	const add = data.answer === q[0].correct_answer ? Number(q[0].score) : 0;
	const nextScore = Math.round((Number(isP1 ? m.player1_score : m.player2_score) + add) * 100) / 100;
	await sql.query(`update pvp_matches set ${colAns} = $1::jsonb, ${colScore} = $2 where id = $3`, [
		JSON.stringify(current),
		nextScore,
		data.matchId
	]);
	return fetchMatch(sql, data.matchId);
});
var finishPvp_createServerFn_handler = createServerRpc({
	id: "4bb608b2389af70630d50891406905cd7fdec0bb6ded1739d67d2bab16a3efcf",
	name: "finishPvp",
	filename: "src/lib/server/pvp.ts"
}, (opts) => finishPvp.__executeServer(opts));
var finishPvp = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((matchId) => matchId).handler(finishPvp_createServerFn_handler, async ({ context, data: matchId }) => {
	const sql = await getSql();
	await applyBotProgress(sql, matchId);
	const m = (await sql.query(`${MATCH_SELECT} where m.id = $1`, [matchId]))[0];
	if (!m) throw new Error("Không tìm thấy trận");
	const isP1 = m.player1_id === context.userId;
	const isP2 = m.player2_id === context.userId;
	if (!isP1 && !isP2) throw new Error("Unauthorized");
	if (isP1) await sql.query(`update pvp_matches set player1_done = true where id = $1`, [matchId]);
	else await sql.query(`update pvp_matches set player2_done = true where id = $1`, [matchId]);
	const a = (await sql.query(`${MATCH_SELECT} where m.id = $1`, [matchId]))[0];
	const live = mapMatch(a);
	const bothDone = a.player1_done && a.player2_done;
	const timedOut = live.countdownLeft <= 0 && live.fightLeft <= 0;
	if ((bothDone || timedOut) && a.status === "in_progress") {
		const s1 = Number(a.player1_score);
		const s2 = Number(a.player2_score);
		let winner = null;
		if (s1 > s2) winner = a.player1_id;
		else if (s2 > s1) winner = a.player2_id;
		await sql.query(`update pvp_matches set status = 'completed', end_time = now(), winner_id = $1 where id = $2`, [winner, matchId]);
		await applyMatchRewards(sql, matchId);
	}
	await applyBotProgress(sql, matchId);
	return fetchMatch(sql, matchId);
});
var listMyPvp_createServerFn_handler = createServerRpc({
	id: "0b36f8f3bdb5c416ce480a5175f98e2108af895124bc07a298cd173626e6b5d8",
	name: "listMyPvp",
	filename: "src/lib/server/pvp.ts"
}, (opts) => listMyPvp.__executeServer(opts));
var listMyPvp = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listMyPvp_createServerFn_handler, async ({ context }) => {
	return (await (await getSql()).query(`${MATCH_SELECT}
       where m.status = 'completed' and (m.player1_id = $1 or m.player2_id = $1)
       order by m.end_time desc limit 20`, [context.userId])).map(mapMatch);
});
//#endregion
export { createPvpRoom_createServerFn_handler, finishPvp_createServerFn_handler, getPvpMatch_createServerFn_handler, joinPvpQueue_createServerFn_handler, joinPvpRoom_createServerFn_handler, leavePvpQueue_createServerFn_handler, listMyPvp_createServerFn_handler, pollPvpQueue_createServerFn_handler, submitPvpAnswer_createServerFn_handler };
