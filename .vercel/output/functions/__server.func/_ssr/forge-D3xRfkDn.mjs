import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { n as useCurrentUserState } from "./spirit-field-B_Qsd57d.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as AppShell } from "./app-shell-DOtshqRA.mjs";
import { t as Button } from "./button-mJbfH0JE.mjs";
import { t as RedirectToSignIn } from "./gates-CUxTjxua.mjs";
import { t as Textarea } from "./textarea-BhoYDAn4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forge-D3xRfkDn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var forgeExam = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("faccd1f1fe1ecaedd46a8bd3032681be8d9b18b7bbe5b5231bbb40dfdd59ac0c"));
function ForgePage() {
	const { user, isPending } = useCurrentUserState();
	const [prompt, setPrompt] = (0, import_react.useState)("Tạo 8 câu trắc nghiệm Toán 12 về nguyên hàm, mức vận dụng, có lời giải.");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [made, setMade] = (0, import_react.useState)(null);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	async function run() {
		setBusy(true);
		setError(null);
		setMade(null);
		try {
			const r = await forgeExam({ data: { prompt } });
			setMade(r);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Lò đan lỗi");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.16em] text-gold",
				children: "Khởi tạo trận pháp"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Luyện Đan Lô"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted",
				children: "Nêu yêu cầu. AI sinh đề chuẩn A–D, đáp án và lời giải, rồi lưu vào Kho Đề."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				className: "mt-6",
				value: prompt,
				onChange: (e) => setPrompt(e.target.value)
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-danger",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				size: "lg",
				disabled: busy,
				onClick: () => void run(),
				children: busy ? "Đang luyện…" : "Luyện đan"
			}),
			made && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "jade-frame mt-6 rounded-[20px] p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl font-semibold",
						children: made.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [made.count, " câu đã vào kho."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/exams/$examId",
						params: { examId: made.examId },
						className: "mt-4 inline-block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Vào đề vừa luyện" })
					})
				]
			})
		]
	}) });
}
//#endregion
export { ForgePage as component };
