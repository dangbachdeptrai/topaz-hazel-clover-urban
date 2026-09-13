import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { n as useCurrentUserState } from "./spirit-field-B_Qsd57d.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as AppShell } from "./app-shell-DOtshqRA.mjs";
import { t as Button } from "./button-mJbfH0JE.mjs";
import { t as RedirectToSignIn } from "./gates-CUxTjxua.mjs";
import { t as MathText } from "./math-text-BDGPAQJK.mjs";
import { t as Textarea } from "./textarea-BhoYDAn4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor-DH-zhu4e.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var getTutorThread = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("48abc9f53f53a7884731fd20f7839be50f037583bfa2b84c02d0d725b7aadfe6"));
var askTutor = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("b107f237ca9ed80ce1e5dda960914203aee0444e45606497006e0b6310003053"));
function TutorPage() {
	const { user, isPending } = useCurrentUserState();
	const [msgs, setMsgs] = (0, import_react.useState)([]);
	const [prompt, setPrompt] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (user) getTutorThread().then(setMsgs).catch(() => setMsgs([]));
	}, [user]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	async function send() {
		if (!prompt.trim()) return;
		setBusy(true);
		try {
			const next = await askTutor({ data: { prompt } });
			setMsgs(next);
			setPrompt("");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-2xl flex-col px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.16em] text-gold",
				children: "Linh Sư"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Hỏi đáp toán đạo"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 min-h-64 space-y-3",
				children: [msgs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Hỏi một bài — Linh Sư giải từng bước bằng LaTeX."
				}), msgs.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: m.role === "user" ? "ml-8 rounded-[16px] bg-primary/10 px-4 py-3 text-sm" : "mr-8 jade-frame rounded-[16px] px-4 py-3 text-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MathText, { text: m.content })
				}, m.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: prompt,
					onChange: (e) => setPrompt(e.target.value),
					placeholder: "Ví dụ: Giải ∫ x e^x dx"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-3",
					disabled: busy,
					onClick: () => void send(),
					children: busy ? "Đang suy…" : "Hỏi Linh Sư"
				})]
			})
		]
	}) });
}
//#endregion
export { TutorPage as component };
