import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Trash2 } from "../_libs/lucide-react.mjs";
import { n as useCurrentUserState } from "./spirit-field-B_Qsd57d.mjs";
import { t as AppShell } from "./app-shell-DOtshqRA.mjs";
import { t as Button } from "./button-mJbfH0JE.mjs";
import { t as RedirectToSignIn } from "./gates-CUxTjxua.mjs";
import { a as uploadDoc, i as listMyDocs, t as deleteDoc } from "./documents-ctf7KqZn.mjs";
import { n as Label, t as Input } from "./label-CECcc6ab.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/documents-6f12turz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DocsPage() {
	const { user, isPending } = useCurrentUserState();
	const [docs, setDocs] = (0, import_react.useState)([]);
	const [title, setTitle] = (0, import_react.useState)("");
	const [file, setFile] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	function reload() {
		listMyDocs().then(setDocs).catch(() => setDocs([]));
	}
	(0, import_react.useEffect)(() => {
		if (user) reload();
	}, [user]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	async function upload() {
		if (!file) return;
		setBusy(true);
		setError(null);
		try {
			const dataB64 = await fileToB64(file);
			await uploadDoc({ data: {
				title: title || file.name,
				mime: file.type || "application/octet-stream",
				dataB64
			} });
			setTitle("");
			setFile(null);
			reload();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Upload lỗi");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.16em] text-gold",
				children: "Không Gian Giới Chỉ"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Tàng Thư riêng"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted",
				children: "PDF, Word, ảnh đề — chỉ tài khoản này đọc được."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "jade-frame mt-6 space-y-3 rounded-[24px] p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "title",
						children: "Tên tài liệu"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "title",
						value: title,
						onChange: (e) => setTitle(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						accept: ".pdf,.doc,.docx,image/*",
						onChange: (e) => setFile(e.target.files?.[0] ?? null),
						className: "text-sm"
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !file || busy,
						onClick: () => void upload(),
						children: busy ? "Đang cất…" : "Cất vào thư"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 divide-y divide-border overflow-hidden rounded-[20px] border border-border",
				children: [docs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-5 text-sm text-muted",
					children: "Thư còn trống."
				}), docs.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 bg-bg-elevated px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/documents/$docId",
						params: { docId: d.id },
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-medium",
							children: d.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								d.mime,
								" · ",
								(d.sizeBytes / 1024).toFixed(0),
								" KB"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "grid size-10 place-items-center rounded-[10px] text-muted hover:bg-surface hover:text-danger",
						onClick: () => void deleteDoc({ data: d.id }).then(reload),
						"aria-label": "Xóa",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})]
				}, d.id))]
			})
		]
	}) });
}
function fileToB64(file) {
	return new Promise((resolve, reject) => {
		const r = new FileReader();
		r.onload = () => resolve(String(r.result));
		r.onerror = () => reject(/* @__PURE__ */ new Error("Không đọc được file"));
		r.readAsDataURL(file);
	});
}
//#endregion
export { DocsPage as component };
