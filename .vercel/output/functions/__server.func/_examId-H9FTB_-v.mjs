import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, b as useNavigate, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { s as Route$9 } from "./_ssr/router-DJhk53gV.mjs";
import { n as useCurrentUserState } from "./_ssr/spirit-field-B_Qsd57d.mjs";
import { t as AppShell } from "./_ssr/app-shell-DOtshqRA.mjs";
import { t as Button } from "./_ssr/button-mJbfH0JE.mjs";
import { t as RedirectToSignIn } from "./_ssr/gates-CUxTjxua.mjs";
import { n as getExam, s as startAttempt } from "./_ssr/exams-Dp0ZgaXj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_examId-H9FTB_-v.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ExamIntro() {
	const { examId } = Route$9.useParams();
	const navigate = useNavigate();
	const { user, isPending } = useCurrentUserState();
	const [exam, setExam] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		getExam({ data: examId }).then(setExam);
	}, [examId]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	async function go() {
		setBusy(true);
		try {
			const { attemptId } = await startAttempt({ data: examId });
			sessionStorage.setItem("ltc-attempt", attemptId);
			await navigate({
				to: "/exams/$examId/take",
				params: { examId }
			});
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.16em] text-gold",
				children: exam?.examType
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: exam?.title ?? "…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted",
				children: exam?.description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-subtle",
				children: [
					exam?.authorName,
					" · ",
					exam?.totalQuestions,
					" câu · ",
					Math.round((exam?.durationSeconds ?? 0) / 60),
					" phút"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "lg",
					onClick: () => void go(),
					disabled: busy || !user,
					children: "Bắt đầu thi"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/exams",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						variant: "outline",
						children: "Quay lại"
					})
				})]
			})
		]
	}) });
}
//#endregion
export { ExamIntro as component };
