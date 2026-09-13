import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Swords, c as Shuffle, n as Users } from "../_libs/lucide-react.mjs";
import { n as useCurrentUserState } from "./spirit-field-B_Qsd57d.mjs";
import { i as getMyCultivation } from "./cultivation-CRtzj3Cp.mjs";
import { t as AppShell } from "./app-shell-DOtshqRA.mjs";
import { t as Button } from "./button-mJbfH0JE.mjs";
import { t as RedirectToSignIn } from "./gates-CUxTjxua.mjs";
import { i as listExams, o as listQuestionTopics } from "./exams-Dp0ZgaXj.mjs";
import { a as joinPvpRoom, c as pollPvpQueue, i as joinPvpQueue, o as leavePvpQueue, t as createPvpRoom } from "./pvp-D3cH8s8S.mjs";
import { n as Label, t as Input } from "./label-CECcc6ab.mjs";
import { n as Skeleton, t as CultivationPanel } from "./skeleton-D6GjK_BZ.mjs";
import { t as MatchmakingSearch } from "./matchmaking-search-CtHtsi1g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pvp-BvnK9Sv9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PvpLobby() {
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const [cultivation, setCultivation] = (0, import_react.useState)(null);
	const [exams, setExams] = (0, import_react.useState)([]);
	const [topics, setTopics] = (0, import_react.useState)([]);
	const [examId, setExamId] = (0, import_react.useState)("pvp-blitz");
	const [shuffle, setShuffle] = (0, import_react.useState)(true);
	const [ranked, setRanked] = (0, import_react.useState)(true);
	const [topic, setTopic] = (0, import_react.useState)("");
	const [difficulty, setDifficulty] = (0, import_react.useState)("");
	const [questionCount, setQuestionCount] = (0, import_react.useState)(8);
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [code, setCode] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const name = user?.displayName ?? user?.primaryEmail ?? "Đạo hữu";
	(0, import_react.useEffect)(() => {
		if (!user) return;
		getMyCultivation({ data: { displayName: name } }).then(setCultivation).catch(() => setCultivation(null));
	}, [user, name]);
	(0, import_react.useEffect)(() => {
		listExams().then((list) => {
			setExams(list);
			const blitz = list.find((e) => e.id === "pvp-blitz");
			if (blitz) setExamId(blitz.id);
		}).catch(() => void 0);
		listQuestionTopics().then(setTopics).catch(() => setTopics([]));
	}, []);
	(0, import_react.useEffect)(() => {
		if (status !== "queuing") return;
		const t = window.setInterval(() => {
			pollPvpQueue().then((res) => {
				if (res.status === "matched" && res.match) navigate({
					to: "/pvp/$matchId",
					params: { matchId: res.match.id }
				});
			}).catch(() => void 0);
		}, 1200);
		return () => window.clearInterval(t);
	}, [status, navigate]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const spec = {
		examId,
		displayName: name,
		shuffle,
		topic,
		difficulty,
		questionCount,
		ranked
	};
	async function queue() {
		setError(null);
		setBusy(true);
		try {
			const res = await joinPvpQueue({ data: spec });
			if (res.status === "matched" && res.match) await navigate({
				to: "/pvp/$matchId",
				params: { matchId: res.match.id }
			});
			else setStatus("queuing");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Không vào hàng đợi được");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.16em] text-gold",
				children: "Lôi Đài Quyết Đấu"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "1 đối 1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted",
				children: "Ranked ghép Elo. Băng Tâm Quyết cộng thêm thời gian trận."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: cultivation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CultivationPanel, {
					profile: cultivation,
					compact: true
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 rounded-[20px]" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "jade-frame mt-6 rounded-[28px] p-6",
				children: [status === "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: ranked ? "gold" : "outline",
								className: "w-full",
								onClick: () => setRanked(true),
								children: "Ranked"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: !ranked ? "default" : "outline",
								className: "w-full",
								onClick: () => setRanked(false),
								children: "Giao hữu"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: shuffle ? "default" : "outline",
								className: "w-full",
								onClick: () => setShuffle(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-4" }), " Xào bài"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: !shuffle ? "default" : "outline",
								className: "w-full",
								onClick: () => setShuffle(false),
								children: "Đề cố định"
							})]
						}),
						shuffle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "topic",
							children: "Chủ đề"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							id: "topic",
							value: topic,
							onChange: (e) => setTopic(e.target.value),
							className: "flex h-11 w-full rounded-[12px] border border-border bg-bg-elevated px-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Tổng hợp"
							}), topics.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: t,
								children: t
							}, t))]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "diff",
								children: "Độ khó"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								id: "diff",
								value: difficulty,
								onChange: (e) => setDifficulty(e.target.value),
								className: "flex h-11 w-full rounded-[12px] border border-border bg-bg-elevated px-3 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Mọi mức"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "easy",
										children: "Dễ"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "medium",
										children: "Trung bình"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "hard",
										children: "Khó"
									})
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "n",
								children: "Số câu"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								id: "n",
								value: questionCount,
								onChange: (e) => setQuestionCount(Number(e.target.value)),
								className: "flex h-11 w-full rounded-[12px] border border-border bg-bg-elevated px-3 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: 6,
										children: "6"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: 8,
										children: "8"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: 10,
										children: "10"
									})
								]
							})] })]
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "exam",
							children: "Chọn đề"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							id: "exam",
							value: examId,
							onChange: (e) => setExamId(e.target.value),
							className: "flex h-11 w-full rounded-[12px] border border-border bg-bg-elevated px-3 text-sm",
							children: exams.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: e.id,
								children: e.title
							}, e.id))
						})] }),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-danger",
							children: error
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "w-full",
							size: "lg",
							onClick: () => void queue(),
							disabled: busy,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { className: "size-4" }), " Tìm đối thủ"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "w-full",
							size: "lg",
							variant: "outline",
							disabled: busy,
							onClick: async () => {
								setBusy(true);
								try {
									const match = await createPvpRoom({ data: spec });
									if (match) await navigate({
										to: "/pvp/$matchId",
										params: { matchId: match.id }
									});
								} catch (err) {
									setError(err instanceof Error ? err.message : "Không tạo phòng");
								} finally {
									setBusy(false);
								}
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }), " Tạo phòng (mã mời)"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: code,
								onChange: (e) => setCode(e.target.value.toUpperCase()),
								placeholder: "Mã phòng",
								className: "font-mono uppercase"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "paper",
								disabled: busy || !code,
								onClick: async () => {
									setBusy(true);
									try {
										const match = await joinPvpRoom({ data: {
											roomCode: code,
											displayName: name
										} });
										if (match) await navigate({
											to: "/pvp/$matchId",
											params: { matchId: match.id }
										});
									} catch (err) {
										setError(err instanceof Error ? err.message : "Không vào phòng");
									} finally {
										setBusy(false);
									}
								},
								children: "Vào"
							})]
						})
					]
				}), status === "queuing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchmakingSearch, {
					ranked,
					onCancel: () => {
						leavePvpQueue();
						setStatus("idle");
					}
				})]
			})
		]
	}) });
}
//#endregion
export { PvpLobby as component };
