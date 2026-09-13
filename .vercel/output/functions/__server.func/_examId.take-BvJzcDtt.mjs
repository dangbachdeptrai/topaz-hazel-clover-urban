import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, b as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { p as Clock } from "./_libs/lucide-react.mjs";
import { r as Route$1 } from "./_ssr/router-DJhk53gV.mjs";
import { n as useCurrentUserState, t as SpiritField } from "./_ssr/spirit-field-B_Qsd57d.mjs";
import { n as formatTime, t as cn } from "./_ssr/utils-GQBtw7X5.mjs";
import { t as Button } from "./_ssr/button-mJbfH0JE.mjs";
import { t as RedirectToSignIn } from "./_ssr/gates-CUxTjxua.mjs";
import { c as submitAttempt, n as getExam, r as getQuestionsPublic } from "./_ssr/exams-Dp0ZgaXj.mjs";
import { t as MathText } from "./_ssr/math-text-BDGPAQJK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_examId.take-BvJzcDtt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TakeExam() {
	const { examId } = Route$1.useParams();
	const navigate = useNavigate();
	const { user, isPending } = useCurrentUserState();
	const [exam, setExam] = (0, import_react.useState)(null);
	const [qs, setQs] = (0, import_react.useState)([]);
	const [index, setIndex] = (0, import_react.useState)(0);
	const [picked, setPicked] = (0, import_react.useState)({});
	const [left, setLeft] = (0, import_react.useState)(null);
	const [attemptId, setAttemptId] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setAttemptId(sessionStorage.getItem("ltc-attempt") ?? "");
	}, []);
	(0, import_react.useEffect)(() => {
		getExam({ data: examId }).then(setExam);
		getQuestionsPublic({ data: {
			examId,
			applyPerks: true
		} }).then(setQs);
	}, [examId]);
	(0, import_react.useEffect)(() => {
		if (!exam) return;
		setLeft(exam.durationSeconds);
		const t = window.setInterval(() => setLeft((v) => v == null ? v : Math.max(0, v - 1)), 1e3);
		return () => window.clearInterval(t);
	}, [exam]);
	(0, import_react.useEffect)(() => {
		if (left === 0) submit();
	}, [left]);
	const current = qs[index];
	const options = (0, import_react.useMemo)(() => {
		if (!current) return [];
		return [
			{
				key: "A",
				value: current.optionA
			},
			{
				key: "B",
				value: current.optionB
			},
			{
				key: "C",
				value: current.optionC
			},
			{
				key: "D",
				value: current.optionD
			}
		];
	}, [current]);
	async function submit() {
		if (!attemptId) return;
		await submitAttempt({ data: {
			attemptId,
			answers: picked
		} });
		await navigate({
			to: "/exams/$examId/result/$attemptId",
			params: {
				examId,
				attemptId
			}
		});
	}
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-dvh flex-col bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpiritField, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "relative z-10 border-b border-border bg-bg-elevated",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-3xl items-center justify-between px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm",
						children: exam?.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1.5 font-mono text-sm tabular-nums",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4" }), left == null ? "--:--" : formatTime(left)]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10 mx-auto w-full max-w-3xl flex-1 p-4",
				children: current && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "scripture-sheet rounded-[24px] p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-subtle",
							children: [
								"Câu ",
								index + 1,
								"/",
								qs.length
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-xl font-semibold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MathText, { text: current.content })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5 grid gap-2 sm:grid-cols-2",
							children: options.map((opt) => {
								if (current.fadedOption === opt.key) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-h-14 rounded-[16px] border-2 border-dashed border-border/60 px-4 py-3 text-left text-subtle line-through",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-semibold",
										children: [opt.key, "."]
									}), " đã bị Minh Nhãn soi"]
								}, opt.key);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setPicked((p) => ({
										...p,
										[current.id]: opt.key
									})),
									className: cn("min-h-14 rounded-[16px] border-2 px-4 py-3 text-left", picked[current.id] === opt.key ? "border-primary bg-primary/8" : "border-border hover:border-primary/40"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-semibold",
											children: [opt.key, "."]
										}),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MathText, { text: opt.value })
									]
								}, opt.key);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								disabled: index === 0,
								onClick: () => setIndex((i) => i - 1),
								children: "Trước"
							}), index < qs.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => setIndex((i) => i + 1),
								children: "Sau"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "gold",
								onClick: () => void submit(),
								children: "Nộp bài"
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
export { TakeExam as component };
