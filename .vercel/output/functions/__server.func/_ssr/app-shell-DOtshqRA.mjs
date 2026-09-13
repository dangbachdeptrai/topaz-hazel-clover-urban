import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as Moon, o as Sun } from "../_libs/lucide-react.mjs";
import { i as signOut } from "./client-B40BzJxt.mjs";
import { n as useCurrentUserState, t as SpiritField } from "./spirit-field-B_Qsd57d.mjs";
import { i as getMyCultivation } from "./cultivation-CRtzj3Cp.mjs";
import { t as cn } from "./utils-GQBtw7X5.mjs";
import { t as SpiritAvatar } from "./spirit-avatar-DZol_Yss.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-DOtshqRA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthSlot() {
	const { user, isPending } = useCurrentUserState();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const [cultivation, setCultivation] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!user) {
			setCultivation(null);
			return;
		}
		getMyCultivation({ data: { displayName: user.displayName ?? void 0 } }).then(setCultivation).catch(() => setCultivation(null));
	}, [user]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 w-24 animate-pulse rounded-[12px] bg-surface" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/login",
		className: "talisman inline-flex h-11 items-center rounded-[12px] border border-primary/30 bg-primary px-4 text-sm font-medium text-primary-fg",
		children: "Nhập môn"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/profile",
			className: "flex h-11 items-center gap-2 rounded-[12px] border border-border bg-bg-elevated px-2.5 pr-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpiritAvatar, {
				name: user.displayName ?? user.primaryEmail ?? "Đạo hữu",
				frame: cultivation?.equippedFrame,
				size: "sm"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "hidden min-w-0 sm:block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block max-w-28 truncate text-sm font-medium leading-tight",
					children: cultivation?.daoTitle || user.displayName || "Đạo hữu"
				}), cultivation ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "block text-[10px] tabular-nums text-gold",
					children: [
						cultivation.realmName,
						" · ",
						cultivation.elo,
						" Elo"
					]
				}) : null]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			disabled: signingOut,
			onClick: () => {
				setSigningOut(true);
				signOut("/").catch(() => setSigningOut(false));
			},
			className: "hidden h-11 rounded-[12px] px-3 text-sm text-muted hover:bg-surface sm:inline",
			children: signingOut ? "Đang xuất…" : "Xuất quan"
		})]
	});
}
function isDark() {
	try {
		return localStorage.getItem("ltc-theme") !== "light";
	} catch {
		return true;
	}
}
function ThemeToggle() {
	const [dark, setDark] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const d = isDark();
		setDark(d);
		document.documentElement.classList.toggle("dark", d);
	}, []);
	function toggle() {
		const next = !dark;
		setDark(next);
		document.documentElement.classList.toggle("dark", next);
		try {
			localStorage.setItem("ltc-theme", next ? "dark" : "light");
		} catch {}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: toggle,
		className: "grid size-11 place-items-center rounded-[12px] border border-border bg-bg-elevated text-gold",
		"aria-label": dark ? "Chuyển sang Bạch Ngọc Kinh" : "Chuyển sang Đêm Dạ Minh Châu",
		children: dark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4" })
	});
}
var NAV = [
	{
		to: "/exams",
		label: "Kho Đề"
	},
	{
		to: "/pvp",
		label: "Lôi Đài"
	},
	{
		to: "/survival",
		label: "Bí Cảnh"
	},
	{
		to: "/tower",
		label: "Thiên Tháp"
	},
	{
		to: "/guilds",
		label: "Tông Môn"
	},
	{
		to: "/shop",
		label: "Chợ"
	},
	{
		to: "/forge",
		label: "Luyện Đan"
	},
	{
		to: "/tutor",
		label: "Linh Sư"
	},
	{
		to: "/documents",
		label: "Tàng Thư"
	}
];
function AppShell({ children, bare = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpiritField, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "relative z-20 border-b border-border bg-bg/80 backdrop-blur-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-7xl items-center gap-3 px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-9 place-items-center rounded-[10px] border border-primary/30 bg-primary/15 font-display text-lg text-primary",
								children: "∑"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "leading-tight",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-display text-lg font-semibold",
									children: "Linh Toán Các"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden text-[10px] uppercase tracking-[0.16em] text-gold sm:block",
									children: "ToánMaster"
								})]
							})]
						}),
						!bare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "ml-4 hidden items-center gap-1 md:flex",
							children: NAV.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: n.to,
								className: "rounded-[10px] px-2.5 py-2 text-xs text-muted hover:bg-surface hover:text-fg lg:px-3 lg:text-sm",
								children: n.label
							}, n.to))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, {})]
						})
					]
				}), !bare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex gap-1 overflow-x-auto border-t border-border px-3 py-1 md:hidden",
					children: NAV.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: n.to,
						className: "shrink-0 rounded-[10px] px-3 py-2 text-xs text-muted",
						children: n.label
					}, n.to))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("relative z-10", bare && "min-h-[calc(100dvh-4rem)]"),
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: "dark",
				position: "top-center"
			})
		]
	});
}
//#endregion
export { AppShell as t };
