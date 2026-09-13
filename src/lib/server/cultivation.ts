import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  MAX_EQUIPPED_PERKS,
  PERK_DEFS,
  expToNext,
  isBotId,
  nextElo,
  realmFromExp,
  realmLayer,
  realmMeets,
  rewardsForResult,
} from "@/lib/realms";
import type { CultivationProfile, FrameId, Perk, PerkId, PvpMode, RealmId } from "@/lib/types";

type ProfileRow = {
  user_id: string;
  display_name: string;
  dao_title: string;
  realm_id: RealmId;
  realm_layer: number;
  exp: number;
  elo: number;
  linh_thach: number;
  pvp_wins: number;
  pvp_losses: number;
  pvp_draws: number;
  win_streak: number;
  best_streak: number;
  tower_best_floor: number;
  guild_id: string | null;
  guild_name: string | null;
  guild_tag: string | null;
  equipped_frame: string | null;
  br_wins: number | null;
  br_best_place: number | null;
};

function asFrame(id: string | null | undefined): FrameId | null {
  if (id === "jade" || id === "gold" || id === "void" || id === "crimson") return id;
  return null;
}

function mapProfile(r: ProfileRow): CultivationProfile {
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
    brBestPlace: r.br_best_place == null ? null : Number(r.br_best_place),
  };
}

const PROFILE_SELECT = `select p.user_id, p.display_name, p.dao_title, p.realm_id, p.realm_layer, p.exp, p.elo, p.linh_thach,
            p.pvp_wins, p.pvp_losses, p.pvp_draws, p.win_streak, p.best_streak, p.tower_best_floor,
            p.guild_id, g.name as guild_name, g.tag as guild_tag, p.equipped_frame,
            coalesce(p.br_wins, 0) as br_wins, p.br_best_place
     from profiles p
     left join guilds g on g.id = p.guild_id
     where p.user_id = $1`;

async function authName(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const rows = await sql.query<{ name: string }>(`select name from "user" where id = $1`, [userId]);
  return rows[0]?.name?.trim() || "Đạo hữu";
}

export async function ensureProfile(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  displayName?: string,
): Promise<CultivationProfile> {
  const name = (displayName?.trim() || (await authName(sql, userId))).slice(0, 40);
  await sql.query(
    `insert into profiles (user_id, display_name, realm_id, realm_layer, exp, elo, linh_thach)
     values ($1, $2, 'luyen_khi', 1, 0, 1000, 48)
     on conflict (user_id) do update set
       display_name = case
         when excluded.display_name <> '' and excluded.display_name <> 'Đạo hữu'
         then excluded.display_name else profiles.display_name end,
       updated_at = now()`,
    [userId, name],
  );
  await sql.query(
    `insert into user_perks (user_id, perk_id, equipped)
     values ($1, 'bang_tam', true)
     on conflict (user_id, perk_id) do nothing`,
    [userId],
  );
  const rows = await sql.query<ProfileRow>(PROFILE_SELECT, [userId]);
  const row = rows[0];
  if (!row) throw new Error("Không mở được Đạo Cơ");
  const realm = realmFromExp(Number(row.exp));
  const layer = realmLayer(Number(row.exp));
  if (row.realm_id !== realm.id || Number(row.realm_layer) !== layer) {
    await sql.query(
      `update profiles set realm_id = $2, realm_layer = $3, updated_at = now() where user_id = $1`,
      [userId, realm.id, layer],
    );
    row.realm_id = realm.id;
    row.realm_layer = layer;
  }
  return mapProfile(row);
}

export const getMyCultivation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { displayName?: string } | undefined) => input ?? {})
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    return ensureProfile(sql, context.userId, data.displayName);
  });

export async function equippedPerks(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
): Promise<PerkId[]> {
  const rows = await sql.query<{ perk_id: PerkId }>(
    `select perk_id from user_perks where user_id = $1 and equipped = true`,
    [userId],
  );
  return rows.map((r) => r.perk_id);
}

export function perkBonus(ids: PerkId[]) {
  const set = new Set(ids);
  return {
    extraTime: set.has("bang_tam") ? 5 : 0,
    eliminate: set.has("minh_nhan"),
    expMul: set.has("kim_than") ? 1.15 : 1,
    extraThach: set.has("linh_van") ? 2 : 0,
  };
}

export const listMyPerks = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    const owned = await sql.query<{ perk_id: string; equipped: boolean }>(
      `select perk_id, equipped from user_perks where user_id = $1`,
      [context.userId],
    );
    const map = new Map(owned.map((r) => [r.perk_id, r]));
    const perks: Perk[] = PERK_DEFS.map((d) => {
      const row = map.get(d.id);
      return {
        ...d,
        unlocked: Boolean(row) || d.cost === 0,
        equipped: Boolean(row?.equipped),
      };
    });
    return { profile: me, perks };
  });

export const unlockPerk = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((perkId: PerkId) => perkId)
  .handler(async ({ context, data: perkId }) => {
    const def = PERK_DEFS.find((p) => p.id === perkId);
    if (!def) throw new Error("Không có công pháp này");
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    if (!realmMeets(me.realmId, def.minRealm)) {
      throw new Error("Cảnh giới chưa đủ để lĩnh ngộ");
    }
    const have = await sql.query<{ perk_id: string }>(
      `select perk_id from user_perks where user_id = $1 and perk_id = $2`,
      [context.userId, perkId],
    );
    if (have[0]) return { ok: true as const };
    if (me.linhThach < def.cost) throw new Error("Không đủ Linh Thạch");
    await sql.query(
      `update profiles set linh_thach = linh_thach - $2, updated_at = now() where user_id = $1`,
      [context.userId, def.cost],
    );
    await sql.query(
      `insert into user_perks (user_id, perk_id, equipped) values ($1,$2,false)`,
      [context.userId, perkId],
    );
    await sql.query(
      `insert into linh_thach_ledger (id, user_id, delta, reason) values ($1,$2,$3,$4)`,
      [crypto.randomUUID(), context.userId, -def.cost, `unlock:${perkId}`],
    );
    return { ok: true as const };
  });

export const togglePerk = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((perkId: PerkId) => perkId)
  .handler(async ({ context, data: perkId }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const row = await sql.query<{ equipped: boolean }>(
      `select equipped from user_perks where user_id = $1 and perk_id = $2`,
      [context.userId, perkId],
    );
    if (!row[0]) throw new Error("Chưa lĩnh ngộ công pháp này");
    if (row[0].equipped) {
      await sql.query(
        `update user_perks set equipped = false where user_id = $1 and perk_id = $2`,
        [context.userId, perkId],
      );
      return { ok: true as const };
    }
    const n = await sql.query<{ c: number }>(
      `select count(*)::int as c from user_perks where user_id = $1 and equipped = true`,
      [context.userId],
    );
    if (Number(n[0]?.c) >= MAX_EQUIPPED_PERKS) {
      throw new Error(`Chỉ trang bị tối đa ${MAX_EQUIPPED_PERKS} công pháp`);
    }
    await sql.query(
      `update user_perks set equipped = true where user_id = $1 and perk_id = $2`,
      [context.userId, perkId],
    );
    return { ok: true as const };
  });

export async function addContribution(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  amount: number,
) {
  if (!amount) return;
  await sql.query(`update guild_members set contribution = contribution + $2 where user_id = $1`, [
    userId,
    amount,
  ]);
}

export async function applyMatchRewards(
  sql: Awaited<ReturnType<typeof getSql>>,
  matchId: string,
): Promise<void> {
  const rows = await sql.query<{
    player1_id: string;
    player2_id: string | null;
    winner_id: string | null;
    status: string;
    mode: PvpMode | null;
    p1_elo_after: number | null;
  }>(
    `select player1_id, player2_id, winner_id, status, coalesce(mode, 'casual') as mode, p1_elo_after
     from pvp_matches where id = $1`,
    [matchId],
  );
  const m = rows[0];
  if (!m || m.status !== "completed" || m.p1_elo_after != null) return;

  const ranked = m.mode === "ranked";
  const p1 = await ensureProfile(sql, m.player1_id);
  const p2Human = isBotId(m.player2_id) ? null : m.player2_id;
  const p2 = p2Human ? await ensureProfile(sql, p2Human) : null;
  const p2Elo = p2?.elo ?? 1000;
  const p2Realm = p2?.realmId ?? "luyen_khi";

  const p1Score: 0 | 0.5 | 1 =
    m.winner_id == null ? 0.5 : m.winner_id === m.player1_id ? 1 : 0;
  const p2Score: 0 | 0.5 | 1 = (1 - p1Score) as 0 | 0.5 | 1;

  const p1NextElo = ranked ? nextElo(p1.elo, p2Elo, p1Score, p1.realmId) : p1.elo;
  const p2NextElo = p2 && ranked ? nextElo(p2.elo, p1.elo, p2Score, p2Realm) : p2Elo;

  const p1Perk = perkBonus(await equippedPerks(sql, p1.userId));
  const p2Perk = p2 ? perkBonus(await equippedPerks(sql, p2.userId)) : perkBonus([]);
  const p1Rew = rewardsForResult(p1Score === 1, p1Score === 0.5);
  const p2Rew = rewardsForResult(p2Score === 1, p2Score === 0.5);
  const p1Exp = Math.round(p1Rew.exp * p1Perk.expMul);
  const p2Exp = Math.round(p2Rew.exp * p2Perk.expMul);
  const p1Thach = p1Rew.thach + (p1Score === 1 ? p1Perk.extraThach : 0);
  const p2Thach = p2Rew.thach + (p2Score === 1 ? p2Perk.extraThach : 0);

  const claimed = await sql.query<{ id: string }>(
    `update pvp_matches
     set p1_elo_before = $2, p2_elo_before = $3,
         p1_elo_after = $4, p2_elo_after = $5,
         p1_exp_gain = $6, p2_exp_gain = $7
     where id = $1 and p1_elo_after is null
     returning id`,
    [matchId, p1.elo, p2Elo, p1NextElo, p2NextElo, p1Exp, p2Exp],
  );
  if (!claimed[0]) return;

  await grantProfile(sql, p1.userId, {
    exp: p1Exp,
    elo: p1NextElo,
    thach: p1Thach,
    result: p1Score,
  });
  if (p2) {
    await grantProfile(sql, p2.userId, {
      exp: p2Exp,
      elo: p2NextElo,
      thach: p2Thach,
      result: p2Score,
    });
  }
}

async function grantProfile(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  spec: { exp: number; elo: number; thach: number; result: 0 | 0.5 | 1 },
) {
  const me = await ensureProfile(sql, userId);
  const exp = me.exp + spec.exp;
  const realm = realmFromExp(exp);
  const layer = realmLayer(exp);
  const wins = me.pvpWins + (spec.result === 1 ? 1 : 0);
  const losses = me.pvpLosses + (spec.result === 0 ? 1 : 0);
  const draws = me.pvpDraws + (spec.result === 0.5 ? 1 : 0);
  const streak = spec.result === 1 ? me.winStreak + 1 : 0;
  const best = Math.max(me.bestStreak, streak);
  await sql.query(
    `update profiles set exp=$2, elo=$3, linh_thach=linh_thach+$4, realm_id=$5, realm_layer=$6,
            pvp_wins=$7, pvp_losses=$8, pvp_draws=$9, win_streak=$10, best_streak=$11, updated_at=now()
     where user_id=$1`,
    [userId, exp, spec.elo, spec.thach, realm.id, layer, wins, losses, draws, streak, best],
  );
  await sql.query(
    `insert into linh_thach_ledger (id, user_id, delta, reason) values ($1,$2,$3,'pvp')`,
    [crypto.randomUUID(), userId, spec.thach],
  );
  await addContribution(sql, userId, spec.result === 1 ? 5 : spec.result === 0.5 ? 2 : 1);
}

export async function grantTowerClear(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  floor: number,
) {
  const me = await ensureProfile(sql, userId);
  const bonus = perkBonus(await equippedPerks(sql, userId));
  const expGain = Math.round((10 + floor * 4) * bonus.expMul);
  const thach = 1 + Math.floor(floor / 3) + bonus.extraThach;
  const exp = me.exp + expGain;
  const realm = realmFromExp(exp);
  const best = Math.max(me.towerBestFloor, floor);
  await sql.query(
    `update profiles set exp=$2, linh_thach=linh_thach+$3, realm_id=$4, realm_layer=$5,
            tower_best_floor=$6, updated_at=now() where user_id=$1`,
    [userId, exp, thach, realm.id, realmLayer(exp), best],
  );
  await sql.query(
    `insert into linh_thach_ledger (id, user_id, delta, reason) values ($1,$2,$3,$4)`,
    [crypto.randomUUID(), userId, thach, `tower:${floor}`],
  );
  await addContribution(sql, userId, 2);
  return { expGain, thach };
}

export async function grantBrPlacement(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  place: number,
  spec: { exp: number; thach: number; contribution: number },
) {
  if (isBotId(userId)) return;
  const me = await ensureProfile(sql, userId);
  const bonus = perkBonus(await equippedPerks(sql, userId));
  const expGain = Math.round(spec.exp * bonus.expMul);
  const thach = spec.thach + (place === 1 ? bonus.extraThach : 0);
  const exp = me.exp + expGain;
  const realm = realmFromExp(exp);
  const brWins = me.brWins + (place === 1 ? 1 : 0);
  const bestPlace = me.brBestPlace == null ? place : Math.min(me.brBestPlace, place);
  const pvpWins = me.pvpWins + (place === 1 ? 1 : 0);
  await sql.query(
    `update profiles set exp=$2, linh_thach=linh_thach+$3, realm_id=$4, realm_layer=$5,
            br_wins=$6, br_best_place=$7, pvp_wins=$8, updated_at=now()
     where user_id=$1`,
    [userId, exp, thach, realm.id, realmLayer(exp), brWins, bestPlace, pvpWins],
  );
  await sql.query(
    `insert into linh_thach_ledger (id, user_id, delta, reason) values ($1,$2,$3,$4)`,
    [crypto.randomUUID(), userId, thach, `br:${place}`],
  );
  await addContribution(sql, userId, spec.contribution);
  return { expGain, thach };
}
