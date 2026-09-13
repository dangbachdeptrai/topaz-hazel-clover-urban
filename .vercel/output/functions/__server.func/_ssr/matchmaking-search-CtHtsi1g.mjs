import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-mJbfH0JE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/matchmaking-search-CtHtsi1g.js
var import_jsx_runtime = require_jsx_runtime();
function MatchmakingSearch({ ranked, onCancel, title, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "py-10 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto grid size-24 place-items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "seek-ring absolute inset-0 rounded-full border border-gold/40" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "seek-ring absolute inset-2 rounded-full border border-primary/35 [animation-delay:400ms]" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 animate-spin text-gold" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 font-display text-2xl font-semibold",
				children: title ?? (ranked ? "Đang dò đối thủ cùng cảnh giới" : "Đang tìm đối thủ trên Lôi Đài")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: hint ?? (ranked ? "Ghép theo Elo. Nếu vắng người, cao thủ ảo sẽ vào sau vài giây." : "Nếu vắng người, cao thủ ảo sẽ vào sau khoảng 7 giây.")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				className: "mt-8",
				onClick: onCancel,
				children: "Hủy tìm trận"
			})
		]
	});
}
//#endregion
export { MatchmakingSearch as t };
