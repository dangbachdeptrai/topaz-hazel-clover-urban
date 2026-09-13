import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { GUILD_CREATE_COST, GUILD_MAX_MEMBERS } from "@/lib/catalog";
import { getSql } from "@/lib/db";
import { ensureProfile } from "@/lib/server/cultivation";
import type { FrameId, GuildDetail, GuildMember, GuildRole, GuildSummary, RealmId } from "@/lib/types";
import { realmFromExp } from "@/lib/realms";
import { roomCode } from "@/lib/utils";

type GuildRow = {
  id: string;
  name: string;
  tag: string;
  motto: string;
  invite_code: string;
  leader_id: string;
  member_count: number | string;
  total_elo: number | string | null;
  total_contribution: number | string | null;
};

function asFrame(id: string | null | undefined): FrameId | null {
  if (id === "jade" || id === "gold" || id === "void" || id === "crimson") return id;
  return null;
}

function asRole(role: string): GuildRole {
  if (role === "leader" || role === "elder") return role;
  return "member";
}

function mapSummary(r: GuildRow): GuildSummary {
  return {
    id: r.id,
    name: r.name,
    tag: r.tag,
    motto: r.motto,
    inviteCode: r.invite_code,
    leaderId: r.leader_id,
    memberCount: Number(r.member_count),
    totalElo: Number(r.total_elo ?? 0),
    totalContribution: Number(r.total_contribution ?? 0),
  };
}

const GUILD_SELECT = `
  select g.id, g.name, g.tag, g.motto, g.invite_code, g.leader_id,
         count(m.user_id)::int as member_count,
         coalesce(sum(p.elo), 0) as total_elo,
         coalesce(sum(m.contribution), 0) as total_contribution
  from guilds g
  left join guild_members m on m.guild_id = g.id
  left join profiles p on p.user_id = m.user_id
`;

async function loadGuild(sql: Awaited<ReturnType<typeof getSql>>, guildId: string): Promise<GuildRow | null> {
  const rows = await sql.query<GuildRow>(
    `${GUILD_SELECT} where g.id = $1 group by g.id, g.name, g.tag, g.motto, g.invite_code, g.leader_id`,
    [guildId],
  );

  return rows[0] ?? null;
}

async function loadMembers(sql: Awaited<ReturnType<typeof getSql>>, guildId: string): Promise<GuildMember[]> {
  const rows = await sql.query<{
    user_id: string;
    display_name: string;
    dao_title: string;
    role: string;
    contribution: number;
    exp: number;
    elo: number;
    equipped_frame: string | null;
  }>(
    `select m.user_id, coalesce(p.display_name, 'Đạo hữu') as display_name, coalesce(p.dao_title,'') as dao_title,
            m.role, m.contribution, coalesce(p.exp,0) as exp, coalesce(p.elo,1000) as elo,
            p.equipped_frame
     from guild_members m
     left join profiles p on p.user_id = m.user_id
     where m.guild_id = $1
     order by case m.role when 'leader' then 0 when 'elder' then 1 else 2 end, m.contribution desc`,
    [guildId],
  );
  return rows.map((r) => {
    const realm = realmFromExp(Number(r.exp));
    return {
      userId: r.user_id,
      displayName: r.display_name,
      daoTitle: r.dao_title,
      role: asRole(r.role),
      contribution: Number(r.contribution),
      realmName: realm.name,
      realmHan: realm.nameHan,
      realmId: realm.id as RealmId,
      elo: Number(r.elo),
      equippedFrame: asFrame(r.equipped_frame),
    };
  });
}

function normalizeTag(raw: string) {
  const tag = raw.replace(/[^A-Za-z0-9À-ỹ]/g, "").toUpperCase().slice(0, 4);
  return tag.length >= 2 ? tag : "";
}

export const listGuilds = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    const rows = await sql.query<GuildRow>(
      `${GUILD_SELECT} group by g.id, g.name, g.tag, g.motto, g.invite_code, g.leader_id
       order by total_contribution desc, total_elo desc limit 40`,
    );
    return { mine: me, guilds: rows.map(mapSummary) };
  });

export const getGuild = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((guildId: string) => guildId)
  .handler(async ({ context, data: guildId }): Promise<GuildDetail> => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const row = await loadGuild(sql, guildId);
    if (!row) throw new Error("Không tìm thấy Tông Môn");
    const members = await loadMembers(sql, guildId);
    const mine = members.find((m) => m.userId === context.userId);
    return { ...mapSummary(row), members, myRole: mine?.role ?? null };
  });

export const createGuild = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name: string; tag: string; motto?: string }) => input)
  .handler(async ({ context, data }) => {
    const name = data.name.trim().slice(0, 28);
    const tag = normalizeTag(data.tag);
    const motto = (data.motto ?? "").trim().slice(0, 80);
    if (name.length < 2) throw new Error("Tên Tông Môn tối thiểu 2 ký tự");
    if (!tag) throw new Error("Ký hiệu 2–4 chữ");
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    if (me.guildId) throw new Error("Đã thuộc một Tông Môn");
    if (me.linhThach < GUILD_CREATE_COST) throw new Error("Không đủ Linh Thạch để lập Tông");
    const taken = await sql.query<{ id: string }>(`select id from guilds where tag = $1`, [tag]);
    if (taken[0]) throw new Error("Ký hiệu đã có Tông dùng");
    const id = crypto.randomUUID();
    const code = roomCode();
    await sql.query(
      `update profiles set linh_thach = linh_thach - $2, updated_at = now() where user_id = $1 and linh_thach >= $2`,
      [context.userId, GUILD_CREATE_COST],
    );
    await sql.query(
      `insert into linh_thach_ledger (id, user_id, delta, reason) values ($1,$2,$3,'guild:create')`,
      [crypto.randomUUID(), context.userId, -GUILD_CREATE_COST],
    );
    await sql.query(
      `insert into guilds (id, name, tag, motto, invite_code, leader_id) values ($1,$2,$3,$4,$5,$6)`,
      [id, name, tag, motto, code, context.userId],
    );
    await sql.query(
      `insert into guild_members (guild_id, user_id, role, contribution) values ($1,$2,'leader',0)`,
      [id, context.userId],
    );
    await sql.query(`update profiles set guild_id = $2, updated_at = now() where user_id = $1`, [
      context.userId,
      id,
    ]);
    return { id };
  });

export const joinGuild = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { inviteCode: string }) => input)
  .handler(async ({ context, data }) => {
    const code = data.inviteCode.trim().toUpperCase();
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    if (me.guildId) throw new Error("Đã thuộc một Tông Môn");
    const g = await sql.query<{ id: string }>(`select id from guilds where invite_code = $1`, [code]);
    if (!g[0]) throw new Error("Mã mời không đúng");
    const n = await sql.query<{ c: number }>(
      `select count(*)::int as c from guild_members where guild_id = $1`,
      [g[0].id],
    );
    if (Number(n[0]?.c) >= GUILD_MAX_MEMBERS) throw new Error("Tông Môn đã đủ người");
    await sql.query(
      `insert into guild_members (guild_id, user_id, role) values ($1,$2,'member')`,
      [g[0].id, context.userId],
    );
    await sql.query(`update profiles set guild_id = $2, updated_at = now() where user_id = $1`, [
      context.userId,
      g[0].id,
    ]);
    return { id: g[0].id };
  });

export const leaveGuild = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    if (!me.guildId) throw new Error("Chưa vào Tông Môn");
    const g = await sql.query<{ leader_id: string }>(`select leader_id from guilds where id = $1`, [
      me.guildId,
    ]);
    if (g[0]?.leader_id === context.userId) {
      const others = await sql.query<{ c: number }>(
        `select count(*)::int as c from guild_members where guild_id = $1 and user_id <> $2`,
        [me.guildId, context.userId],
      );
      if (Number(others[0]?.c) > 0) throw new Error("Tông chủ phải nhường vị trước khi rời");
      await sql.query(`delete from guilds where id = $1`, [me.guildId]);
    } else {
      await sql.query(`delete from guild_members where guild_id = $1 and user_id = $2`, [
        me.guildId,
        context.userId,
      ]);
    }
    await sql.query(`update profiles set guild_id = null, updated_at = now() where user_id = $1`, [
      context.userId,
    ]);
    return { ok: true as const };
  });

export const kickMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { userId: string }) => input)
  .handler(async ({ context, data }) => {
    if (data.userId === context.userId) throw new Error("Không tự trục xuất mình");
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    if (!me.guildId) throw new Error("Chưa vào Tông Môn");
    const role = await sql.query<{ role: string }>(
      `select role from guild_members where guild_id = $1 and user_id = $2`,
      [me.guildId, context.userId],
    );
    if (role[0]?.role !== "leader") throw new Error("Chỉ Tông chủ được trục xuất");
    await sql.query(`delete from guild_members where guild_id = $1 and user_id = $2`, [
      me.guildId,
      data.userId,
    ]);
    await sql.query(`update profiles set guild_id = null, updated_at = now() where user_id = $1`, [
      data.userId,
    ]);
    return { ok: true as const };
  });
