import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as AppShell } from "./app-shell-DOtshqRA.mjs";
import { i as listExams } from "./exams-Dp0ZgaXj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/exams-3zEXPkb9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ExamsPage() {
	const [exams, setExams] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		listExams().then(setExams).catch(() => setExams([]));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.16em] text-gold",
				children: "Trận pháp"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Kho Đề"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-xl text-muted",
				children: "Đề rải từ phong cách minh họa Bộ, VACT, TSA. Sau này đạo hữu tự đăng thêm."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 grid gap-4 md:grid-cols-2",
				children: exams.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/exams/$examId",
					params: { examId: e.id },
					className: "jade-frame block rounded-[24px] p-5 hover:border-primary/40",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.14em] text-gold",
							children: e.examType
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 font-display text-2xl font-semibold",
							children: e.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: e.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-xs text-subtle",
							children: [
								e.totalQuestions,
								" câu · ",
								Math.round(e.durationSeconds / 60),
								" phút · ",
								e.sourceLabel
							]
						})
					]
				}, e.id))
			})
		]
	}) });
}
//#endregion
export { ExamsPage as component };
