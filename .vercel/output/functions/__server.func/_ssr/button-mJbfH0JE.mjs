import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-GQBtw7X5.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-mJbfH0JE.js
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("talisman inline-flex h-11 items-center justify-center gap-2 rounded-[12px] px-4 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50", {
	variants: {
		variant: {
			default: "border border-primary/30 bg-primary text-primary-fg hover:brightness-110",
			gold: "border border-gold/40 bg-gold text-primary-fg hover:brightness-110",
			outline: "border border-border bg-transparent text-fg hover:bg-surface",
			paper: "border border-border bg-bg-elevated text-fg hover:bg-surface",
			ghost: "text-muted hover:bg-surface hover:text-fg"
		},
		size: {
			default: "h-11 px-4",
			lg: "h-12 px-5 text-base",
			sm: "h-9 px-3 text-xs"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
export { Button as t };
