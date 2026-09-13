import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as initials, t as cn } from "./utils-GQBtw7X5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/spirit-avatar-DZol_Yss.js
var import_jsx_runtime = require_jsx_runtime();
function SpiritAvatar({ name, frame, size = "md" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("spirit-avatar inline-grid place-items-center rounded-full border border-border bg-surface font-display font-semibold text-primary", size === "sm" && "size-8 text-xs", size === "md" && "size-11 text-sm", size === "lg" && "size-16 text-lg", frame && `frame-${frame}`),
		"aria-hidden": true,
		children: initials(name)
	});
}
//#endregion
export { SpiritAvatar as t };
