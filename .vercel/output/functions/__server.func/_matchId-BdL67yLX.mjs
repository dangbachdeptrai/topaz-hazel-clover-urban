import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { a as Swords, p as Clock } from "./_libs/lucide-react.mjs";
import { a as Route$5 } from "./_ssr/router-DJhk53gV.mjs";
import { n as useCurrentUserState, t as SpiritField } from "./_ssr/spirit-field-B_Qsd57d.mjs";
import { n as formatTime, t as cn } from "./_ssr/utils-GQBtw7X5.mjs";
import { t as Button } from "./_ssr/button-mJbfH0JE.mjs";
import { t as RedirectToSignIn } from "./_ssr/gates-CUxTjxua.mjs";
import { r as getQuestionsPublic } from "./_ssr/exams-Dp0ZgaXj.mjs";
import { t as MathText } from "./_ssr/math-text-BDGPAQJK.mjs";
import { l as submitPvpAnswer, n as finishPvp, r as getPvpMatch } from "./_ssr/pvp-D3cH8s8S.mjs";
import { t as CountdownSeal } from "./_ssr/countdown-seal-BAIr7Fzr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_matchId-BdL67yLX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PvpRoom() {
	const { matchId } = Route$5.useParams();
	const { user, isPending } = useCurrentUserState();
	const [match, setMatch] = (0, import_react.useState)(null);
	const [questions, setQuestions] = (0, import_react.useState)([]);
	const [index, setIndex] = (0, import_react.useState)(0);
	const [picked, setPicked] = (0, import_react.useState)({});
	const [left, setLeft] = (0, import_react.useState)(null);
	const [countdown, setCountdown] = (0, import_react.useState)(0);
	const [locking, setLocking] = (0, import_react.useState)(false);
	const refresh = (0, import_react.useCallback)(async () => {
		const m = await getPvpMatch({ data: matchId });
		setMatch(m);
		return m;
	}, [matchId]);
	(0, import_react.useEffect)(() => {
		refresh();
		const t = window.setInterval(() => void refresh(), 1500);
		return () => window.clearInterval(t);
	}, [refresh]);
	(0, import_react.useEffect)(() => {
		if (!match?.examId) return;
		getQuestionsPublic({ data: {
			examId: match.examId,
			applyPerks: true
		} }).then(setQuestions);
	}, [match?.examId]);
	(0, import_react.useEffect)(() => {
		if (!match || match.status !== "in_progress") {
			setCountdown(0);
			return;
		}
		const fetched = Date.now();
		const baseCount = match.countdownLeft ?? 0;
		const baseFight = match.fightLeft ?? match.durationSeconds;
		const tick = () => {
			const elapsed = (Date.now() - fetched) / 1e3;
			const c = Math.max(0, Math.ceil(baseCount - elapsed));
			setCountdown(c);
			setLeft(c > 0 ? match.durationSeconds : Math.max(0, Math.floor(baseFight - elapsed)));
		};
		tick();
		const t = window.setInterval(tick, 200);
		return () => window.clearInterval(t);
	}, [
		match?.id,
		match?.status,
		match?.countdownLeft,
		match?.fightLeft,
		match?.durationSeconds
	]);
	(0, import_react.useEffect)(() => {
		if (countdown > 0) return;
		if (left === 0 && match?.status === "in_progress") finishPvp({ data: matchId }).then(setMatch);
	}, [
		left,
		countdown,
		match?.status,
		matchId
	]);
	const meId = user?.id;
	const iAmP1 = match?.player1Id === meId;
	const myScore = iAmP1 ? match?.player1Score ?? 0 : match?.player2Score ?? 0;
	const oppScore = iAmP1 ? match?.player2Score ?? 0 : match?.player1Score ?? 0;
	const oppName = iAmP1 ? match?.player2Name ?? "Đang chờ…" : match?.player1Name ?? "Đối thủ";
	const myDone = iAmP1 ? match?.player1Done : match?.player2Done;
	const fighting = match?.status === "in_progress" && countdown <= 0;
	const current = questions[index];
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
	async function pick(answer) {
		if (!current || picked[current.id] || locking || !fighting) return;
		setLocking(true);
		setPicked((p) => ({
			...p,
			[current.id]: answer
		}));
		try {
			const m = await submitPvpAnswer({ data: {
				matchId,
				questionId: current.id,
				answer
			} });
			if (m) setMatch(m);
			if (index < questions.length - 1) setIndex((i) => i + 1);
		} finally {
			setLocking(false);
		}
	}
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (match?.status === "waiting") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative grid min-h-dvh place-items-center bg-bg px-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpiritField, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "jade-frame relative z-10 w-full max-w-md rounded-[28px] p-8 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { className: "mx-auto size-8 text-gold" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 font-display text-2xl font-semibold",
					children: "Chờ đối thủ"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 font-mono text-3xl font-semibold tracking-[0.3em]",
					children: match.roomCode
				})
			]
		})]
	});
	if (match?.status === "completed") {
		const win = match.winnerId == null ? "draw" : match.winnerId === meId ? "win" : "lose";
		const eloBefore = iAmP1 ? match.p1EloBefore : match.p2EloBefore;
		const eloAfter = iAmP1 ? match.p1EloAfter : match.p2EloAfter;
		const expGain = iAmP1 ? match.p1ExpGain : match.p2ExpGain;
		const eloDelta = eloBefore != null && eloAfter != null ? eloAfter - eloBefore : null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative grid min-h-dvh place-items-center bg-bg px-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpiritField, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "jade-frame relative z-10 w-full max-w-md rounded-[28px] p-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold uppercase tracking-[0.16em] text-gold",
						children: "Kết thúc"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-4xl font-semibold",
						children: win === "win" ? "Thắng" : win === "lose" ? "Thua" : "Hòa"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-[16px] bg-primary/10 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "Bạn"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-4xl font-semibold tabular-nums text-primary",
								children: myScore.toFixed(1)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-[16px] bg-danger/10 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: oppName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-4xl font-semibold tabular-nums text-danger",
								children: oppScore.toFixed(1)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-5 grid grid-cols-2 gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-[16px] bg-bg/70 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted",
								children: "Tu Vi"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "mt-1 font-mono tabular-nums text-primary",
								children: ["+", expGain]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-[16px] bg-bg/70 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted",
								children: "Elo"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "mt-1 font-mono tabular-nums",
								children: [eloAfter ?? "—", eloDelta != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: eloDelta >= 0 ? "text-primary" : "text-danger",
									children: [
										" ",
										"(",
										eloDelta >= 0 ? "+" : "",
										eloDelta,
										")"
									]
								}) : null]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/pvp",
						className: "mt-6 inline-block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Đấu tiếp" })
					})
				]
			})]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-dvh flex-col bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpiritField, {}),
			countdown > 0 && match?.status === "in_progress" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountdownSeal, {
				seconds: countdown,
				foeName: oppName
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "relative z-10 border-b border-border bg-bg-elevated",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-3xl items-center justify-between px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-medium",
								children: ["Bạn ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono tabular-nums text-primary",
									children: myScore.toFixed(1)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-subtle",
								children: "vs"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-medium",
								children: [
									oppName,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono tabular-nums text-danger",
										children: oppScore.toFixed(1)
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-1.5 font-mono text-sm tabular-nums",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4" }), countdown > 0 ? `+${countdown}` : left == null ? "--:--" : formatTime(left)]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col p-4",
				children: [current && fighting && !myDone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "scripture-sheet rounded-[24px] p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-subtle",
							children: [
								"Câu ",
								index + 1,
								"/",
								questions.length
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-xl font-semibold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MathText, { text: current.content })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5 grid gap-2 sm:grid-cols-2",
							children: options.map((opt) => current.fadedOption === opt.key ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-h-14 rounded-[16px] border-2 border-dashed border-border/60 px-4 py-3 text-subtle line-through",
								children: [opt.key, ". Minh Nhãn"]
							}, opt.key) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								disabled: locking || Boolean(picked[current.id]),
								onClick: () => void pick(opt.key),
								className: cn("min-h-14 rounded-[16px] border-2 px-4 py-3 text-left", picked[current.id] === opt.key ? "border-primary bg-primary/8" : "border-border hover:border-primary/40"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-semibold",
										children: [opt.key, "."]
									}),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MathText, { text: opt.value })
								]
							}, opt.key))
						}),
						index >= questions.length - 1 && picked[current.id] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-6 w-full",
							onClick: () => void finishPvp({ data: matchId }).then(setMatch),
							children: "Hoàn thành"
						})
					]
				}), myDone && match?.status === "in_progress" && countdown <= 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid flex-1 place-items-center text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl font-semibold",
						children: "Bạn đã xong"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Đang chờ đối thủ nộp bài…"
					})]
				})]
			})
		]
	});
}
//#endregion
export { PvpRoom as component };
