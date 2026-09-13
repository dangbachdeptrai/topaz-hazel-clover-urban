import { r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-DvBmSZow.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor-CNA-76YP.js
var SYSTEM = `Bạn là Linh Sư Toán Đạo trong Linh Toán Các. Trả lời tiếng Việt, rõ, từng bước.
Dùng LaTeX trong $...$ khi viết công thức. Không bịa định lý. Nếu thiếu dữ liệu, hỏi lại.`;
var getTutorThread_createServerFn_handler = createServerRpc({
	id: "48abc9f53f53a7884731fd20f7839be50f037583bfa2b84c02d0d725b7aadfe6",
	name: "getTutorThread",
	filename: "src/lib/server/tutor.ts"
}, (opts) => getTutorThread.__executeServer(opts));
var getTutorThread = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getTutorThread_createServerFn_handler, async ({ context }) => {
	const raw = (await (await getSql()).query(`select messages from tutor_threads where user_id = $1`, [context.userId]))[0]?.messages;
	return (typeof raw === "string" ? JSON.parse(raw) : raw) ?? [];
});
var askTutor_createServerFn_handler = createServerRpc({
	id: "b107f237ca9ed80ce1e5dda960914203aee0444e45606497006e0b6310003053",
	name: "askTutor",
	filename: "src/lib/server/tutor.ts"
}, (opts) => askTutor.__executeServer(opts));
var askTutor = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(askTutor_createServerFn_handler, async ({ context, data }) => {
	const prompt = data.prompt.trim().slice(0, 2e3);
	if (!prompt) throw new Error("Hãy nêu câu hỏi");
	const apiKey = process.env.XAI_API_KEY;
	const sql = await getSql();
	const prev = await sql.query(`select messages from tutor_threads where user_id = $1`, [context.userId]);
	const history = (typeof prev[0]?.messages === "string" ? JSON.parse(prev[0].messages) : prev[0]?.messages) ?? [];
	const userMsg = {
		id: crypto.randomUUID(),
		role: "user",
		content: prompt
	};
	let replyText;
	if (!apiKey) replyText = "Luyện đan lò chưa kết nối linh khí AI trên máy này. Hãy nêu đề, mình sẽ giải khi lò sáng — hoặc thử lại sau.";
	else {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
				max_tokens: 900,
				messages: [
					{
						role: "system",
						content: SYSTEM
					},
					...history.slice(-8).map((m) => ({
						role: m.role,
						content: m.content
					})),
					{
						role: "user",
						content: prompt
					}
				]
			})
		});
		if (!res.ok) replyText = `Linh Sư bị nhiễu (${res.status}). Thử lại sau.`;
		else replyText = (await res.json()).choices[0]?.message.content ?? "…";
	}
	const assistant = {
		id: crypto.randomUUID(),
		role: "assistant",
		content: replyText
	};
	const next = [
		...history,
		userMsg,
		assistant
	].slice(-24);
	await sql.query(`insert into tutor_threads (id, user_id, messages, updated_at)
       values ($1,$2,$3::jsonb, now())
       on conflict (user_id) do update set messages = excluded.messages, updated_at = now()`, [
		crypto.randomUUID(),
		context.userId,
		JSON.stringify(next)
	]);
	return next;
});
//#endregion
export { askTutor_createServerFn_handler, getTutorThread_createServerFn_handler };
