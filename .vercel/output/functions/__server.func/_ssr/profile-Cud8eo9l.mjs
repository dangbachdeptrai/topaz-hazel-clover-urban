import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { n as useCurrentUserState } from "./spirit-field-B_Qsd57d.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { c as realmMeets } from "./realms-D188oFq9.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { i as getMyCultivation, l as togglePerk, s as listMyPerks, u as unlockPerk } from "./cultivation-CRtzj3Cp.mjs";
import { t as cn } from "./utils-GQBtw7X5.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as AppShell } from "./app-shell-DOtshqRA.mjs";
import { t as Button } from "./button-mJbfH0JE.mjs";
import { t as RedirectToSignIn } from "./gates-CUxTjxua.mjs";
import { a as listMyAttempts } from "./exams-Dp0ZgaXj.mjs";
import { s as listMyPvp } from "./pvp-D3cH8s8S.mjs";
import { n as Skeleton, t as CultivationPanel } from "./skeleton-D6GjK_BZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-Cud8eo9l.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PerkGrid({ perks, profile, onChange }) {
	async function act(p) {
		try {
			if (!p.unlocked) {
				await unlockPerk({ data: p.id });
				toast.success(`Lĩnh ngộ ${p.name}`);
			} else await togglePerk({ data: p.id });
			onChange();
			listMyPerks();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Không xong");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-display text-xl font-semibold",
			children: "Công Pháp"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 text-sm text-muted",
			children: [
				"Trang bị tối đa ",
				2,
				" quyết. Băng Tâm được ban khi nhập môn."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid gap-3 sm:grid-cols-2",
			children: perks.map((p) => {
				const lockedRealm = !realmMeets(profile.realmId, p.minRealm);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: cn("jade-frame rounded-[20px] p-4", p.equipped && "ring-1 ring-gold/50"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-gold",
								children: p.han
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "font-display text-lg font-semibold",
								children: p.name
							})] }), p.equipped ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-gold/15 px-2 py-0.5 text-[10px] text-gold",
								children: "Đang trang bị"
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: p.blurb
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: p.equipped ? "outline" : p.unlocked ? "default" : "gold",
							className: "mt-3",
							disabled: lockedRealm && !p.unlocked,
							onClick: () => void act(p),
							children: lockedRealm && !p.unlocked ? "Cần cảnh giới cao hơn" : !p.unlocked ? `Lĩnh ngộ · ${p.cost} Linh Thạch` : p.equipped ? "Gỡ ra" : "Trang bị"
						})
					]
				}, p.id);
			})
		})
	] });
}
var getProfileStats = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("3344b44ec606eec5b9f687f6f4081eaa448fb76ec21e448fae5e8c87577c81cd"));
function ProfilePage() {
	const { user, isPending } = useCurrentUserState();
	const [cultivation, setCultivation] = (0, import_react.useState)(null);
	const [perks, setPerks] = (0, import_react.useState)([]);
	const [stats, setStats] = (0, import_react.useState)(null);
	const [attempts, setAttempts] = (0, import_react.useState)([]);
	const [pvp, setPvp] = (0, import_react.useState)([]);
	const load = (0, import_react.useCallback)(() => {
		if (!user) return;
		getMyCultivation({ data: { displayName: user.displayName ?? void 0 } }).then(setCultivation).catch(() => setCultivation(null));
		listMyPerks().then((r) => {
			setCultivation(r.profile);
			setPerks(r.perks);
		}).catch(() => void 0);
		getProfileStats().then(setStats).catch(() => setStats(null));
		listMyAttempts().then(setAttempts).catch(() => setAttempts([]));
		listMyPvp().then(setPvp).catch(() => setPvp([]));
	}, [user]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl px-4 py-8",
		children: [
			cultivation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CultivationPanel, { profile: cultivation }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 rounded-[28px]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: cultivation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PerkGrid, {
					perks,
					profile: cultivation,
					onChange: load
				}) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid grid-cols-2 gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Đề đã làm",
						v: stats?.examsTaken ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Điểm TB",
						v: (stats?.avgScore ?? 0).toFixed(2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Cao nhất",
						v: (stats?.bestScore ?? 0).toFixed(2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Lôi Đài W-L-D",
						v: `${stats?.pvpWins ?? 0}-${stats?.pvpLosses ?? 0}-${stats?.pvpDraws ?? 0}`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-10 font-display text-xl font-semibold",
				children: "Lịch sử thi"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "jade-frame mt-3 divide-y divide-border rounded-[20px] p-0",
				children: [attempts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-5 text-sm text-muted",
					children: "Chưa có bài nộp."
				}), attempts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/exams/$examId/result/$attemptId",
					params: {
						examId: a.examId,
						attemptId: a.id
					},
					className: "flex items-center justify-between px-5 py-3 hover:bg-surface",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: a.examTitle
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: a.examType
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono tabular-nums text-primary",
						children: (a.score ?? 0).toFixed(2)
					})]
				}, a.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-10 font-display text-xl font-semibold",
				children: "Trận Lôi Đài"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "jade-frame mt-3 divide-y divide-border rounded-[20px] p-0",
				children: [pvp.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-5 text-sm text-muted",
					children: "Chưa đấu trận nào."
				}), pvp.map((m) => {
					const mine = m.player1Id === user.id ? m.player1Score : m.player2Score;
					const opp = m.player1Id === user.id ? m.player2Name : m.player1Name;
					const result = m.winnerId == null ? "Hòa" : m.winnerId === user.id ? "Thắng" : "Thua";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between px-5 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium",
							children: ["vs ", opp]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [m.examTitle, m.mode === "ranked" ? " · Ranked" : ""]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm",
							children: [
								result,
								" · ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono tabular-nums",
									children: mine.toFixed(1)
								})
							]
						})]
					}, m.id);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-wrap gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/pvp",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "gold",
							children: "Vào Lôi Đài"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/survival",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Bí Cảnh" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/shop",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							children: "Chợ Linh Bảo"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/guilds",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							children: "Tông Môn"
						})
					})
				]
			})
		]
	}) });
}
function Stat({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "jade-frame rounded-[20px] p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-display text-2xl font-semibold tabular-nums",
			children: v
		})]
	});
}
//#endregion
export { ProfilePage as component };
