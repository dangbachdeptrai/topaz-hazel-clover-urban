import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as katex } from "../_libs/katex.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/math-text-BDGPAQJK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function renderChunk(text, display) {
	try {
		return katex.renderToString(text, {
			throwOnError: false,
			displayMode: display,
			output: "html"
		});
	} catch {
		return text;
	}
}
function MathText({ text }) {
	const html = (0, import_react.useMemo)(() => {
		const parts = [];
		const re = /\$\$([\s\S]+?)\$\$|\$([^$]+)\$/g;
		let last = 0;
		let m;
		while (m = re.exec(text)) {
			if (m.index > last) parts.push(escapeHtml(text.slice(last, m.index)));
			if (m[1] != null) parts.push(renderChunk(m[1], true));
			else if (m[2] != null) parts.push(renderChunk(m[2], false));
			last = m.index + m[0].length;
		}
		if (last < text.length) parts.push(escapeHtml(text.slice(last)));
		return parts.join("");
	}, [text]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { dangerouslySetInnerHTML: { __html: html } });
}
function escapeHtml(s) {
	return s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}
//#endregion
export { MathText as t };
