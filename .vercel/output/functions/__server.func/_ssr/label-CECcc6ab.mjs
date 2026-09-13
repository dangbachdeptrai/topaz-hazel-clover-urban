import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-GQBtw7X5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/label-CECcc6ab.js
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("flex h-11 w-full rounded-[12px] border border-border bg-bg-elevated px-3 text-sm text-fg outline-none placeholder:text-subtle focus:border-primary", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("mb-1.5 block text-xs font-medium text-muted", className),
		...props
	});
}
//#endregion
export { Label as n, Input as t };
