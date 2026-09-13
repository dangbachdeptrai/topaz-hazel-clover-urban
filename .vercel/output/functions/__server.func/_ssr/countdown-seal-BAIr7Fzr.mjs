import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Swords } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/countdown-seal-BAIr7Fzr.js
var import_jsx_runtime = require_jsx_runtime();
function CountdownSeal({ seconds, foeName, title = "Lôi Đài" }) {
	const n = Math.max(0, seconds);
	const label = n <= 0 ? "Khai đấu" : String(n);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 grid place-items-center bg-bg/80 px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-[0.2em] text-gold",
					children: title
				}),
				foeName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: foeName
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "countdown-pop mt-6 font-display text-8xl font-semibold tabular-nums text-gold md:text-9xl",
					children: label
				}, label),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 flex items-center justify-center gap-2 text-sm text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, {
						className: "size-4 shrink-0 text-gold",
						"aria-hidden": true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Giữ Băng Tâm — trận bắt đầu sau nhịp đếm" })]
				})
			]
		})
	});
}
//#endregion
export { CountdownSeal as t };
