import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, b as useNavigate, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { o as Route$7 } from "./_ssr/router-DJhk53gV.mjs";
import { n as useCurrentUserState } from "./_ssr/spirit-field-B_Qsd57d.mjs";
import { t as SpiritAvatar } from "./_ssr/spirit-avatar-DZol_Yss.mjs";
import { t as AppShell } from "./_ssr/app-shell-DOtshqRA.mjs";
import { t as Button } from "./_ssr/button-mJbfH0JE.mjs";
import { t as RedirectToSignIn } from "./_ssr/gates-CUxTjxua.mjs";
import { a as leaveGuild, i as kickMember, n as getGuild } from "./_ssr/guilds-BDtBQKM9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_guildId-CLApI-SF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GuildDetailPage() {
	const { guildId } = Route$7.useParams();
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const [guild, setGuild] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(() => {
		getGuild({ data: guildId }).then(setGuild).catch(() => setGuild(null));
	}, [guildId]);
	(0, import_react.useEffect)(() => {
		if (user) load();
	}, [user, load]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (!guild) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-3xl px-4 py-16 text-center text-muted",
		children: "Đang mở sảnh Tông…"
	}) });
	const isLeader = guild.myRole === "leader";
	const isMember = Boolean(guild.myRole);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.16em] text-gold",
				children: "Tông Môn"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "font-display text-4xl font-semibold",
					children: [
						"[",
						guild.tag,
						"] ",
						guild.name
					]
				}), guild.motto ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted",
					children: guild.motto
				}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono tabular-nums text-primary",
						children: [guild.totalContribution, " cống hiến"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted",
						children: [
							guild.memberCount,
							" thành viên · Elo ",
							guild.totalElo
						]
					})]
				})]
			}),
			isMember ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "jade-frame mt-6 rounded-[20px] p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Mã mời"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-mono text-2xl tracking-[0.24em]",
					children: guild.inviteCode
				})]
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-danger",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-8 font-display text-xl font-semibold",
				children: "Thành viên"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "jade-frame mt-3 divide-y divide-border rounded-[20px] p-0",
				children: guild.members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpiritAvatar, {
							name: m.displayName,
							frame: m.equippedFrame,
							size: "sm"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate font-medium",
								children: [m.displayName, m.daoTitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 text-xs text-gold",
									children: m.daoTitle
								}) : null]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									m.role === "leader" ? "Tông chủ" : m.role === "elder" ? "Trưởng lão" : "Đệ tử",
									" ·",
									" ",
									m.realmHan,
									" ",
									m.realmName,
									" · Elo ",
									m.elo
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-sm tabular-nums text-primary",
							children: m.contribution
						}),
						isLeader && m.userId !== user?.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: async () => {
								setError(null);
								try {
									await kickMember({ data: { userId: m.userId } });
									load();
								} catch (err) {
									setError(err instanceof Error ? err.message : "Không trục xuất được");
								}
							},
							children: "Trục"
						}) : null
					]
				}, m.userId))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/guilds",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						children: "Bảng xếp hạng"
					})
				}), isMember ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: async () => {
						setError(null);
						try {
							await leaveGuild();
							await navigate({ to: "/guilds" });
						} catch (err) {
							setError(err instanceof Error ? err.message : "Không rời được");
						}
					},
					children: "Rời Tông"
				}) : null]
			})
		]
	}) });
}
//#endregion
export { GuildDetailPage as component };
