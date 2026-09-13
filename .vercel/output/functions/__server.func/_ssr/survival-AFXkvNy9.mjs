import { r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-DvBmSZow.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { r as isBotId } from "./realms-D188oFq9.mjs";
import { a as grantBrPlacement, c as perkBonus, n as ensureProfile, r as equippedPerks } from "./cultivation-CRtzj3Cp.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { n as insertShuffledExam, t as ensureSeed } from "./seed-DGRl8yjE.mjs";
import { r as brRewards, t as BR_BOTS } from "./catalog-CgkBFjMi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/survival-AFXkvNy9.js
function parseIds(raw) {
	if (!raw) return [];
	if (typeof raw === "string") try {
		return JSON.parse(raw);
	} catch {
		return [];
	}
	return raw;
}
function mapPlayer(r) {
	return {
		userId: r.user_id,
		displayName: r.display_name,
		isBot: Boolean(r.is_bot),
		isAlive: Boolean(r.is_alive),
		hasAnswered: Boolean(r.answer),
		correctCount: Number(r.correct_count),
		placement: r.placement == null ? null : Number(r.placement),
		eliminatedRound: r.eliminated_round == null ? null : Number(r.eliminated_round)
	};
}
var ROOM_SELECT = `
  select r.id, r.exam_id, r.status, r.capacity, r.round_index, r.question_ids,
         r.countdown_ends_at::text as countdown_ends_at, r.round_ends_at::text as round_ends_at,
         r.winner_id, r.rewarded,
         extract(epoch from (r.countdown_ends_at - now())) as countdown_left,
         extract(epoch from (r.round_ends_at - now())) as round_left
  from br_rooms r
`;
async function loadPlayers(sql, roomId) {
	return sql.query(`select user_id, display_name, is_bot, is_alive, answer, answered_at::text as answered_at,
            correct_count, placement, eliminated_round
     from br_players where room_id = $1
     order by is_alive desc, placement nulls first, correct_count desc, display_name`, [roomId]);
}
function toRoom(row, players, userId, gains) {
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
		myThachGain: gains?.thach ?? 0
	};
}
async function findLiveRoom(sql, userId) {
	return (await sql.query(`${ROOM_SELECT}
     inner join br_players p on p.room_id = r.id
     where p.user_id = $1 and r.status in ('countdown','playing') and p.is_alive = true

     order by r.created_at desc limit 1`, [userId]))[0] ?? null;
}
async function fetchRoom(sql, roomId) {
	return (await sql.query(`${ROOM_SELECT} where r.id = $1`, [roomId]))[0] ?? null;
}
async function tickRoom(sql, room) {
	if (room.status === "countdown") {
		if ((await sql.query(`select (countdown_ends_at is null or countdown_ends_at <= now()) as due from br_rooms where id = $1`, [room.id]))[0]?.due) await sql.query(`update br_rooms
         set status = 'playing',
             round_ends_at = now() + interval '18 seconds'
         where id = $1 and status = 'countdown'`, [room.id]);
		return await fetchRoom(sql, room.id) ?? room;
	}
	if (room.status !== "playing") return room;
	const latest = await fetchRoom(sql, room.id) ?? room;
	if (latest.status !== "playing") return latest;
	const livingHumans = (await loadPlayers(sql, latest.id)).some((p) => p.is_alive && p.is_bot !== true);
	const dueRows = await sql.query(`select (round_ends_at is not null and round_ends_at <= now()) as due from br_rooms where id = $1`, [latest.id]);
	if (livingHumans && !dueRows[0]?.due) return latest;
	let current = latest;
	for (let i = 0; i < 12 && current?.status === "playing"; i++) {
		const humansLive = (await loadPlayers(sql, current.id)).some((p) => p.is_alive && p.is_bot !== true);
		const roundDue = await sql.query(`select (round_ends_at is not null and round_ends_at <= now()) as due from br_rooms where id = $1`, [current.id]);
		if (humansLive && !roundDue[0]?.due) break;
		if (!humansLive) await sql.query(`update br_rooms set round_ends_at = now() where id = $1 and status = 'playing'`, [current.id]);
		await resolveRound(sql, current);
		current = await fetchRoom(sql, room.id);
		if (!current) break;
	}
	return current ?? latest;
}
function randomWrong(correct) {
	const opts = [
		"A",
		"B",
		"C",
		"D"
	].filter((k) => k !== correct);
	return opts[Math.floor(Math.random() * opts.length)] ?? "A";
}
async function resolveRound(sql, room) {
	const claimed = await sql.query(`update br_rooms
     set round_ends_at = now() + interval '1 hour'
     where id = $1 and status = 'playing' and round_ends_at <= now()
     returning id, round_index`, [room.id]);
	if (!claimed[0]) return;
	const roundIndex = Number(claimed[0].round_index);
	const ids = parseIds(room.question_ids);
	const qid = ids[roundIndex];
	if (!qid) {
		await finishRoom(sql, room.id);
		return;
	}
	const correct = ((await sql.query(`select correct_answer from questions where id = $1`, [qid]))[0]?.correct_answer ?? "A").toUpperCase();
	const alive = (await loadPlayers(sql, room.id)).filter((p) => p.is_alive);
	for (const bot of alive.filter((p) => p.is_bot && !p.answer)) {
		const pick = Math.random() < .62 ? correct : randomWrong(correct);
		await sql.query(`update br_players set answer = $3, answered_at = now()
       where room_id = $1 and user_id = $2 and is_alive = true and answer is null`, [
			room.id,
			bot.user_id,
			pick
		]);
		bot.answer = pick;
	}
	const stillAlive = (await loadPlayers(sql, room.id)).filter((p) => p.is_alive);
	const survivors = [];
	const eliminated = [];
	for (const p of stillAlive) if ((p.answer ?? "").toUpperCase() === correct) survivors.push(p);
	else eliminated.push(p);
	if (survivors.length === 0) {
		const answered = eliminated.filter((p) => p.answer).sort((a, b) => (a.answered_at ?? "").localeCompare(b.answered_at ?? ""));
		if (answered[0]) {
			survivors.push(answered[0]);
			const idx = eliminated.findIndex((p) => p.user_id === answered[0].user_id);
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
		await sql.query(`update br_players
       set is_alive = false, placement = $3, eliminated_round = $4, answer = null, answered_at = null
       where room_id = $1 and user_id = $2`, [
			room.id,
			p.user_id,
			place,
			roundIndex
		]);
		place -= 1;
	}
	for (const p of survivors) await sql.query(`update br_players
       set correct_count = correct_count + 1, answer = null, answered_at = null
       where room_id = $1 and user_id = $2`, [room.id, p.user_id]);
	const lastRound = roundIndex >= ids.length - 1;
	if (survivors.length <= 1 || lastRound || survivors.length === 0) {
		const remaining = survivors.sort((a, b) => Number(b.correct_count) - Number(a.correct_count));
		let winPlace = 1;
		for (const p of remaining) {
			await sql.query(`update br_players set is_alive = false, placement = $3, answer = null, answered_at = null
         where room_id = $1 and user_id = $2`, [
				room.id,
				p.user_id,
				winPlace
			]);
			winPlace += 1;
		}
		await finishRoom(sql, room.id);
		return;
	}
	await sql.query(`update br_rooms
     set round_index = $2,
         round_ends_at = now() + interval '18 seconds'
     where id = $1 and status = 'playing'`, [room.id, roundIndex + 1]);
}
async function finishRoom(sql, roomId) {
	const players = await loadPlayers(sql, roomId);
	const ranked = [...players].sort((a, b) => {
		return (a.placement ?? 99) - (b.placement ?? 99);
	});
	const winner = ranked.find((p) => Number(p.placement) === 1) ?? ranked[0];
	if (!(await sql.query(`update br_rooms set status = 'completed', winner_id = $2, rewarded = true
     where id = $1 and rewarded = false
     returning id`, [roomId, winner?.user_id ?? null]))[0]) {
		await sql.query(`update br_rooms set status = 'completed', winner_id = $2 where id = $1`, [roomId, winner?.user_id ?? null]);
		return;
	}
	for (const p of players) {
		if (isBotId(p.user_id)) continue;
		const place = Number(p.placement ?? 8);
		const rew = brRewards(place);
		await grantBrPlacement(sql, p.user_id, place, rew);
	}
}
async function createRoom(sql, humans) {
	await ensureSeed();
	const examId = await insertShuffledExam(sql, {
		topic: "",
		difficulty: "",
		count: 8,
		createdBy: humans[0]?.user_id ?? "system",
		title: "Bí Cảnh Sinh Tồn",
		source: "Bí Cảnh"
	});
	const qids = (await sql.query(`select id from questions where exam_id = $1 order by order_index`, [examId])).map((q) => q.id);
	const roomId = crypto.randomUUID();
	const botsNeeded = Math.max(0, 8 - humans.length);
	const bots = BR_BOTS.slice(0, botsNeeded);
	await sql.query(`insert into br_rooms (id, exam_id, status, capacity, round_index, question_ids, countdown_ends_at)
     values ($1,$2,'countdown',$3,0,$4::jsonb, now() + interval '5 seconds')`, [
		roomId,
		examId,
		8,
		JSON.stringify(qids)
	]);
	for (const h of humans) await sql.query(`insert into br_players (room_id, user_id, display_name, is_bot)
       values ($1,$2,$3,false)`, [
		roomId,
		h.user_id,
		h.user_name
	]);
	for (const b of bots) await sql.query(`insert into br_players (room_id, user_id, display_name, is_bot)
       values ($1,$2,$3,true)`, [
		roomId,
		b.id,
		b.name
	]);
	const ids = humans.map((h) => h.user_id);
	if (ids.length) await sql.query(`delete from br_queue where user_id = any($1::text[])`, [ids]);
	return roomId;
}
async function tryMatch(sql, userId) {
	const live = await findLiveRoom(sql, userId);
	if (live) return live.id;
	const mine = await sql.query(`select extract(epoch from (now() - joined_at)) as waited_s
     from br_queue where user_id = $1`, [userId]);
	if (!mine[0]) return null;
	if (Number(mine[0].waited_s) * 1e3 < 4e3) return null;
	const waiting = await sql.query(`select user_id, user_name from br_queue order by joined_at asc limit $1`, [8]);
	if (!waiting.find((w) => w.user_id === userId)) return null;
	try {
		return await createRoom(sql, waiting);
	} catch (err) {
		const msg = err instanceof Error ? err.message : "không tạo được Bí Cảnh";
		throw new Error(`Ghép Bí Cảnh thất bại: ${msg}`);
	}
}
var joinBrQueue_createServerFn_handler = createServerRpc({
	id: "afaccb95f4ef89df40bd6e8b7ccc22060948add8b642658f9d16405c0d9dbca2",
	name: "joinBrQueue",
	filename: "src/lib/server/survival.ts"
}, (opts) => joinBrQueue.__executeServer(opts));
var joinBrQueue = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input ?? {}).handler(joinBrQueue_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const me = await ensureProfile(sql, context.userId, data.displayName);
	const live = await findLiveRoom(sql, context.userId);
	if (live) return {
		status: "matched",
		room: toRoom(live, await loadPlayers(sql, live.id), context.userId)
	};
	await sql.query(`insert into br_queue (user_id, user_name, elo, joined_at)
       values ($1,$2,$3,now())
       on conflict (user_id) do update set user_name = excluded.user_name, elo = excluded.elo, joined_at = now()`, [
		context.userId,
		me.displayName,
		me.elo
	]);
	const roomId = await tryMatch(sql, context.userId);
	if (roomId) {
		const room = await fetchRoom(sql, roomId);
		const players = await loadPlayers(sql, roomId);
		if (room) return {
			status: "matched",
			room: toRoom(room, players, context.userId)
		};
	}
	return {
		status: "queuing",
		room: null
	};
});
var pollBrQueue_createServerFn_handler = createServerRpc({
	id: "62477c4d26065f5f4541e09838d158d4908107c858d6e73f06c4cc0ea2bb773c",
	name: "pollBrQueue",
	filename: "src/lib/server/survival.ts"
}, (opts) => pollBrQueue.__executeServer(opts));
var pollBrQueue = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(pollBrQueue_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const roomId = await tryMatch(sql, context.userId);
	if (roomId) {
		let room = await fetchRoom(sql, roomId);
		if (room) {
			room = await tickRoom(sql, room);
			const players = await loadPlayers(sql, room.id);
			return {
				status: "matched",
				room: toRoom(room, players, context.userId)
			};
		}
	}
	const live = await findLiveRoom(sql, context.userId);
	if (live) {
		const ticked = await tickRoom(sql, live);
		return {
			status: "matched",
			room: toRoom(ticked, await loadPlayers(sql, ticked.id), context.userId)
		};
	}
	return {
		status: "queuing",
		room: null
	};
});
var leaveBrQueue_createServerFn_handler = createServerRpc({
	id: "8442ca29bb8a6b35907ec00eae17e41b8987617026d1d3e87bc7ad490cf25e4d",
	name: "leaveBrQueue",
	filename: "src/lib/server/survival.ts"
}, (opts) => leaveBrQueue.__executeServer(opts));
var leaveBrQueue = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(leaveBrQueue_createServerFn_handler, async ({ context }) => {
	await (await getSql()).query(`delete from br_queue where user_id = $1`, [context.userId]);
	return { ok: true };
});
var getBrRoom_createServerFn_handler = createServerRpc({
	id: "0acf986e81d8b5ad472ed2a3bdd842b95a56638300c1fe870e171747ff047c77",
	name: "getBrRoom",
	filename: "src/lib/server/survival.ts"
}, (opts) => getBrRoom.__executeServer(opts));
var getBrRoom = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((roomId) => roomId).handler(getBrRoom_createServerFn_handler, async ({ context, data: roomId }) => {
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	let room = await fetchRoom(sql, roomId);
	if (!room) throw new Error("Không tìm thấy Bí Cảnh");
	room = await tickRoom(sql, room);
	const players = await loadPlayers(sql, room.id);
	const mine = players.find((p) => p.user_id === context.userId);
	let gains;
	if (room.status === "completed" && mine?.placement != null) {
		const rew = brRewards(Number(mine.placement));
		const bonus = perkBonus(await equippedPerks(sql, context.userId));
		gains = {
			exp: Math.round(rew.exp * bonus.expMul),
			thach: rew.thach + (Number(mine.placement) === 1 ? bonus.extraThach : 0)
		};
	}
	return toRoom(room, players, context.userId, gains);
});
var submitBrAnswer_createServerFn_handler = createServerRpc({
	id: "e54f2db5595267e5d5a36d7993fd0bc9aecbb758ad3c7964d285c048717a69ca",
	name: "submitBrAnswer",
	filename: "src/lib/server/survival.ts"
}, (opts) => submitBrAnswer.__executeServer(opts));
var submitBrAnswer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(submitBrAnswer_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	let room = await fetchRoom(sql, data.roomId);
	if (!room) throw new Error("Không tìm thấy Bí Cảnh");
	room = await tickRoom(sql, room);
	if (room.status !== "playing") throw new Error("Chưa đến lượt trả lời");
	if (Number(room.countdown_left ?? 0) > 0) throw new Error("Đang niêm phong");
	const mine = await sql.query(`select is_alive, answer from br_players where room_id = $1 and user_id = $2`, [data.roomId, context.userId]);
	if (!mine[0]?.is_alive) throw new Error("Đạo hữu đã rơi");
	if (mine[0].answer) {
		const players = await loadPlayers(sql, room.id);
		return toRoom(room, players, context.userId);
	}
	await sql.query(`update br_players set answer = $3, answered_at = now()
       where room_id = $1 and user_id = $2 and is_alive = true and answer is null`, [
		data.roomId,
		context.userId,
		data.answer
	]);
	const players = await loadPlayers(sql, room.id);
	return toRoom(room, players, context.userId);
});
var getBrQuestion_createServerFn_handler = createServerRpc({
	id: "92e4f2877feb1236c4a7d018e70149fb32d15db90b6acce813d61bf971c29b35",
	name: "getBrQuestion",
	filename: "src/lib/server/survival.ts"
}, (opts) => getBrQuestion.__executeServer(opts));
var getBrQuestion = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((roomId) => roomId).handler(getBrQuestion_createServerFn_handler, async ({ context, data: roomId }) => {
	const sql = await getSql();
	let room = await fetchRoom(sql, roomId);
	if (!room) throw new Error("Không tìm thấy Bí Cảnh");
	const qid = parseIds(room.question_ids)[Number(room.round_index)];
	if (!qid || room.status === "countdown") return { question: null };
	const q = (await sql.query(`select id, content, option_a, option_b, option_c, option_d, correct_answer, topic, difficulty, score
       from questions where id = $1`, [qid]))[0];
	if (!q) return { question: null };
	const bonus = perkBonus(await equippedPerks(sql, context.userId));
	const wrong = [
		"A",
		"B",
		"C",
		"D"
	].filter((k) => k !== q.correct_answer);
	const faded = bonus.eliminate ? wrong[Number(room.round_index) % wrong.length] : null;
	return { question: {
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
		fadedOption: faded ?? null
	} };
});
//#endregion
export { getBrQuestion_createServerFn_handler, getBrRoom_createServerFn_handler, joinBrQueue_createServerFn_handler, leaveBrQueue_createServerFn_handler, pollBrQueue_createServerFn_handler, submitBrAnswer_createServerFn_handler };
