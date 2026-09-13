import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, b as useNavigate, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { c as Route$11 } from "./_ssr/router-DJhk53gV.mjs";
import { n as useCurrentUserState } from "./_ssr/spirit-field-B_Qsd57d.mjs";
import { t as AppShell } from "./_ssr/app-shell-DOtshqRA.mjs";
import { t as Button } from "./_ssr/button-mJbfH0JE.mjs";
import { t as RedirectToSignIn } from "./_ssr/gates-CUxTjxua.mjs";
import { n as extractExamFromDoc, r as getDoc } from "./_ssr/documents-ctf7KqZn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_docId-BAr-74bZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DocView() {
	const { docId } = Route$11.useParams();
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const [doc, setDoc] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getDoc({ data: docId }).then(setDoc);
	}, [docId]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const href = doc ? `data:${doc.mime};base64,${doc.dataB64}` : "";
	const canOcr = Boolean(doc?.mime.startsWith("image/"));
	async function ocr() {
		setBusy(true);
		setError(null);
		try {
			const r = await extractExamFromDoc({ data: docId });
			await navigate({
				to: "/exams/$examId",
				params: { examId: r.examId }
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Bóc tách lỗi");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/documents",
				className: "text-sm text-primary",
				children: "← Tàng Thư"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-3xl font-semibold",
				children: doc?.title ?? "…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Thiên Nhãn OCR bóc ảnh đề thành trắc nghiệm, lưu vào Kho Đề."
			}),
			doc?.mime.startsWith("image/") && href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: href,
				alt: "",
				className: "mt-6 max-h-[70vh] rounded-[16px] border border-border"
			}) : null,
			doc?.mime === "application/pdf" && href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
				title: doc.title,
				src: href,
				className: "mt-6 h-[70vh] w-full rounded-[16px] border border-border"
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-danger",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap gap-3",
				children: [doc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href,
					download: doc.title,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						children: "Tải xuống"
					})
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: !canOcr || busy,
					onClick: () => void ocr(),
					children: busy ? "Đang bóc tách…" : "Thiên Nhãn · Bóc đề"
				})]
			}),
			!canOcr && doc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted",
				children: "Chụp trang PDF thành JPG/PNG rồi cất lại để bóc tách."
			}) : null
		]
	}) });
}
//#endregion
export { DocView as component };
