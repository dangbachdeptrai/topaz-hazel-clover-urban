import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { FRAME_DEFS, NAME_COST, TITLE_COST } from "@/lib/catalog";
import { getSql } from "@/lib/db";
import { ensureProfile } from "@/lib/server/cultivation";
import type { FrameId, ShopFrame } from "@/lib/types";

export const listShop = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    const owned = await sql.query<{ item_id: string; equipped: boolean }>(
      `select item_id, equipped from user_inventory where user_id = $1`,
      [context.userId],
    );
    const map = new Map(owned.map((r) => [r.item_id, r]));
    const frames: ShopFrame[] = FRAME_DEFS.map((d) => {
      const row = map.get(d.id);
      return {
        ...d,
        owned: Boolean(row),
        equipped: Boolean(row?.equipped) || me.equippedFrame === d.id,
      };
    });
    return { profile: me, frames, titleCost: TITLE_COST, nameCost: NAME_COST };
  });

export const buyFrame = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((frameId: FrameId) => frameId)
  .handler(async ({ context, data: frameId }) => {
    const def = FRAME_DEFS.find((f) => f.id === frameId);
    if (!def) throw new Error("Không có linh bảo này");
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    const have = await sql.query<{ item_id: string }>(
      `select item_id from user_inventory where user_id = $1 and item_id = $2`,
      [context.userId, frameId],
    );
    if (have[0]) return { ok: true as const };
    if (me.linhThach < def.cost) throw new Error("Không đủ Linh Thạch");
    const spent = await sql.query<{ user_id: string }>(
      `update profiles set linh_thach = linh_thach - $2, updated_at = now()
       where user_id = $1 and linh_thach >= $2
       returning user_id`,
      [context.userId, def.cost],
    );
    if (!spent[0]) throw new Error("Không đủ Linh Thạch");
    await sql.query(
      `insert into user_inventory (user_id, item_id, equipped) values ($1,$2,false)
       on conflict (user_id, item_id) do nothing`,
      [context.userId, frameId],
    );
    await sql.query(
      `insert into linh_thach_ledger (id, user_id, delta, reason) values ($1,$2,$3,$4)`,
      [crypto.randomUUID(), context.userId, -def.cost, `shop:${frameId}`],
    );
    return { ok: true as const };
  });

export const equipFrame = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((frameId: FrameId | "") => frameId)
  .handler(async ({ context, data: frameId }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    if (!frameId) {
      await sql.query(`update user_inventory set equipped = false where user_id = $1`, [context.userId]);
      await sql.query(`update profiles set equipped_frame = '', updated_at = now() where user_id = $1`, [
        context.userId,
      ]);
      return { ok: true as const };
    }
    const have = await sql.query<{ item_id: string }>(
      `select item_id from user_inventory where user_id = $1 and item_id = $2`,
      [context.userId, frameId],
    );
    if (!have[0]) throw new Error("Chưa sở hữu khung này");
    await sql.query(`update user_inventory set equipped = false where user_id = $1`, [context.userId]);
    await sql.query(
      `update user_inventory set equipped = true where user_id = $1 and item_id = $2`,
      [context.userId, frameId],
    );
    await sql.query(`update profiles set equipped_frame = $2, updated_at = now() where user_id = $1`, [
      context.userId,
      frameId,
    ]);
    return { ok: true as const };
  });

export const setDaoTitle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((title: string) => title)
  .handler(async ({ context, data }) => {
    const title = data.trim().slice(0, 24);
    if (title.length < 2) throw new Error("Đạo hiệu tối thiểu 2 ký tự");
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    if (me.linhThach < TITLE_COST) throw new Error("Không đủ Linh Thạch");
    const spent = await sql.query<{ user_id: string }>(
      `update profiles set linh_thach = linh_thach - $2, dao_title = $3, updated_at = now()
       where user_id = $1 and linh_thach >= $2
       returning user_id`,
      [context.userId, TITLE_COST, title],
    );
    if (!spent[0]) throw new Error("Không đủ Linh Thạch");
    await sql.query(
      `insert into linh_thach_ledger (id, user_id, delta, reason) values ($1,$2,$3,'shop:title')`,
      [crypto.randomUUID(), context.userId, -TITLE_COST],
    );
    return { ok: true as const };
  });

export const setDisplayName = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((name: string) => name)
  .handler(async ({ context, data }) => {
    const name = data.trim().slice(0, 28);
    if (name.length < 2) throw new Error("Tên tối thiểu 2 ký tự");
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    if (me.linhThach < NAME_COST) throw new Error("Không đủ Linh Thạch");
    const spent = await sql.query<{ user_id: string }>(
      `update profiles set linh_thach = linh_thach - $2, display_name = $3, updated_at = now()
       where user_id = $1 and linh_thach >= $2
       returning user_id`,
      [context.userId, NAME_COST, name],
    );
    if (!spent[0]) throw new Error("Không đủ Linh Thạch");
    await sql.query(
      `insert into linh_thach_ledger (id, user_id, delta, reason) values ($1,$2,$3,'shop:name')`,
      [crypto.randomUUID(), context.userId, -NAME_COST],
    );
    return { ok: true as const };
  });
