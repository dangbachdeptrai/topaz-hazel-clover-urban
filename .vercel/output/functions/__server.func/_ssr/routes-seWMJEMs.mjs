import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as AppShell } from "./app-shell-DOtshqRA.mjs";
import { t as Button } from "./button-mJbfH0JE.mjs";
import { t as MathText } from "./math-text-BDGPAQJK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-seWMJEMs.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-10 md:py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "enter-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold",
				children: "VACT · THPTQG · TSA · LÔI ĐÀI"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "enter-2 mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.15] md:text-6xl",
				children: [
					"Tu luyện toán đạo",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
					"trong Linh Toán Các."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "enter-3 mt-4 max-w-xl text-muted",
				children: "Kho đề như trận pháp, Lôi Đài 1v1, Bí Cảnh sinh tồn, Cửu Trùng Thiên Tháp, Tông Môn chiến, Luyện Đan Lô và Thiên Nhãn OCR bóc đề từ ảnh."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "enter-4 mt-8 flex flex-wrap gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/exams",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							children: "Vào Kho Đề"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/pvp",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							variant: "gold",
							children: "Lôi Đài Quyết Đấu"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/survival",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							variant: "outline",
							children: "Bí Cảnh"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-12 grid gap-4 md:grid-cols-3",
				children: [
					["100+", "câu trong kho"],
					["Xào bài", "mỗi trận mới"],
					["8 người", "Bí Cảnh"]
				].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "jade-frame rounded-[20px] p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl font-semibold text-primary",
						children: k
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: v
					})]
				}, k))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-12 grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "scripture-sheet rounded-[24px] p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase tracking-[0.16em] text-gold",
							children: "Chính thức"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-2xl font-semibold",
							children: "Trận pháp · minh họa"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: "Thời gian: 25 phút"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "mt-4 space-y-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								"Câu 1. Cho ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MathText, { text: "$f(x)=x^3-3x^2+2$" }),
								". Đạo hàm bằng"
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "text-muted",
								children: "A. 3x² − 6x · B. 3x² − 3x · C. x² − 6x · D. 3x² − 6"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/exams",
							className: "mt-6 inline-block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Vào ngay" })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							title: "Lôi Đài",
							body: "Xào bài ngẫu nhiên, ranked theo Elo, 5 giây khai đấu.",
							to: "/pvp"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							title: "Bí Cảnh Sinh Tồn",
							body: "8 đạo hữu. Sai một câu là rơi. Người cuối thắng.",
							to: "/survival"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							title: "Tông Môn & Chợ",
							body: "Lập bang, cống hiến, đổi khung đạo ảnh bằng Linh Thạch.",
							to: "/guilds"
						})
					]
				})]
			})
		]
	}) });
}
function Card({ title, body, to }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: "jade-frame block rounded-[20px] p-5 hover:border-primary/50",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-display text-xl font-semibold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: body
		})]
	});
}
//#endregion
export { Home as component };
