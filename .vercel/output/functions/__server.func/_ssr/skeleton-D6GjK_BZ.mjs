import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Swords, d as Flame, f as Coins, t as Zap } from "../_libs/lucide-react.mjs";
import { a as nextRealm, l as realmProgress } from "./realms-D188oFq9.mjs";
import { t as cn } from "./utils-GQBtw7X5.mjs";
import { t as SpiritAvatar } from "./spirit-avatar-DZol_Yss.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/skeleton-D6GjK_BZ.js
var import_jsx_runtime = require_jsx_runtime();
function RealmBadge({ realmId, realmName, realmHan, layer }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs", realmId === "kim_dan" || realmId === "nguyen_anh" ? "border-gold/40 text-gold" : "border-primary/40 text-primary"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-display text-sm",
				children: realmHan
			}),
			realmName,
			" · tầng ",
			layer
		]
	});
}
function Progress({ value, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("h-2 overflow-hidden rounded-full bg-surface", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full rounded-full bg-primary transition-[width] duration-300",
			style: { width: `${Math.max(0, Math.min(100, value))}%` }
		})
	});
}
function CultivationPanel({ profile, compact = false }) {
	const bar = realmProgress(profile.exp);
	const nxt = nextRealm(profile.exp);
	if (compact) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "jade-frame flex items-center gap-4 rounded-[20px] p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpiritAvatar, {
				name: profile.displayName,
				frame: profile.equippedFrame
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-display text-lg font-semibold",
						children: profile.displayName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RealmBadge, {
						realmId: profile.realmId,
						realmName: profile.realmName,
						realmHan: profile.realmHan,
						layer: profile.realmLayer
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
					value: bar.pct,
					className: "mt-3 h-1.5"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-x-4 gap-y-1 text-right text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: "Elo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-mono tabular-nums font-semibold",
						children: profile.elo
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: "Linh Thạch"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-mono tabular-nums text-gold",
						children: profile.linhThach
					})
				]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "jade-frame rounded-[28px] p-6 md:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.16em] text-gold",
				children: "Đạo Cơ"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpiritAvatar, {
						name: profile.displayName,
						frame: profile.equippedFrame,
						size: "lg"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl font-semibold",
							children: profile.displayName
						}),
						profile.daoTitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-gold",
							children: profile.daoTitle
						}) : null,
						profile.guildTag ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/guilds/$guildId",
							params: { guildId: profile.guildId ?? "" },
							className: "mt-1 inline-block text-xs text-primary hover:underline",
							children: [
								"[",
								profile.guildTag,
								"] ",
								profile.guildName
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/guilds",
							className: "mt-1 inline-block text-xs text-muted hover:text-fg",
							children: "Chưa vào Tông Môn"
						})
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RealmBadge, {
					realmId: profile.realmId,
					realmName: profile.realmName,
					realmHan: profile.realmHan,
					layer: profile.realmLayer
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: "Tu Vi"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono tabular-nums",
							children: [profile.exp, nxt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-subtle",
								children: [
									" ",
									"/ ",
									nxt.minExp,
									" · ",
									nxt.name
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-subtle",
								children: " · viên mãn"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
						value: bar.pct,
						className: "mt-2"
					}),
					nxt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted",
						children: [
							"Còn ",
							profile.expToNext,
							" tu vi nữa để ",
							nxt.name,
							"."
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4 text-gold" }),
						k: "Elo",
						v: profile.elo
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4 text-gold" }),
						k: "Linh Thạch",
						v: profile.linhThach
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { className: "size-4 text-primary" }),
						k: "Thắng",
						v: profile.pvpWins
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "size-4 text-danger" }),
						k: "Chuỗi",
						v: profile.winStreak
					})
				]
			})
		]
	});
}
function Stat({ icon, k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[16px] bg-bg/60 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex items-center gap-1.5 text-xs text-muted",
			children: [icon, k]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-display text-2xl font-semibold tabular-nums",
			children: v
		})]
	});
}
function Skeleton({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("animate-pulse rounded-[16px] bg-surface", className) });
}
//#endregion
export { Skeleton as n, CultivationPanel as t };
