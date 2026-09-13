import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCurrentUserState } from "./spirit-field-B_Qsd57d.mjs";
import { t as AppShell } from "./app-shell-DOtshqRA.mjs";
import { t as Button } from "./button-mJbfH0JE.mjs";
import { t as RedirectToSignIn } from "./gates-CUxTjxua.mjs";
import { o as listGuilds, r as joinGuild, t as createGuild } from "./guilds-BDtBQKM9.mjs";
import { n as Label, t as Input } from "./label-CECcc6ab.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guilds-BeKOX7yC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GuildsPage() {
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const [mine, setMine] = (0, import_react.useState)(null);
	const [guilds, setGuilds] = (0, import_react.useState)([]);
	const [name, setName] = (0, import_react.useState)("");
	const [tag, setTag] = (0, import_react.useState)("");
	const [motto, setMotto] = (0, import_react.useState)("");
	const [code, setCode] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const load = (0, import_react.useCallback)(() => {
		listGuilds().then((r) => {
			setMine(r.mine);
			setGuilds(r.guilds);
		}).catch(() => void 0);
	}, []);
	(0, import_react.useEffect)(() => {
		if (user) load();
	}, [user, load]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.16em] text-gold",
				children: "Tông Môn"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Bang hội"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted",
				children: "Lập Tông, mời đạo hữu. Tông Môn Chiến tính tổng cống hiến từ Lôi Đài, Bí Cảnh và Thiên Tháp."
			}),
			mine?.guildId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/guilds/$guildId",
				params: { guildId: mine.guildId },
				className: "mt-4 inline-block text-sm text-primary hover:underline",
				children: [
					"Vào Tông [",
					mine.guildTag,
					"] ",
					mine.guildName
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "jade-frame rounded-[24px] p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-semibold",
							children: "Lập Tông"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								"Tốn ",
								24,
								" Linh Thạch."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "gname",
									children: "Tên"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "gname",
									value: name,
									onChange: (e) => setName(e.target.value),
									maxLength: 28
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "gtag",
									children: "Ký hiệu"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "gtag",
									value: tag,
									onChange: (e) => setTag(e.target.value.toUpperCase()),
									maxLength: 4,
									className: "font-mono uppercase",
									placeholder: "VD: LTC"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "gmotto",
									children: "Tông huấn"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "gmotto",
									value: motto,
									onChange: (e) => setMotto(e.target.value),
									maxLength: 80
								})] }),
								error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-danger",
									children: error
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "w-full",
									disabled: busy,
									onClick: async () => {
										setBusy(true);
										setError(null);
										try {
											const r = await createGuild({ data: {
												name,
												tag,
												motto
											} });
											await navigate({
												to: "/guilds/$guildId",
												params: { guildId: r.id }
											});
										} catch (err) {
											setError(err instanceof Error ? err.message : "Không lập được");
										} finally {
											setBusy(false);
										}
									},
									children: "Lập Tông Môn"
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "jade-frame rounded-[24px] p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-semibold",
							children: "Gia nhập"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Nhập mã mời của Tông chủ."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: code,
								onChange: (e) => setCode(e.target.value.toUpperCase()),
								placeholder: "Mã mời",
								className: "font-mono uppercase"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "gold",
								disabled: busy || !code,
								onClick: async () => {
									setBusy(true);
									setError(null);
									try {
										const r = await joinGuild({ data: { inviteCode: code } });
										await navigate({
											to: "/guilds/$guildId",
											params: { guildId: r.id }
										});
									} catch (err) {
										setError(err instanceof Error ? err.message : "Không vào được");
									} finally {
										setBusy(false);
									}
								},
								children: "Vào"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-6 text-xs text-muted",
							children: [
								"Đang có ",
								mine?.linhThach ?? 0,
								" Linh Thạch."
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-10 font-display text-xl font-semibold",
				children: "Bảng Tông Môn Chiến"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "jade-frame mt-3 divide-y divide-border rounded-[20px] p-0",
				children: [guilds.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-5 text-sm text-muted",
					children: "Chưa có Tông Môn nào."
				}), guilds.map((g, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/guilds/$guildId",
					params: { guildId: g.id },
					className: "flex items-center justify-between px-5 py-3 hover:bg-surface",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-medium",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mr-2 font-mono text-xs text-gold",
								children: i === 0 ? "元" : i === 1 ? "魁" : i === 2 ? "罡" : `${i + 1}`
							}),
							"[",
							g.tag,
							"] ",
							g.name
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							g.memberCount,
							" thành viên · Elo ",
							g.totalElo
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono tabular-nums text-primary",
						children: g.totalContribution
					})]
				}, g.id))]
			})
		]
	}) });
}
//#endregion
export { GuildsPage as component };
