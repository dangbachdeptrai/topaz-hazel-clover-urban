import { r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-DvBmSZow.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { n as ensureProfile } from "./cultivation-CRtzj3Cp.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forge-BDOxtc8t.js
var forgeExam_createServerFn_handler = createServerRpc({
	id: "faccd1f1fe1ecaedd46a8bd3032681be8d9b18b7bbe5b5231bbb40dfdd59ac0c",
	name: "forgeExam",
	filename: "src/lib/server/forge.ts"
}, (opts) => forgeExam.__executeServer(opts));
var forgeExam = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(forgeExam_createServerFn_handler, async ({ context, data }) => {
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
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: 2500,
			response_format: { type: "json_object" },
			messages: [{
				role: "system",
				content: "Sinh đề trắc nghiệm toán tiếng Việt. Trả JSON: {\"title\":\"...\",\"questions\":[{\"content\":\"... dùng $latex$\",\"optionA\":\"\",\"optionB\":\"\",\"optionC\":\"\",\"optionD\":\"\",\"correct\":\"A|B|C|D\",\"explanation\":\"\",\"topic\":\"\",\"difficulty\":\"easy|medium|hard\",\"score\":0.5}]}. 6-10 câu."
			}, {
				role: "user",
				content: prompt
			}]
		})
	});
	if (!res.ok) throw new Error(`Lò đan lỗi ${res.status}`);
	const raw = (await res.json()).choices[0]?.message.content ?? "{}";
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		throw new Error("Không đọc được trận pháp từ AI");
	}
	const qs = (parsed.questions ?? []).slice(0, 10);
	if (qs.length < 4) throw new Error("AI sinh quá ít câu — thử prompt khác");
	const id = `forge-${crypto.randomUUID()}`;
	const title = (parsed.title ?? "Đề luyện đan").slice(0, 80);
	await sql.query(`insert into exams (id, title, exam_type, duration_seconds, total_questions, description, author_name, source_label, is_public, created_by)
       values ($1,$2,'FORGED',900,$3,$4,$5,'Luyện Đan', true, $6)`, [
		id,
		title,
		qs.length,
		prompt.slice(0, 200),
		"Luyện Đan Lô",
		context.userId
	]);
	for (let i = 0; i < qs.length; i++) {
		const q = qs[i];
		const correct = [
			"A",
			"B",
			"C",
			"D"
		].includes(q.correct) ? q.correct : "A";
		await sql.query(`insert into questions
          (id, exam_id, order_index, content, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty, score)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, [
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
			Number(q.score) || .5
		]);
	}
	return {
		examId: id,
		title,
		count: qs.length
	};
});
//#endregion
export { forgeExam_createServerFn_handler };
