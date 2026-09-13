import { r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-DvBmSZow.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { n as ensureProfile } from "./cultivation-CRtzj3Cp.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/documents-CSQABc-5.js
var MAX = 15e5;
var listMyDocs_createServerFn_handler = createServerRpc({
	id: "e7460d1e3960b9b3028a68f803bf34fec57bf9dad714ab81aa6cb8bbea2fd763",
	name: "listMyDocs",
	filename: "src/lib/server/documents.ts"
}, (opts) => listMyDocs.__executeServer(opts));
var listMyDocs = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listMyDocs_createServerFn_handler, async ({ context }) => {
	return (await (await getSql()).query(`select id, title, mime, size_bytes, created_at::text as created_at
       from documents where user_id = $1 order by created_at desc`, [context.userId])).map((r) => ({
		id: r.id,
		title: r.title,
		mime: r.mime,
		sizeBytes: Number(r.size_bytes),
		createdAt: r.created_at
	}));
});
var uploadDoc_createServerFn_handler = createServerRpc({
	id: "de3efd1e4d205a38ab2e81c1083e89d2131e6ad601135fff3d13206314d239d7",
	name: "uploadDoc",
	filename: "src/lib/server/documents.ts"
}, (opts) => uploadDoc.__executeServer(opts));
var uploadDoc = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(uploadDoc_createServerFn_handler, async ({ context, data }) => {
	const raw = data.dataB64.replace(/^data:[^;]+;base64,/, "");
	const size = Math.ceil(raw.length * 3 / 4);
	if (size > MAX) throw new Error("File quá lớn (tối đa ~1.1MB)");
	const title = data.title.trim().slice(0, 80) || "Tài liệu";
	const mime = data.mime.slice(0, 80) || "application/octet-stream";
	const sql = await getSql();
	const id = crypto.randomUUID();
	await sql.query(`insert into documents (id, user_id, title, mime, size_bytes, data_b64)
       values ($1,$2,$3,$4,$5,$6)`, [
		id,
		context.userId,
		title,
		mime,
		size,
		raw
	]);
	return { id };
});
var getDoc_createServerFn_handler = createServerRpc({
	id: "151af5a0165119b8f4cdc1226420f549eecc8abd87ed641924aabd682e850781",
	name: "getDoc",
	filename: "src/lib/server/documents.ts"
}, (opts) => getDoc.__executeServer(opts));
var getDoc = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => id).handler(getDoc_createServerFn_handler, async ({ context, data: id }) => {
	const rows = await (await getSql()).query(`select id, title, mime, size_bytes, data_b64, created_at::text as created_at
       from documents where id = $1 and user_id = $2`, [id, context.userId]);
	return rows[0] ? {
		id: rows[0].id,
		title: rows[0].title,
		mime: rows[0].mime,
		sizeBytes: Number(rows[0].size_bytes),
		dataB64: rows[0].data_b64,
		createdAt: rows[0].created_at
	} : null;
});
var deleteDoc_createServerFn_handler = createServerRpc({
	id: "3ff88eda08ef213eed20ac11ecc4c1ddf2848bf3dcbbe89a8bf0545b13e1fd42",
	name: "deleteDoc",
	filename: "src/lib/server/documents.ts"
}, (opts) => deleteDoc.__executeServer(opts));
var deleteDoc = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(deleteDoc_createServerFn_handler, async ({ context, data: id }) => {
	await (await getSql()).query(`delete from documents where id = $1 and user_id = $2`, [id, context.userId]);
	return { ok: true };
});
var extractExamFromDoc_createServerFn_handler = createServerRpc({
	id: "5f49162375af8c0cb2702f0f34d44ac9c0d15316701adffe929d0a7aa80c61d5",
	name: "extractExamFromDoc",
	filename: "src/lib/server/documents.ts"
}, (opts) => extractExamFromDoc.__executeServer(opts));
var extractExamFromDoc = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((docId) => docId).handler(extractExamFromDoc_createServerFn_handler, async ({ context, data: docId }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) throw new Error("Linh khí AI chưa sẵn — thử lại sau");
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const doc = (await sql.query(`select title, mime, data_b64 from documents where id = $1 and user_id = $2`, [docId, context.userId]))[0];
	if (!doc) throw new Error("Không tìm thấy tài liệu");
	if (!doc.mime.startsWith("image/")) throw new Error("OCR dùng ảnh đề (JPG/PNG/WEBP). Hãy chụp trang PDF rồi cất ảnh.");
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
				content: "Đọc ảnh đề toán tiếng Việt. Bóc trắc nghiệm A-D. Trả JSON: {\"title\":\"...\",\"questions\":[{\"content\":\"... dùng $latex$\",\"optionA\":\"\",\"optionB\":\"\",\"optionC\":\"\",\"optionD\":\"\",\"correct\":\"A|B|C|D\",\"explanation\":\"\",\"topic\":\"\",\"difficulty\":\"easy|medium|hard\",\"score\":0.5}]}. Nếu không rõ đáp án, đoán hợp lý và ghi trong explanation. 4-10 câu."
			}, {
				role: "user",
				content: [{
					type: "text",
					text: `Bóc đề từ tài liệu: ${doc.title}`
				}, {
					type: "image_url",
					image_url: { url: `data:${doc.mime};base64,${doc.data_b64}` }
				}]
			}]
		})
	});
	if (!res.ok) throw new Error(`OCR lỗi ${res.status}`);
	const raw = (await res.json()).choices[0]?.message.content ?? "{}";
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		throw new Error("Không đọc được trận pháp từ ảnh");
	}
	const qs = (parsed.questions ?? []).slice(0, 10);
	if (qs.length < 3) throw new Error("Ảnh chưa đủ câu trắc nghiệm — thử ảnh rõ hơn");
	const id = `ocr-${crypto.randomUUID()}`;
	const title = (parsed.title ?? doc.title).slice(0, 80);
	await sql.query(`insert into exams (id, title, exam_type, duration_seconds, total_questions, description, author_name, source_label, is_public, created_by)
       values ($1,$2,'FORGED',900,$3,$4,$5,'OCR Tàng Thư', true, $6)`, [
		id,
		title,
		qs.length,
		`Bóc từ ${doc.title}`,
		"Thiên Nhãn OCR",
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
export { deleteDoc_createServerFn_handler, extractExamFromDoc_createServerFn_handler, getDoc_createServerFn_handler, listMyDocs_createServerFn_handler, uploadDoc_createServerFn_handler };
