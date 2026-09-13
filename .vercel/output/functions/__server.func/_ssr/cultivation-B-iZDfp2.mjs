import { r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-DvBmSZow.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { c as realmMeets, n as expToNext, o as realmFromExp, s as realmLayer, t as PERK_DEFS } from "./realms-D188oFq9.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cultivation-B-iZDfp2.js
function asFrame(id) {
	if (id === "jade" || id === "gold" || id === "void" || id === "crimson") return id;
	return null;
}
function mapProfile(r) {
	const realm = realmFromExp(Number(r.exp));
	return {
		userId: r.user_id,
		displayName: r.display_name,
		daoTitle: r.dao_title,
		realmId: realm.id,
		realmName: realm.name,
		realmHan: realm.nameHan,
		realmLayer: realmLayer(Number(r.exp)),
		exp: Number(r.exp),
		expToNext: expToNext(Number(r.exp)),
		elo: Number(r.elo),
		linhThach: Number(r.linh_thach),
		pvpWins: Number(r.pvp_wins),
		pvpLosses: Number(r.pvp_losses),
		pvpDraws: Number(r.pvp_draws),
		winStreak: Number(r.win_streak),
		bestStreak: Number(r.best_streak),
		towerBestFloor: Number(r.tower_best_floor),
		guildId: r.guild_id,
		guildName: r.guild_name,
		guildTag: r.guild_tag,
		equippedFrame: asFrame(r.equipped_frame),
		brWins: Number(r.br_wins ?? 0),
		brBestPlace: r.br_best_place == null ? null : Number(r.br_best_place)
	};
}
var PROFILE_SELECT = `select p.user_id, p.display_name, p.dao_title, p.realm_id, p.realm_layer, p.exp, p.elo, p.linh_thach,
            p.pvp_wins, p.pvp_losses, p.pvp_draws, p.win_streak, p.best_streak, p.tower_best_floor,
            p.guild_id, g.name as guild_name, g.tag as guild_tag, p.equipped_frame,
            coalesce(p.br_wins, 0) as br_wins, p.br_best_place
     from profiles p
     left join guilds g on g.id = p.guild_id
     where p.user_id = $1`;
async function authName(sql, userId) {
	return (await sql.query(`select name from "user" where id = $1`, [userId]))[0]?.name?.trim() || "Đạo hữu";
}
async function ensureProfile(sql, userId, displayName) {
	const name = (displayName?.trim() || await authName(sql, userId)).slice(0, 40);
	await sql.query(`insert into profiles (user_id, display_name, realm_id, realm_layer, exp, elo, linh_thach)
     values ($1, $2, 'luyen_khi', 1, 0, 1000, 48)
     on conflict (user_id) do update set
       display_name = case
         when excluded.display_name <> '' and excluded.display_name <> 'Đạo hữu'
         then excluded.display_name else profiles.display_name end,
       updated_at = now()`, [userId, name]);
	await sql.query(`insert into user_perks (user_id, perk_id, equipped)
     values ($1, 'bang_tam', true)
     on conflict (user_id, perk_id) do nothing`, [userId]);
	const row = (await sql.query(PROFILE_SELECT, [userId]))[0];
	if (!row) throw new Error("Không mở được Đạo Cơ");
	const realm = realmFromExp(Number(row.exp));
	const layer = realmLayer(Number(row.exp));
	if (row.realm_id !== realm.id || Number(row.realm_layer) !== layer) {
		await sql.query(`update profiles set realm_id = $2, realm_layer = $3, updated_at = now() where user_id = $1`, [
			userId,
			realm.id,
			layer
		]);
		row.realm_id = realm.id;
		row.realm_layer = layer;
	}
	return mapProfile(row);
}
var getMyCultivation_createServerFn_handler = createServerRpc({
	id: "7beff2008f37cb365fae42582fd1f58dd6da5a11b93e512cf39ab5acc1c27546",
	name: "getMyCultivation",
	filename: "src/lib/server/cultivation.ts"
}, (opts) => getMyCultivation.__executeServer(opts));
var getMyCultivation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input ?? {}).handler(getMyCultivation_createServerFn_handler, async ({ context, data }) => {
	return ensureProfile(await getSql(), context.userId, data.displayName);
});
var listMyPerks_createServerFn_handler = createServerRpc({
	id: "e2af598016810bf3ee6a422b40d7edeca236e943319b4dfd13ea5eb4500b0b1f",
	name: "listMyPerks",
	filename: "src/lib/server/cultivation.ts"
}, (opts) => listMyPerks.__executeServer(opts));
var listMyPerks = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listMyPerks_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const me = await ensureProfile(sql, context.userId);
	const owned = await sql.query(`select perk_id, equipped from user_perks where user_id = $1`, [context.userId]);
	const map = new Map(owned.map((r) => [r.perk_id, r]));
	return {
		profile: me,
		perks: PERK_DEFS.map((d) => {
			const row = map.get(d.id);
			return {
				...d,
				unlocked: Boolean(row) || d.cost === 0,
				equipped: Boolean(row?.equipped)
			};
		})
	};
});
var unlockPerk_createServerFn_handler = createServerRpc({
	id: "06f14c45b8cbc2191589453f75fd97e53c430d07d86521869d8dbb4429f2d080",
	name: "unlockPerk",
	filename: "src/lib/server/cultivation.ts"
}, (opts) => unlockPerk.__executeServer(opts));
var unlockPerk = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((perkId) => perkId).handler(unlockPerk_createServerFn_handler, async ({ context, data: perkId }) => {
	const def = PERK_DEFS.find((p) => p.id === perkId);
	if (!def) throw new Error("Không có công pháp này");
	const sql = await getSql();
	const me = await ensureProfile(sql, context.userId);
	if (!realmMeets(me.realmId, def.minRealm)) throw new Error("Cảnh giới chưa đủ để lĩnh ngộ");
	if ((await sql.query(`select perk_id from user_perks where user_id = $1 and perk_id = $2`, [context.userId, perkId]))[0]) return { ok: true };
	if (me.linhThach < def.cost) throw new Error("Không đủ Linh Thạch");
	await sql.query(`update profiles set linh_thach = linh_thach - $2, updated_at = now() where user_id = $1`, [context.userId, def.cost]);
	await sql.query(`insert into user_perks (user_id, perk_id, equipped) values ($1,$2,false)`, [context.userId, perkId]);
	await sql.query(`insert into linh_thach_ledger (id, user_id, delta, reason) values ($1,$2,$3,$4)`, [
		crypto.randomUUID(),
		context.userId,
		-def.cost,
		`unlock:${perkId}`
	]);
	return { ok: true };
});
var togglePerk_createServerFn_handler = createServerRpc({
	id: "bea1b8b0e2574a7766f1010038f54da8786503c63cc0d0be8fd6857f8719f598",
	name: "togglePerk",
	filename: "src/lib/server/cultivation.ts"
}, (opts) => togglePerk.__executeServer(opts));
var togglePerk = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((perkId) => perkId).handler(togglePerk_createServerFn_handler, async ({ context, data: perkId }) => {
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const row = await sql.query(`select equipped from user_perks where user_id = $1 and perk_id = $2`, [context.userId, perkId]);
	if (!row[0]) throw new Error("Chưa lĩnh ngộ công pháp này");
	if (row[0].equipped) {
		await sql.query(`update user_perks set equipped = false where user_id = $1 and perk_id = $2`, [context.userId, perkId]);
		return { ok: true };
	}
	const n = await sql.query(`select count(*)::int as c from user_perks where user_id = $1 and equipped = true`, [context.userId]);
	if (Number(n[0]?.c) >= 2) throw new Error(`Chỉ trang bị tối đa 2 công pháp`);
	await sql.query(`update user_perks set equipped = true where user_id = $1 and perk_id = $2`, [context.userId, perkId]);
	return { ok: true };
});
//#endregion
export { getMyCultivation_createServerFn_handler, listMyPerks_createServerFn_handler, togglePerk_createServerFn_handler, unlockPerk_createServerFn_handler };
