import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { p as Clock } from "./_libs/lucide-react.mjs";
import { i as Route$3 } from "./_ssr/router-DJhk53gV.mjs";
import { n as useCurrentUserState, t as SpiritField } from "./_ssr/spirit-field-B_Qsd57d.mjs";
import { t as cn } from "./_ssr/utils-GQBtw7X5.mjs";
import { t as SpiritAvatar } from "./_ssr/spirit-avatar-DZol_Yss.mjs";
import { t as Button } from "./_ssr/button-mJbfH0JE.mjs";
import { t as RedirectToSignIn } from "./_ssr/gates-CUxTjxua.mjs";
import { t as MathText } from "./_ssr/math-text-BDGPAQJK.mjs";
import { t as CountdownSeal } from "./_ssr/countdown-seal-BAIr7Fzr.mjs";
import { n as getBrRoom, o as submitBrAnswer, t as getBrQuestion } from "./_ssr/survival-C5WLRIso.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_roomId-41CH9qJL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SurvivalRoster({ players, meId }) {
	const alive = players.filter((p) => p.isAlive).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "jade-frame rounded-[20px] p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.16em] text-gold",
				children: "Còn lại"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-sm tabular-nums text-primary",
				children: [
					alive,
					"/",
					players.length
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 space-y-1.5",
			children: players.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: cn("flex items-center gap-2 rounded-[12px] px-2 py-1.5", p.isAlive ? "bg-bg/50" : "opacity-45", p.userId === meId && "ring-1 ring-primary/40"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpiritAvatar, {
						name: p.displayName,
						size: "sm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-sm",
							children: [p.displayName, p.isBot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-1 text-[10px] text-subtle",
								children: "hóa thân"
							}) : null]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-muted",
							children: p.isAlive ? p.hasAnswered ? "Đã khóa" : "Đang nghĩ" : p.placement ? `Hạng ${p.placement}` : "Đã rơi"
						})]
					}),
					p.isAlive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-primary" }) : null
				]
			}, p.userId))
		})]
	});
}
function SurvivalRoom() {
	const { roomId } = Route$3.useParams();
	const { user, isPending } = useCurrentUserState();
	const [room, setRoom] = (0, import_react.useState)(null);
	const [question, setQuestion] = (0, import_react.useState)(null);
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [countdown, setCountdown] = (0, import_react.useState)(0);
	const [roundLeft, setRoundLeft] = (0, import_react.useState)(0);
	const [locking, setLocking] = (0, import_react.useState)(false);
	const refresh = (0, import_react.useCallback)(async () => {
		const r = await getBrRoom({ data: roomId });
		setRoom(r);
		return r;
	}, [roomId]);
	(0, import_react.useEffect)(() => {
		refresh();
		const t = window.setInterval(() => void refresh(), 1100);
		return () => window.clearInterval(t);
	}, [refresh]);
	(0, import_react.useEffect)(() => {
		if (!room || room.status !== "playing") {
			setQuestion(null);
			return;
		}
		getBrQuestion({ data: roomId }).then((res) => {
			setQuestion(res.question);
			setPicked(null);
		}).catch(() => setQuestion(null));
	}, [
		roomId,
		room?.status,
		room?.roundIndex
	]);
	(0, import_react.useEffect)(() => {
		if (!room) return;
		const fetched = Date.now();
		const baseCount = room.countdownLeft ?? 0;
		const baseRound = room.roundLeft ?? 0;
		const tick = () => {
			const elapsed = (Date.now() - fetched) / 1e3;
			setCountdown(Math.max(0, Math.ceil(baseCount - elapsed)));
			setRoundLeft(Math.max(0, Math.floor(baseRound - elapsed)));
		};
		tick();
		const t = window.setInterval(tick, 200);
		return () => window.clearInterval(t);
	}, [
		room?.id,
		room?.status,
		room?.roundIndex,
		room?.countdownLeft,
		room?.roundLeft
	]);
	const options = (0, import_react.useMemo)(() => {
		if (!question) return [];
		return [
			{
				key: "A",
				value: question.optionA
			},
			{
				key: "B",
				value: question.optionB
			},
			{
				key: "C",
				value: question.optionC
			},
			{
				key: "D",
				value: question.optionD
			}
		];
	}, [question]);
	async function pick(answer) {
		if (!question || picked || locking || !room?.myAlive || room.status !== "playing") return;
		if (countdown > 0) return;
		setLocking(true);
		setPicked(answer);
		try {
			const r = await submitBrAnswer({ data: {
				roomId,
				answer
			} });
			setRoom(r);
		} catch {
			setPicked(null);
		} finally {
			setLocking(false);
		}
	}
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (room?.status === "completed") {
		const place = room.myPlacement;
		const title = place === 1 ? "Độc tôn Bí Cảnh" : place ? `Hạng ${place}` : "Kết thúc";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative grid min-h-dvh place-items-center bg-bg px-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpiritField, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "jade-frame relative z-10 w-full max-w-md rounded-[28px] p-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold uppercase tracking-[0.16em] text-gold",
						children: "Bí Cảnh"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-4xl font-semibold",
						children: title
					}),
					room.winnerName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: ["Người sống sót · ", room.winnerName]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-6 grid grid-cols-2 gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-[16px] bg-bg/70 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted",
								children: "Tu Vi"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "mt-1 font-mono tabular-nums text-primary",
								children: ["+", room.myExpGain]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-[16px] bg-bg/70 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted",
								children: "Linh Thạch"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "mt-1 font-mono tabular-nums text-gold",
								children: ["+", room.myThachGain]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-5 space-y-1 text-left text-sm",
						children: room.players.slice().sort((a, b) => (a.placement ?? 99) - (b.placement ?? 99)).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between rounded-[12px] bg-bg/40 px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn(p.userId === user?.id && "text-primary"),
								children: [
									p.placement ?? "—",
									". ",
									p.displayName
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-xs tabular-nums text-muted",
								children: [p.correctCount, " đúng"]
							})]
						}, p.userId))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/survival",
						className: "mt-6 inline-block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Vào Bí Cảnh khác" })
					})
				]
			})]
		});
	}
	const fighting = room?.status === "playing" && countdown <= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-dvh flex-col bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpiritField, {}),
			countdown > 0 && room?.status === "countdown" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountdownSeal, {
				seconds: countdown,
				title: "Bí Cảnh",
				foeName: `${room.players.length} đạo hữu`
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "relative z-10 border-b border-border bg-bg-elevated",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-5xl items-center justify-between px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [
							"Vòng ",
							(room?.roundIndex ?? 0) + 1,
							"/",
							room?.totalRounds ?? 8,
							!room?.myAlive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-danger",
								children: "Đã rơi"
							}) : null
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/survival",
							className: "text-xs text-muted hover:text-fg",
							children: "Rời"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "inline-flex items-center gap-1.5 font-mono text-sm tabular-nums",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4" }), countdown > 0 ? `+${countdown}` : `${roundLeft}s`]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mx-auto grid w-full max-w-5xl flex-1 gap-4 p-4 lg:grid-cols-[1fr_260px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: question && fighting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "scripture-sheet rounded-[24px] p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-subtle",
							children: [
								"Câu ",
								question.orderIndex,
								" · ",
								question.topic
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-xl font-semibold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MathText, { text: question.content })
						}),
						!room?.myAlive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-danger",
							children: "Đạo hữu đã rơi — đang quan chiến. Các hóa thân sẽ kết thúc vòng."
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5 grid gap-2 sm:grid-cols-2",
							children: options.map((o) => {
								const faded = question.fadedOption === o.key;
								const selected = picked === o.key || room?.myAnswered && picked === o.key;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: !room?.myAlive || Boolean(picked) || Boolean(room?.myAnswered) || faded || locking,
									onClick: () => void pick(o.key),
									className: cn("rounded-[16px] border border-border bg-bg/60 px-4 py-3 text-left text-sm transition", selected && "border-primary bg-primary/10", faded && "opacity-30"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mr-2 font-mono text-gold",
										children: [o.key, "."]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MathText, { text: o.value })]
								}, o.key);
							})
						}),
						room?.myAnswered || picked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-primary",
							children: "Đã khóa đáp án. Chờ hết giờ vòng."
						}) : null
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "jade-frame rounded-[24px] p-8 text-center text-muted",
					children: room?.status === "countdown" ? "Niêm phong khai trận…" : "Đang chuẩn bị vòng kế."
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SurvivalRoster, {
					players: room?.players ?? [],
					meId: user?.id
				})]
			})
		]
	});
}
//#endregion
export { SurvivalRoom as component };
