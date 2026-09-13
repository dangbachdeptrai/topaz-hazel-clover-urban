import { r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-DvBmSZow.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { o as realmFromExp } from "./realms-D188oFq9.mjs";
import { n as ensureProfile } from "./cultivation-CRtzj3Cp.mjs";
import { i as roomCode } from "./utils-GQBtw7X5.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guilds-DsgKlmbo.js
function asFrame(id) {
	if (id === "jade" || id === "gold" || id === "void" || id === "crimson") return id;
	return null;
}
function asRole(role) {
	if (role === "leader" || role === "elder") return role;
	return "member";
}
function mapSummary(r) {
	return {
		id: r.id,
		name: r.name,
		tag: r.tag,
		motto: r.motto,
		inviteCode: r.invite_code,
		leaderId: r.leader_id,
		memberCount: Number(r.member_count),
		totalElo: Number(r.total_elo ?? 0),
		totalContribution: Number(r.total_contribution ?? 0)
	};
}
var GUILD_SELECT = `
  select g.id, g.name, g.tag, g.motto, g.invite_code, g.leader_id,
         count(m.user_id)::int as member_count,
         coalesce(sum(p.elo), 0) as total_elo,
         coalesce(sum(m.contribution), 0) as total_contribution
  from guilds g
  left join guild_members m on m.guild_id = g.id
  left join profiles p on p.user_id = m.user_id
`;
async function loadGuild(sql, guildId) {
	return (await sql.query(`${GUILD_SELECT} where g.id = $1 group by g.id, g.name, g.tag, g.motto, g.invite_code, g.leader_id`, [guildId]))[0] ?? null;
}
async function loadMembers(sql, guildId) {
	return (await sql.query(`select m.user_id, coalesce(p.display_name, 'Đạo hữu') as display_name, coalesce(p.dao_title,'') as dao_title,
            m.role, m.contribution, coalesce(p.exp,0) as exp, coalesce(p.elo,1000) as elo,
            p.equipped_frame
     from guild_members m
     left join profiles p on p.user_id = m.user_id
     where m.guild_id = $1
     order by case m.role when 'leader' then 0 when 'elder' then 1 else 2 end, m.contribution desc`, [guildId])).map((r) => {
		const realm = realmFromExp(Number(r.exp));
		return {
			userId: r.user_id,
			displayName: r.display_name,
			daoTitle: r.dao_title,
			role: asRole(r.role),
			contribution: Number(r.contribution),
			realmName: realm.name,
			realmHan: realm.nameHan,
			realmId: realm.id,
			elo: Number(r.elo),
			equippedFrame: asFrame(r.equipped_frame)
		};
	});
}
function normalizeTag(raw) {
	const tag = raw.replace(/[^A-Za-z0-9À-ỹ]/g, "").toUpperCase().slice(0, 4);
	return tag.length >= 2 ? tag : "";
}
var listGuilds_createServerFn_handler = createServerRpc({
	id: "cc4c9cbe00913cf88bdb85851de44327e467ad3429270b8cb5c8282d82e579c6",
	name: "listGuilds",
	filename: "src/lib/server/guilds.ts"
}, (opts) => listGuilds.__executeServer(opts));
var listGuilds = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listGuilds_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	return {
		mine: await ensureProfile(sql, context.userId),
		guilds: (await sql.query(`${GUILD_SELECT} group by g.id, g.name, g.tag, g.motto, g.invite_code, g.leader_id
       order by total_contribution desc, total_elo desc limit 40`)).map(mapSummary)
	};
});
var getGuild_createServerFn_handler = createServerRpc({
	id: "fd2b438b0fc464670252d22e647ba53ddb84e746c946bf5f9018495839ac399c",
	name: "getGuild",
	filename: "src/lib/server/guilds.ts"
}, (opts) => getGuild.__executeServer(opts));
var getGuild = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((guildId) => guildId).handler(getGuild_createServerFn_handler, async ({ context, data: guildId }) => {
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const row = await loadGuild(sql, guildId);
	if (!row) throw new Error("Không tìm thấy Tông Môn");
	const members = await loadMembers(sql, guildId);
	const mine = members.find((m) => m.userId === context.userId);
	return {
		...mapSummary(row),
		members,
		myRole: mine?.role ?? null
	};
});
var createGuild_createServerFn_handler = createServerRpc({
	id: "181c930b5959227d185b4c3f8c62cb3869f44260e6d1601b0f83bfdd3ae37c09",
	name: "createGuild",
	filename: "src/lib/server/guilds.ts"
}, (opts) => createGuild.__executeServer(opts));
var createGuild = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createGuild_createServerFn_handler, async ({ context, data }) => {
	const name = data.name.trim().slice(0, 28);
	const tag = normalizeTag(data.tag);
	const motto = (data.motto ?? "").trim().slice(0, 80);
	if (name.length < 2) throw new Error("Tên Tông Môn tối thiểu 2 ký tự");
	if (!tag) throw new Error("Ký hiệu 2–4 chữ");
	const sql = await getSql();
	const me = await ensureProfile(sql, context.userId);
	if (me.guildId) throw new Error("Đã thuộc một Tông Môn");
	if (me.linhThach < 24) throw new Error("Không đủ Linh Thạch để lập Tông");
	if ((await sql.query(`select id from guilds where tag = $1`, [tag]))[0]) throw new Error("Ký hiệu đã có Tông dùng");
	const id = crypto.randomUUID();
	const code = roomCode();
	await sql.query(`update profiles set linh_thach = linh_thach - $2, updated_at = now() where user_id = $1 and linh_thach >= $2`, [context.userId, 24]);
	await sql.query(`insert into linh_thach_ledger (id, user_id, delta, reason) values ($1,$2,$3,'guild:create')`, [
		crypto.randomUUID(),
		context.userId,
		-24
	]);
	await sql.query(`insert into guilds (id, name, tag, motto, invite_code, leader_id) values ($1,$2,$3,$4,$5,$6)`, [
		id,
		name,
		tag,
		motto,
		code,
		context.userId
	]);
	await sql.query(`insert into guild_members (guild_id, user_id, role, contribution) values ($1,$2,'leader',0)`, [id, context.userId]);
	await sql.query(`update profiles set guild_id = $2, updated_at = now() where user_id = $1`, [context.userId, id]);
	return { id };
});
var joinGuild_createServerFn_handler = createServerRpc({
	id: "d3d21f33596c1b4044b6bce71598921ef0aa318e75183569a22799f2d5e12c00",
	name: "joinGuild",
	filename: "src/lib/server/guilds.ts"
}, (opts) => joinGuild.__executeServer(opts));
var joinGuild = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(joinGuild_createServerFn_handler, async ({ context, data }) => {
	const code = data.inviteCode.trim().toUpperCase();
	const sql = await getSql();
	if ((await ensureProfile(sql, context.userId)).guildId) throw new Error("Đã thuộc một Tông Môn");
	const g = await sql.query(`select id from guilds where invite_code = $1`, [code]);
	if (!g[0]) throw new Error("Mã mời không đúng");
	const n = await sql.query(`select count(*)::int as c from guild_members where guild_id = $1`, [g[0].id]);
	if (Number(n[0]?.c) >= 20) throw new Error("Tông Môn đã đủ người");
	await sql.query(`insert into guild_members (guild_id, user_id, role) values ($1,$2,'member')`, [g[0].id, context.userId]);
	await sql.query(`update profiles set guild_id = $2, updated_at = now() where user_id = $1`, [context.userId, g[0].id]);
	return { id: g[0].id };
});
var leaveGuild_createServerFn_handler = createServerRpc({
	id: "cd1b66a8760fb3681d1c5675f9aabe3f531f943ec5dd9ca33716185748f0962d",
	name: "leaveGuild",
	filename: "src/lib/server/guilds.ts"
}, (opts) => leaveGuild.__executeServer(opts));
var leaveGuild = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(leaveGuild_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const me = await ensureProfile(sql, context.userId);
	if (!me.guildId) throw new Error("Chưa vào Tông Môn");
	if ((await sql.query(`select leader_id from guilds where id = $1`, [me.guildId]))[0]?.leader_id === context.userId) {
		const others = await sql.query(`select count(*)::int as c from guild_members where guild_id = $1 and user_id <> $2`, [me.guildId, context.userId]);
		if (Number(others[0]?.c) > 0) throw new Error("Tông chủ phải nhường vị trước khi rời");
		await sql.query(`delete from guilds where id = $1`, [me.guildId]);
	} else await sql.query(`delete from guild_members where guild_id = $1 and user_id = $2`, [me.guildId, context.userId]);
	await sql.query(`update profiles set guild_id = null, updated_at = now() where user_id = $1`, [context.userId]);
	return { ok: true };
});
var kickMember_createServerFn_handler = createServerRpc({
	id: "bc7640cad3429852662e5211d77df18827f64b831469fc71276938e17ed80eff",
	name: "kickMember",
	filename: "src/lib/server/guilds.ts"
}, (opts) => kickMember.__executeServer(opts));
var kickMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(kickMember_createServerFn_handler, async ({ context, data }) => {
	if (data.userId === context.userId) throw new Error("Không tự trục xuất mình");
	const sql = await getSql();
	const me = await ensureProfile(sql, context.userId);
	if (!me.guildId) throw new Error("Chưa vào Tông Môn");
	if ((await sql.query(`select role from guild_members where guild_id = $1 and user_id = $2`, [me.guildId, context.userId]))[0]?.role !== "leader") throw new Error("Chỉ Tông chủ được trục xuất");
	await sql.query(`delete from guild_members where guild_id = $1 and user_id = $2`, [me.guildId, data.userId]);
	await sql.query(`update profiles set guild_id = null, updated_at = now() where user_id = $1`, [data.userId]);
	return { ok: true };
});
//#endregion
export { createGuild_createServerFn_handler, getGuild_createServerFn_handler, joinGuild_createServerFn_handler, kickMember_createServerFn_handler, leaveGuild_createServerFn_handler, listGuilds_createServerFn_handler };
