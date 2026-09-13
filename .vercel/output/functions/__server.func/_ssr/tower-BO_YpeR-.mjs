import { r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-DvBmSZow.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { c as perkBonus, n as ensureProfile, o as grantTowerClear, r as equippedPerks } from "./cultivation-CRtzj3Cp.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as ensureSeed } from "./seed-DGRl8yjE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tower-BO_YpeR-.js
var FLOOR_SECONDS = 90;
var QS_PER_FLOOR = 5;
function floorDiff(floor) {
	if (floor <= 3) return ["easy"];
	if (floor <= 6) return ["easy", "medium"];
	if (floor <= 9) return ["medium", "hard"];
	return ["hard"];
}
async function remainingOf(endsAt) {
	return Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1e3));
}
var getTowerStatus_createServerFn_handler = createServerRpc({
	id: "db2d65a35ed4cb0bed9978b7adcc7711c8d6f0fe43161841936784005444bf22",
	name: "getTowerStatus",
	filename: "src/lib/server/tower.ts"
}, (opts) => getTowerStatus.__executeServer(opts));
var getTowerStatus = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getTowerStatus_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const me = await ensureProfile(sql, context.userId);
	const live = await sql.query(`select id, floor, status, lives, question_ids, q_index, correct_count, ends_at::text as ends_at
       from tower_runs where user_id = $1 and status = 'in_progress'
       order by started_at desc limit 1`, [context.userId]);
	return {
		best: me.towerBestFloor,
		live: live[0] ? await hydrate(sql, live[0], context.userId) : null
	};
});
async function hydrate(sql, row, userId) {
	const ids = typeof row.question_ids === "string" ? JSON.parse(row.question_ids) : row.question_ids;
	const rem = await remainingOf(row.ends_at);
	if (rem <= 0 && row.status === "in_progress") {
		await sql.query(`update tower_runs set status='failed', finished_at=now() where id=$1 and user_id=$2`, [row.id, userId]);
		row.status = "failed";
	}
	const qs = await sql.query(`select id, order_index, content, option_a, option_b, option_c, option_d, correct_answer, topic, difficulty, score
     from questions where id = any($1::text[])`, [ids]);
	const byId = new Map(qs.map((q) => [q.id, q]));
	const bonus = perkBonus(await equippedPerks(sql, userId));
	const questions = ids.map((id, i) => {
		const q = byId.get(id);
		if (!q) return null;
		const wrong = [
			"A",
			"B",
			"C",
			"D"
		].filter((k) => k !== q.correct_answer);
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
			fadedOption: faded ?? null
		};
	}).filter((x) => Boolean(x));
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
			remaining: rem
		},
		questions
	};
}
var startTowerFloor_createServerFn_handler = createServerRpc({
	id: "6d58d3d70ce735057d33810e65b945375b2e54ef26c5f693efec90ee5c77bee6",
	name: "startTowerFloor",
	filename: "src/lib/server/tower.ts"
}, (opts) => startTowerFloor.__executeServer(opts));
var startTowerFloor = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((floor) => floor).handler(startTowerFloor_createServerFn_handler, async ({ context, data: floor }) => {
	await ensureSeed();
	if (floor < 1 || floor > 10) throw new Error("Tầng không hợp lệ");
	const sql = await getSql();
	if (floor > (await ensureProfile(sql, context.userId)).towerBestFloor + 1) throw new Error("Phải vượt tầng trước");
	await sql.query(`update tower_runs set status='failed', finished_at=now()
       where user_id=$1 and status='in_progress'`, [context.userId]);
	const diffs = floorDiff(floor);
	const pool = await sql.query(`select id from questions where difficulty = any($1::text[]) order by random() limit $2`, [diffs, QS_PER_FLOOR]);
	if (pool.length < 3) throw new Error("Kho đề tầng này chưa đủ");
	const bonus = perkBonus(await equippedPerks(sql, context.userId));
	const id = crypto.randomUUID();
	const secs = FLOOR_SECONDS + (floor === 10 ? 30 : 0) + bonus.extraTime;
	await sql.query(`insert into tower_runs (id, user_id, floor, question_ids, ends_at)
       values ($1,$2,$3,$4::jsonb, now() + ($5 * interval '1 second'))`, [
		id,
		context.userId,
		floor,
		JSON.stringify(pool.map((p) => p.id)),
		secs
	]);
	return hydrate(sql, (await sql.query(`select id, floor, status, lives, question_ids, q_index, correct_count, ends_at::text as ends_at
       from tower_runs where id = $1`, [id]))[0], context.userId);
});
var answerTower_createServerFn_handler = createServerRpc({
	id: "84fb1bae27e2e14200c8d29c467ae65c9aaab00db8d8502e3e09cc48dbd86719",
	name: "answerTower",
	filename: "src/lib/server/tower.ts"
}, (opts) => answerTower.__executeServer(opts));
var answerTower = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(answerTower_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const row = (await sql.query(`select id, floor, status, lives, question_ids, q_index, correct_count,
              ends_at::text as ends_at, answers
       from tower_runs where id = $1 and user_id = $2`, [data.runId, context.userId]))[0];
	if (!row) throw new Error("Không tìm thấy lượt leo tháp");
	if (row.status !== "in_progress") return hydrate(sql, row, context.userId);
	if (await remainingOf(row.ends_at) <= 0) {
		await sql.query(`update tower_runs set status='failed', finished_at=now() where id=$1`, [row.id]);
		row.status = "failed";
		return hydrate(sql, row, context.userId);
	}
	const ids = typeof row.question_ids === "string" ? JSON.parse(row.question_ids) : row.question_ids;
	if (ids[Number(row.q_index)] !== data.questionId) throw new Error("Không đúng câu hiện tại");
	const ok = (await sql.query(`select correct_answer from questions where id = $1`, [data.questionId]))[0]?.correct_answer === data.answer;
	const answers = typeof row.answers === "string" ? JSON.parse(row.answers) : row.answers;
	answers[data.questionId] = data.answer;
	if (!ok) {
		await sql.query(`update tower_runs set status='failed', answers=$2::jsonb, finished_at=now() where id=$1`, [row.id, JSON.stringify(answers)]);
		row.status = "failed";
		return {
			...await hydrate(sql, row, context.userId),
			correct: false,
			reward: null
		};
	}
	const nextIndex = Number(row.q_index) + 1;
	const correct = Number(row.correct_count) + 1;
	const cleared = nextIndex >= ids.length;
	await sql.query(`update tower_runs set q_index=$2, correct_count=$3, answers=$4::jsonb, status=$5,
              finished_at = case when $5='cleared' then now() else finished_at end
       where id=$1`, [
		row.id,
		nextIndex,
		correct,
		JSON.stringify(answers),
		cleared ? "cleared" : "in_progress"
	]);
	row.q_index = nextIndex;
	row.correct_count = correct;
	row.status = cleared ? "cleared" : "in_progress";
	const reward = cleared ? await grantTowerClear(sql, context.userId, Number(row.floor)) : null;
	return {
		...await hydrate(sql, row, context.userId),
		correct: true,
		reward
	};
});
//#endregion
export { answerTower_createServerFn_handler, getTowerStatus_createServerFn_handler, startTowerFloor_createServerFn_handler };
