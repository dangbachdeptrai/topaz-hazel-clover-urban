import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as Route } from "./_ssr/router-DJhk53gV.mjs";
import { n as useCurrentUserState } from "./_ssr/spirit-field-B_Qsd57d.mjs";
import { t as cn } from "./_ssr/utils-GQBtw7X5.mjs";
import { t as AppShell } from "./_ssr/app-shell-DOtshqRA.mjs";
import { t as Button } from "./_ssr/button-mJbfH0JE.mjs";
import { t as RedirectToSignIn } from "./_ssr/gates-CUxTjxua.mjs";
import { t as getAttemptResult } from "./_ssr/exams-Dp0ZgaXj.mjs";
import { t as MathText } from "./_ssr/math-text-BDGPAQJK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_examId.result._attemptId-CGt-uuM_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResultPage() {
	const { examId, attemptId } = Route.useParams();
	const { user, isPending } = useCurrentUserState();
	const [data, setData] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getAttemptResult({ data: attemptId }).then(setData);
	}, [attemptId]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.16em] text-gold",
				children: "Kết quả"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-3xl font-semibold",
				children: data?.examTitle ?? "…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-display text-5xl font-semibold text-primary",
				children: (data?.score ?? 0).toFixed(2)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 space-y-4",
				children: data?.items.map((q, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "jade-frame rounded-[20px] p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-subtle",
							children: ["Câu ", i + 1]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 font-medium",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MathText, { text: q.content })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: cn("mt-2 text-sm", q.ok ? "text-primary" : "text-danger"),
							children: [
								"Bạn chọn ",
								q.picked ?? "—",
								" · Đáp án ",
								q.correct_answer
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MathText, { text: q.explanation })
						})
					]
				}, q.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/exams/$examId",
				params: { examId },
				className: "mt-8 inline-block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Thi lại" })
			})
		]
	}) });
}
//#endregion
export { ResultPage as component };
