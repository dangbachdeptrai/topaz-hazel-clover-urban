import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { n as useCurrentUserState } from "./spirit-field-B_Qsd57d.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { i as getMyCultivation } from "./cultivation-CRtzj3Cp.mjs";
import { n as formatTime, t as cn } from "./utils-GQBtw7X5.mjs";
import { t as AppShell } from "./app-shell-DOtshqRA.mjs";
import { t as Button } from "./button-mJbfH0JE.mjs";
import { t as RedirectToSignIn } from "./gates-CUxTjxua.mjs";
import { t as MathText } from "./math-text-BDGPAQJK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tower-CrVr7mgD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var getTowerStatus = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("db2d65a35ed4cb0bed9978b7adcc7711c8d6f0fe43161841936784005444bf22"));
var startTowerFloor = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((floor) => floor).handler(createSsrRpc("6d58d3d70ce735057d33810e65b945375b2e54ef26c5f693efec90ee5c77bee6"));
var answerTower = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("84fb1bae27e2e14200c8d29c467ae65c9aaab00db8d8502e3e09cc48dbd86719"));
function TowerPage() {
	const { user, isPending } = useCurrentUserState();
	const [best, setBest] = (0, import_react.useState)(0);
	const [run, setRun] = (0, import_react.useState)(null);
	const [qs, setQs] = (0, import_react.useState)([]);
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [msg, setMsg] = (0, import_react.useState)(null);
	const [left, setLeft] = (0, import_react.useState)(0);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const load = (0, import_react.useCallback)(() => {
		getTowerStatus().then((s) => {
			setBest(s.best);
			setRun(s.live?.run ?? null);
			setQs(s.live?.questions ?? []);
		}).catch(() => void 0);
		getMyCultivation({ data: { displayName: user?.displayName ?? void 0 } }).then(setProfile).catch(() => void 0);
	}, [user]);
	(0, import_react.useEffect)(() => {
		if (user) load();
	}, [user, load]);
	(0, import_react.useEffect)(() => {
		if (!run || run.status !== "in_progress") return;
		setLeft(run.remaining);
		const t = window.setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1e3);
		return () => window.clearInterval(t);
	}, [
		run?.id,
		run?.status,
		run?.remaining
	]);
	const current = qs[run?.index ?? 0];
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
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	async function enter(floor) {
		setBusy(true);
		setMsg(null);
		try {
			const r = await startTowerFloor({ data: floor });
			setRun(r.run);
			setQs(r.questions);
		} catch (err) {
			setMsg(err instanceof Error ? err.message : "Không vào tầng được");
		} finally {
			setBusy(false);
		}
	}
	async function pick(answer) {
		if (!run || !current) return;
		setBusy(true);
		try {
			const r = await answerTower({ data: {
				runId: run.id,
				questionId: current.id,
				answer
			} });
			setRun(r.run);
			setQs(r.questions);
			if ("correct" in r && r.correct === false) setMsg("Sai rồi — rơi khỏi tầng này.");
			if ("reward" in r && r.reward) setMsg(`Vượt tầng! +${r.reward.expGain} Tu Vi, +${r.reward.thach} Linh Thạch`);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.16em] text-gold",
				children: "PvE"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Cửu Trùng Thiên Tháp"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-muted",
				children: [
					"Mười tầng, độ khó tăng dần. Sai một câu là rơi. Tầng 10 là Boss. Cao nhất: tầng ",
					best,
					"."
				]
			}),
			profile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-gold",
				children: [profile.realmName, " · Băng Tâm đang cộng giờ nếu trang bị."]
			}) : null,
			msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-primary",
				children: msg
			}),
			(!run || run.status !== "in_progress") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5",
				children: Array.from({ length: 10 }, (_, i) => i + 1).map((f) => {
					const locked = f > best + 1;
					const boss = f === 10;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: locked || busy,
						onClick: () => void enter(f),
						className: cn("jade-frame min-h-24 rounded-[20px] p-3 text-center disabled:opacity-40", boss && "ring-1 ring-gold/50"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-gold",
								children: boss ? "Boss" : `Tầng ${f}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-display text-2xl font-semibold",
								children: f
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-muted",
								children: locked ? "Khóa" : f <= 3 ? "Dễ" : f <= 6 ? "TB" : "Khó"
							})
						]
					}, f);
				})
			}),
			run?.status === "in_progress" && current && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "scripture-sheet mt-8 rounded-[24px] p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Tầng ",
							run.floor,
							" · Câu ",
							run.index + 1,
							"/",
							qs.length
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono tabular-nums",
							children: formatTime(left)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 font-display text-xl font-semibold",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MathText, { text: current.content })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 grid gap-2 sm:grid-cols-2",
						children: options.map((opt) => current.fadedOption === opt.key ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-h-14 rounded-[16px] border-2 border-dashed border-border/60 px-4 py-3 text-subtle line-through",
							children: [opt.key, ". Minh Nhãn"]
						}, opt.key) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: busy,
							onClick: () => void pick(opt.key),
							className: "min-h-14 rounded-[16px] border-2 border-border px-4 py-3 text-left hover:border-primary/40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-semibold",
									children: [opt.key, "."]
								}),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MathText, { text: opt.value })
							]
						}, opt.key))
					})
				]
			}),
			run && run.status !== "in_progress" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setRun(null),
					children: "Chọn tầng khác"
				}), run.status === "cleared" && run.floor < 10 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "gold",
					onClick: () => void enter(run.floor + 1),
					children: "Tầng tiếp"
				})]
			})
		]
	}) });
}
//#endregion
export { TowerPage as component };
