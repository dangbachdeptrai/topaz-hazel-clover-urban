import { r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-DvBmSZow.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { n as ensureProfile } from "./cultivation-CRtzj3Cp.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { n as FRAME_DEFS } from "./catalog-CgkBFjMi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop-CsAfgwvz.js
var listShop_createServerFn_handler = createServerRpc({
	id: "75c50305b8528c0ffd43de5f2e44e412a6e7eb66802ca70e90f8cedd5b84c13f",
	name: "listShop",
	filename: "src/lib/server/shop.ts"
}, (opts) => listShop.__executeServer(opts));
var listShop = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listShop_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const me = await ensureProfile(sql, context.userId);
	const owned = await sql.query(`select item_id, equipped from user_inventory where user_id = $1`, [context.userId]);
	const map = new Map(owned.map((r) => [r.item_id, r]));
	return {
		profile: me,
		frames: FRAME_DEFS.map((d) => {
			const row = map.get(d.id);
			return {
				...d,
				owned: Boolean(row),
				equipped: Boolean(row?.equipped) || me.equippedFrame === d.id
			};
		}),
		titleCost: 20,
		nameCost: 28
	};
});
var buyFrame_createServerFn_handler = createServerRpc({
	id: "71aa55eb20d4d3844cabd6580cdb7e4d128c0938469145ce33ca20a2685d7f52",
	name: "buyFrame",
	filename: "src/lib/server/shop.ts"
}, (opts) => buyFrame.__executeServer(opts));
var buyFrame = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((frameId) => frameId).handler(buyFrame_createServerFn_handler, async ({ context, data: frameId }) => {
	const def = FRAME_DEFS.find((f) => f.id === frameId);
	if (!def) throw new Error("Không có linh bảo này");
	const sql = await getSql();
	const me = await ensureProfile(sql, context.userId);
	if ((await sql.query(`select item_id from user_inventory where user_id = $1 and item_id = $2`, [context.userId, frameId]))[0]) return { ok: true };
	if (me.linhThach < def.cost) throw new Error("Không đủ Linh Thạch");
	if (!(await sql.query(`update profiles set linh_thach = linh_thach - $2, updated_at = now()
       where user_id = $1 and linh_thach >= $2
       returning user_id`, [context.userId, def.cost]))[0]) throw new Error("Không đủ Linh Thạch");
	await sql.query(`insert into user_inventory (user_id, item_id, equipped) values ($1,$2,false)
       on conflict (user_id, item_id) do nothing`, [context.userId, frameId]);
	await sql.query(`insert into linh_thach_ledger (id, user_id, delta, reason) values ($1,$2,$3,$4)`, [
		crypto.randomUUID(),
		context.userId,
		-def.cost,
		`shop:${frameId}`
	]);
	return { ok: true };
});
var equipFrame_createServerFn_handler = createServerRpc({
	id: "ee7108f30a35e51caff66054b3f909fc9d9746ac8075615a5020d669357fa78e",
	name: "equipFrame",
	filename: "src/lib/server/shop.ts"
}, (opts) => equipFrame.__executeServer(opts));
var equipFrame = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((frameId) => frameId).handler(equipFrame_createServerFn_handler, async ({ context, data: frameId }) => {
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	if (!frameId) {
		await sql.query(`update user_inventory set equipped = false where user_id = $1`, [context.userId]);
		await sql.query(`update profiles set equipped_frame = '', updated_at = now() where user_id = $1`, [context.userId]);
		return { ok: true };
	}
	if (!(await sql.query(`select item_id from user_inventory where user_id = $1 and item_id = $2`, [context.userId, frameId]))[0]) throw new Error("Chưa sở hữu khung này");
	await sql.query(`update user_inventory set equipped = false where user_id = $1`, [context.userId]);
	await sql.query(`update user_inventory set equipped = true where user_id = $1 and item_id = $2`, [context.userId, frameId]);
	await sql.query(`update profiles set equipped_frame = $2, updated_at = now() where user_id = $1`, [context.userId, frameId]);
	return { ok: true };
});
var setDaoTitle_createServerFn_handler = createServerRpc({
	id: "d3c790c40d8a1a1097aa15494f3278b626797e08e0f8f7594dcc310222e3bb0a",
	name: "setDaoTitle",
	filename: "src/lib/server/shop.ts"
}, (opts) => setDaoTitle.__executeServer(opts));
var setDaoTitle = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((title) => title).handler(setDaoTitle_createServerFn_handler, async ({ context, data }) => {
	const title = data.trim().slice(0, 24);
	if (title.length < 2) throw new Error("Đạo hiệu tối thiểu 2 ký tự");
	const sql = await getSql();
	if ((await ensureProfile(sql, context.userId)).linhThach < 20) throw new Error("Không đủ Linh Thạch");
	if (!(await sql.query(`update profiles set linh_thach = linh_thach - $2, dao_title = $3, updated_at = now()
       where user_id = $1 and linh_thach >= $2
       returning user_id`, [
		context.userId,
		20,
		title
	]))[0]) throw new Error("Không đủ Linh Thạch");
	await sql.query(`insert into linh_thach_ledger (id, user_id, delta, reason) values ($1,$2,$3,'shop:title')`, [
		crypto.randomUUID(),
		context.userId,
		-20
	]);
	return { ok: true };
});
var setDisplayName_createServerFn_handler = createServerRpc({
	id: "6ae96566754cfe064298099ab02d6c81fe821631821d18d25147e079f6b9725b",
	name: "setDisplayName",
	filename: "src/lib/server/shop.ts"
}, (opts) => setDisplayName.__executeServer(opts));
var setDisplayName = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((name) => name).handler(setDisplayName_createServerFn_handler, async ({ context, data }) => {
	const name = data.trim().slice(0, 28);
	if (name.length < 2) throw new Error("Tên tối thiểu 2 ký tự");
	const sql = await getSql();
	if ((await ensureProfile(sql, context.userId)).linhThach < 28) throw new Error("Không đủ Linh Thạch");
	if (!(await sql.query(`update profiles set linh_thach = linh_thach - $2, display_name = $3, updated_at = now()
       where user_id = $1 and linh_thach >= $2
       returning user_id`, [
		context.userId,
		28,
		name
	]))[0]) throw new Error("Không đủ Linh Thạch");
	await sql.query(`insert into linh_thach_ledger (id, user_id, delta, reason) values ($1,$2,$3,'shop:name')`, [
		crypto.randomUUID(),
		context.userId,
		-28
	]);
	return { ok: true };
});
//#endregion
export { buyFrame_createServerFn_handler, equipFrame_createServerFn_handler, listShop_createServerFn_handler, setDaoTitle_createServerFn_handler, setDisplayName_createServerFn_handler };
