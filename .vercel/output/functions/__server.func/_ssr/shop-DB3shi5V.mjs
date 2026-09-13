import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { n as useCurrentUserState } from "./spirit-field-B_Qsd57d.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as cn } from "./utils-GQBtw7X5.mjs";
import { t as SpiritAvatar } from "./spirit-avatar-DZol_Yss.mjs";
import { t as AppShell } from "./app-shell-DOtshqRA.mjs";
import { t as Button } from "./button-mJbfH0JE.mjs";
import { t as RedirectToSignIn } from "./gates-CUxTjxua.mjs";
import { n as Label, t as Input } from "./label-CECcc6ab.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop-DB3shi5V.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var listShop = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("75c50305b8528c0ffd43de5f2e44e412a6e7eb66802ca70e90f8cedd5b84c13f"));
var buyFrame = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((frameId) => frameId).handler(createSsrRpc("71aa55eb20d4d3844cabd6580cdb7e4d128c0938469145ce33ca20a2685d7f52"));
var equipFrame = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((frameId) => frameId).handler(createSsrRpc("ee7108f30a35e51caff66054b3f909fc9d9746ac8075615a5020d669357fa78e"));
var setDaoTitle = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((title) => title).handler(createSsrRpc("d3c790c40d8a1a1097aa15494f3278b626797e08e0f8f7594dcc310222e3bb0a"));
var setDisplayName = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((name) => name).handler(createSsrRpc("6ae96566754cfe064298099ab02d6c81fe821631821d18d25147e079f6b9725b"));
function ShopPage() {
	const { user, isPending } = useCurrentUserState();
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [frames, setFrames] = (0, import_react.useState)([]);
	const [titleCost, setTitleCost] = (0, import_react.useState)(20);
	const [nameCost, setNameCost] = (0, import_react.useState)(28);
	const [title, setTitle] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const load = (0, import_react.useCallback)(() => {
		listShop().then((r) => {
			setProfile(r.profile);
			setFrames(r.frames);
			setTitleCost(r.titleCost);
			setNameCost(r.nameCost);
			setTitle(r.profile.daoTitle);
			setName(r.profile.displayName);
		}).catch(() => void 0);
	}, []);
	(0, import_react.useEffect)(() => {
		if (user) load();
	}, [user, load]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	async function run(fn) {
		setBusy(true);
		setError(null);
		try {
			await fn();
			load();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Không thực hiện được");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.16em] text-gold",
				children: "Chợ Linh Bảo"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Đổi Linh Thạch"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-muted",
				children: [
					"Khung đạo ảnh, đạo hiệu, đổi tên. Đang có",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono tabular-nums text-gold",
						children: profile?.linhThach ?? 0
					}),
					" Linh Thạch."
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-danger",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-8 font-display text-xl font-semibold",
				children: "Khung đạo ảnh"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-4 sm:grid-cols-2",
				children: frames.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "jade-frame rounded-[20px] p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpiritAvatar, {
								name: profile?.displayName ?? "Đạo hữu",
								frame: f.id
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-lg font-semibold",
								children: f.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-gold",
								children: f.han
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: f.blurb
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-sm tabular-nums text-gold",
								children: [f.cost, " LT"]
							}), f.equipped ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								disabled: busy,
								onClick: () => void run(() => equipFrame({ data: "" })),
								children: "Gỡ"
							}) : f.owned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								disabled: busy,
								onClick: () => void run(() => equipFrame({ data: f.id })),
								children: "Trang bị"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "gold",
								disabled: busy,
								onClick: () => void run(() => buyFrame({ data: f.id })),
								children: "Mua"
							})]
						})
					]
				}, f.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-6 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "jade-frame rounded-[20px] p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-semibold",
							children: "Đạo hiệu"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								"Tốn ",
								titleCost,
								" Linh Thạch mỗi lần đổi."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "title",
							className: "mt-4",
							children: "Đạo hiệu"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "title",
							value: title,
							onChange: (e) => setTitle(e.target.value),
							maxLength: 24
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4 w-full",
							disabled: busy,
							onClick: () => void run(() => setDaoTitle({ data: title })),
							children: "Khắc đạo hiệu"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "jade-frame rounded-[20px] p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-semibold",
							children: "Đổi tên"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								"Tốn ",
								nameCost,
								" Linh Thạch."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "dname",
							className: "mt-4",
							children: "Tên hiển thị"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "dname",
							value: name,
							onChange: (e) => setName(e.target.value),
							maxLength: 28
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4 w-full",
							variant: "outline",
							disabled: busy,
							onClick: () => void run(() => setDisplayName({ data: name })),
							children: "Đổi tên"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-8 text-xs text-subtle"),
				children: "Linh Thạch nhận từ Lôi Đài, Bí Cảnh và Thiên Tháp. Công Pháp mua ở hồ sơ tu luyện."
			})
		]
	}) });
}
//#endregion
export { ShopPage as component };
