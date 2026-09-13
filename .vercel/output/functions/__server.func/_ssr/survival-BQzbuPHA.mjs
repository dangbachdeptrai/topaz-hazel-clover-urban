import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as Skull } from "../_libs/lucide-react.mjs";
import { n as useCurrentUserState } from "./spirit-field-B_Qsd57d.mjs";
import { i as getMyCultivation } from "./cultivation-CRtzj3Cp.mjs";
import { t as AppShell } from "./app-shell-DOtshqRA.mjs";
import { t as Button } from "./button-mJbfH0JE.mjs";
import { t as RedirectToSignIn } from "./gates-CUxTjxua.mjs";
import { a as pollBrQueue, i as leaveBrQueue, r as joinBrQueue } from "./survival-C5WLRIso.mjs";
import { n as Skeleton, t as CultivationPanel } from "./skeleton-D6GjK_BZ.mjs";
import { t as MatchmakingSearch } from "./matchmaking-search-CtHtsi1g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/survival-BQzbuPHA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SurvivalLobby() {
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const [cultivation, setCultivation] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const name = user?.displayName ?? user?.primaryEmail ?? "Đạo hữu";
	(0, import_react.useEffect)(() => {
		if (!user) return;
		getMyCultivation({ data: { displayName: name } }).then(setCultivation).catch(() => setCultivation(null));
	}, [user, name]);
	(0, import_react.useEffect)(() => {
		if (status !== "queuing") return;
		const t = window.setInterval(() => {
			pollBrQueue().then((res) => {
				if (res.status === "matched" && res.room) navigate({
					to: "/survival/$roomId",
					params: { roomId: res.room.id }
				});
			}).catch((err) => {
				setError(err instanceof Error ? err.message : "Ghép trận lỗi");
			});
		}, 1e3);
		return () => window.clearInterval(t);
	}, [status, navigate]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	async function queue() {
		setError(null);
		setBusy(true);
		try {
			const res = await joinBrQueue({ data: { displayName: name } });
			if (res.status === "matched" && res.room) await navigate({
				to: "/survival/$roomId",
				params: { roomId: res.room.id }
			});
			else setStatus("queuing");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Không vào Bí Cảnh được");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.16em] text-gold",
				children: "Bí Cảnh Sinh Tồn"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Battle Royale"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-muted",
				children: [8, " đạo hữu. Sai một câu là rơi. Người cuối cùng đứng vững nhận Linh Thạch."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: cultivation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CultivationPanel, {
					profile: cultivation,
					compact: true
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 rounded-[20px]" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "jade-frame mt-6 rounded-[28px] p-6",
				children: [status === "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "space-y-2 text-sm text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Mỗi vòng một câu · 18 giây." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Đáp án sai hoặc hết giờ = loại." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Hạng 1 nhận Tu Vi và Linh Thạch cao nhất." })
							]
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-danger",
							children: error
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "w-full",
							size: "lg",
							onClick: () => void queue(),
							disabled: busy,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skull, { className: "size-4" }), " Vào Bí Cảnh"]
						})
					]
				}), status === "queuing" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-danger",
					children: error
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchmakingSearch, {
					ranked: false,
					title: "Đang triệu tập đạo hữu vào Bí Cảnh",
					hint: "Đủ 8 người, hoặc sau vài giây sẽ hóa thân lấp chỗ.",
					onCancel: () => {
						leaveBrQueue();
						setStatus("idle");
					}
				})] })]
			})
		]
	}) });
}
//#endregion
export { SurvivalLobby as component };
