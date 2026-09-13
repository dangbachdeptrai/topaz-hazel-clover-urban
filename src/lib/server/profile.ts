import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { ensureProfile } from "@/lib/server/cultivation";
import type { ProfileStats } from "@/lib/types";

export const getProfileStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    const rows = await sql.query<{ n: number; avg: string | number | null; best: string | number | null }>(
      `select count(*)::int as n, avg(score) as avg, max(score) as best
       from exam_attempts where user_id = $1 and submitted_at is not null`,
      [context.userId],
    );
    const r = rows[0];
    const stats: ProfileStats = {
      examsTaken: Number(r?.n ?? 0),
      avgScore: Number(r?.avg ?? 0),
      bestScore: Number(r?.best ?? 0),
      pvpWins: me.pvpWins,
      pvpLosses: me.pvpLosses,
      pvpDraws: me.pvpDraws,
    };
    return stats;
  });
