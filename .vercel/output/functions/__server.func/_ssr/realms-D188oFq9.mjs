//#region node_modules/.nitro/vite/services/ssr/assets/realms-D188oFq9.js
var REALMS = [
	{
		id: "luyen_khi",
		name: "Luyện Khí",
		nameHan: "煉氣",
		minExp: 0,
		maxExp: 499
	},
	{
		id: "truc_co",
		name: "Trúc Cơ",
		nameHan: "築基",
		minExp: 500,
		maxExp: 1499
	},
	{
		id: "kim_dan",
		name: "Kim Đan",
		nameHan: "金丹",
		minExp: 1500,
		maxExp: 3999
	},
	{
		id: "nguyen_anh",
		name: "Nguyên Anh",
		nameHan: "元嬰",
		minExp: 4e3,
		maxExp: 999999
	}
];
var PERK_DEFS = [
	{
		id: "bang_tam",
		name: "Băng Tâm Quyết",
		han: "冰心訣",
		blurb: "Thêm 5 giây thời gian mỗi trận Lôi Đài và mỗi tầng Thiên Tháp.",
		effect: "time",
		value: 5,
		minRealm: "luyen_khi",
		cost: 0
	},
	{
		id: "minh_nhan",
		name: "Minh Nhãn",
		han: "明眼",
		blurb: "Loại một đáp án sai trên mỗi câu khi đang trang bị.",
		effect: "eliminate",
		value: 1,
		minRealm: "luyen_khi",
		cost: 12
	},
	{
		id: "linh_van",
		name: "Linh Vân Bộ",
		han: "靈雲步",
		blurb: "Thắng trận hoặc vượt tầng được thêm 2 Linh Thạch.",
		effect: "thach",
		value: 2,
		minRealm: "luyen_khi",
		cost: 8
	},
	{
		id: "kim_than",
		name: "Kim Thân Quyết",
		han: "金身訣",
		blurb: "Tu Vi nhận thêm 15%. Mở từ Trúc Cơ.",
		effect: "exp",
		value: .15,
		minRealm: "truc_co",
		cost: 24
	}
];
function realmFromExp(exp) {
	let current = REALMS[0];
	for (const r of REALMS) if (exp >= r.minExp) current = r;
	return current;
}
function realmLayer(exp) {
	const r = realmFromExp(exp);
	const span = Math.max(1, r.maxExp - r.minExp + 1);
	const t = (exp - r.minExp) / span;
	return Math.min(9, Math.max(1, Math.floor(t * 9) + 1));
}
function expToNext(exp) {
	const r = realmFromExp(exp);
	if (r.id === "nguyen_anh") return 0;
	return Math.max(0, r.maxExp + 1 - exp);
}
function nextRealm(exp) {
	const r = realmFromExp(exp);
	return REALMS[REALMS.findIndex((x) => x.id === r.id) + 1] ?? null;
}
function realmProgress(exp) {
	const r = realmFromExp(exp);
	const span = Math.max(1, r.maxExp - r.minExp + 1);
	const current = Math.max(0, exp - r.minExp);
	return {
		pct: Math.min(100, current / span * 100),
		current,
		span
	};
}
function realmMeets(have, need) {
	const order = [
		"luyen_khi",
		"truc_co",
		"kim_dan",
		"nguyen_anh"
	];
	return order.indexOf(have) >= order.indexOf(need);
}
function nextElo(myElo, oppElo, score, realm) {
	const k = realm === "nguyen_anh" ? 16 : realm === "kim_dan" ? 20 : 24;
	const expected = 1 / (1 + 10 ** ((oppElo - myElo) / 400));
	return Math.round(Math.max(100, myElo + k * (score - expected)));
}
function rewardsForResult(win, draw) {
	if (win) return {
		exp: 28,
		thach: 6
	};
	if (draw) return {
		exp: 12,
		thach: 3
	};
	return {
		exp: 8,
		thach: 2
	};
}
function isBotId(id) {
	return Boolean(id?.startsWith("bot:"));
}
//#endregion
export { nextRealm as a, realmMeets as c, nextElo as i, realmProgress as l, expToNext as n, realmFromExp as o, isBotId as r, realmLayer as s, PERK_DEFS as t, rewardsForResult as u };
