import { r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-DvBmSZow.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { c as perkBonus, r as equippedPerks } from "./cultivation-CRtzj3Cp.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as ensureSeed } from "./seed-DGRl8yjE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/exams-D7sQtGMN.js
function mapExam(r) {
	return {
		id: r.id,
		title: r.title,
		examType: r.exam_type,
		durationSeconds: Number(r.duration_seconds),
		totalQuestions: Number(r.total_questions),
		description: r.description,
		authorName: r.author_name,
		sourceLabel: r.source_label,
		isPublic: Boolean(r.is_public)
	};
}
var listExams_createServerFn_handler = createServerRpc({
	id: "928f5d631e9a8401ae133c2b689acdb7234b8e8e3bb0dcd65d8ab92fe7afd49b",
	name: "listExams",
	filename: "src/lib/server/exams.ts"
}, (opts) => listExams.__executeServer(opts));
var listExams = createServerFn({ method: "GET" }).handler(listExams_createServerFn_handler, async () => {
	await ensureSeed();
	return (await (await getSql()).query(`select id, title, exam_type, duration_seconds, total_questions, description, author_name, source_label, is_public
     from exams where is_public = true and exam_type in ('VACT','THPTQG','TSA','PVP')
     order by exam_type, title`)).map(mapExam);
});
var getExam_createServerFn_handler = createServerRpc({
	id: "23d80bf60615fdf8fce610f9160ed9e93861f8522f8debacb988cd12b8b2ba4a",
	name: "getExam",
	filename: "src/lib/server/exams.ts"
}, (opts) => getExam.__executeServer(opts));
var getExam = createServerFn({ method: "GET" }).validator((id) => id).handler(getExam_createServerFn_handler, async ({ data: id }) => {
	await ensureSeed();
	const rows = await (await getSql()).query(`select id, title, exam_type, duration_seconds, total_questions, description, author_name, source_label, is_public
       from exams where id = $1`, [id]);
	return rows[0] ? mapExam(rows[0]) : null;
});
function fadeWrong(q) {
	const wrong = [
		"A",
		"B",
		"C",
		"D"
	].filter((k) => k !== q.correct_answer);
	let h = 2166136261;
	for (let i = 0; i < q.id.length; i++) h = Math.imul(h ^ q.id.charCodeAt(i), 16777619);
	return wrong[(h >>> 0) % wrong.length] ?? null;
}
var getQuestionsPublic_createServerFn_handler = createServerRpc({
	id: "cd36957d1ecf46423ab3bb5924cf57d3be72ceb3a01daf49d38d18b7f4ad54a8",
	name: "getQuestionsPublic",
	filename: "src/lib/server/exams.ts"
}, (opts) => getQuestionsPublic.__executeServer(opts));
var getQuestionsPublic = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(getQuestionsPublic_createServerFn_handler, async ({ context, data }) => {
	await ensureSeed();
	const sql = await getSql();
	const rows = await sql.query(`select id, order_index, content, option_a, option_b, option_c, option_d, correct_answer, topic, difficulty, score
       from questions where exam_id = $1 order by order_index`, [data.examId]);
	const bonus = data.applyPerks ? perkBonus(await equippedPerks(sql, context.userId)) : perkBonus([]);
	return rows.map((r) => ({
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
		fadedOption: bonus.eliminate ? fadeWrong(r) : null
	}));
});
var listQuestionTopics_createServerFn_handler = createServerRpc({
	id: "14b983f3605c1a3c2138a76492eb6318716f842b8d19a7e3f39214261691378b",
	name: "listQuestionTopics",
	filename: "src/lib/server/exams.ts"
}, (opts) => listQuestionTopics.__executeServer(opts));
var listQuestionTopics = createServerFn({ method: "GET" }).handler(listQuestionTopics_createServerFn_handler, async () => {
	await ensureSeed();
	return (await (await getSql()).query(`select distinct topic from questions where topic <> '' order by topic`)).map((r) => r.topic);
});
var startAttempt_createServerFn_handler = createServerRpc({
	id: "f8c01a56b411516d39eb0b42d701753c0541977d2e629f34be59d681867a133c",
	name: "startAttempt",
	filename: "src/lib/server/exams.ts"
}, (opts) => startAttempt.__executeServer(opts));
var startAttempt = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((examId) => examId).handler(startAttempt_createServerFn_handler, async ({ context, data: examId }) => {
	const sql = await getSql();
	const id = crypto.randomUUID();
	await sql.query(`insert into exam_attempts (id, exam_id, user_id) values ($1,$2,$3)`, [
		id,
		examId,
		context.userId
	]);
	return { attemptId: id };
});
var submitAttempt_createServerFn_handler = createServerRpc({
	id: "7181aa7c70f6733f69ee0210027b939bfab3a75a4c3f380ed87119b72741272b",
	name: "submitAttempt",
	filename: "src/lib/server/exams.ts"
}, (opts) => submitAttempt.__executeServer(opts));
var submitAttempt = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(submitAttempt_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const att = await sql.query(`select exam_id, started_at::text as started_at from exam_attempts where id = $1 and user_id = $2`, [data.attemptId, context.userId]);
	if (!att[0]) throw new Error("Không tìm thấy bài làm");
	const qs = await sql.query(`select id, correct_answer, score from questions where exam_id = $1`, [att[0].exam_id]);
	let score = 0;
	for (const q of qs) if (data.answers[q.id] === q.correct_answer) score += Number(q.score);
	score = Math.round(score * 100) / 100;
	const spent = Math.max(0, Math.floor((Date.now() - new Date(att[0].started_at).getTime()) / 1e3));
	await sql.query(`update exam_attempts set answers=$1::jsonb, score=$2, submitted_at=now(), time_spent_seconds=$3
       where id=$4 and user_id=$5`, [
		JSON.stringify(data.answers),
		score,
		spent,
		data.attemptId,
		context.userId
	]);
	return {
		score,
		total: qs.length
	};
});
var getAttemptResult_createServerFn_handler = createServerRpc({
	id: "b6420109b2448beb2882bb7267a2adbe7c71fbb8fec18b54c47fd913151f3d4d",
	name: "getAttemptResult",
	filename: "src/lib/server/exams.ts"
}, (opts) => getAttemptResult.__executeServer(opts));
var getAttemptResult = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((attemptId) => attemptId).handler(getAttemptResult_createServerFn_handler, async ({ context, data: attemptId }) => {
	const sql = await getSql();
	const r = (await sql.query(`select a.id, a.exam_id, e.title, a.score, a.answers
       from exam_attempts a join exams e on e.id = a.exam_id
       where a.id = $1 and a.user_id = $2`, [attemptId, context.userId]))[0];
	if (!r) return null;
	const qs = await sql.query(`select id, content, option_a, option_b, option_c, option_d, correct_answer, explanation
       from questions where exam_id = $1 order by order_index`, [r.exam_id]);
	const answers = typeof r.answers === "string" ? JSON.parse(r.answers) : r.answers;
	return {
		id: r.id,
		examId: r.exam_id,
		examTitle: r.title,
		score: Number(r.score ?? 0),
		items: qs.map((q) => ({
			...q,
			picked: answers[q.id] ?? null,
			ok: answers[q.id] === q.correct_answer
		}))
	};
});
var listMyAttempts_createServerFn_handler = createServerRpc({
	id: "b96900da767a7e8525e606b69c7789f077463f705016417e650775664d5699bd",
	name: "listMyAttempts",
	filename: "src/lib/server/exams.ts"
}, (opts) => listMyAttempts.__executeServer(opts));
var listMyAttempts = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listMyAttempts_createServerFn_handler, async ({ context }) => {
	return (await (await getSql()).query(`select a.id, a.exam_id, e.title, e.exam_type, a.score, a.submitted_at::text as submitted_at
       from exam_attempts a join exams e on e.id = a.exam_id
       where a.user_id = $1 and a.submitted_at is not null
       order by a.submitted_at desc limit 20`, [context.userId])).map((r) => ({
		id: r.id,
		examId: r.exam_id,
		examTitle: r.title,
		examType: r.exam_type,
		score: r.score == null ? null : Number(r.score),
		submittedAt: r.submitted_at
	}));
});
//#endregion
export { getAttemptResult_createServerFn_handler, getExam_createServerFn_handler, getQuestionsPublic_createServerFn_handler, listExams_createServerFn_handler, listMyAttempts_createServerFn_handler, listQuestionTopics_createServerFn_handler, startAttempt_createServerFn_handler, submitAttempt_createServerFn_handler };
