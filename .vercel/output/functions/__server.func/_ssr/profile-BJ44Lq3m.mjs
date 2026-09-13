import { r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-DvBmSZow.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { n as ensureProfile } from "./cultivation-CRtzj3Cp.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-BJ44Lq3m.js
var getProfileStats_createServerFn_handler = createServerRpc({
	id: "3344b44ec606eec5b9f687f6f4081eaa448fb76ec21e448fae5e8c87577c81cd",
	name: "getProfileStats",
	filename: "src/lib/server/profile.ts"
}, (opts) => getProfileStats.__executeServer(opts));
var getProfileStats = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getProfileStats_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const me = await ensureProfile(sql, context.userId);
	const r = (await sql.query(`select count(*)::int as n, avg(score) as avg, max(score) as best
       from exam_attempts where user_id = $1 and submitted_at is not null`, [context.userId]))[0];
	return {
		examsTaken: Number(r?.n ?? 0),
		avgScore: Number(r?.avg ?? 0),
		bestScore: Number(r?.best ?? 0),
		pvpWins: me.pvpWins,
		pvpLosses: me.pvpLosses,
		pvpDraws: me.pvpDraws
	};
});
//#endregion
export { getProfileStats_createServerFn_handler };
