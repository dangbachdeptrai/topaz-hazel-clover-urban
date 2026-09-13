import type { PerkId, RealmId } from "./types";

export type RealmDef = {
  id: RealmId;
  name: string;
  nameHan: string;
  minExp: number;
  maxExp: number;
};

export const REALMS: RealmDef[] = [
  { id: "luyen_khi", name: "Luyện Khí", nameHan: "煉氣", minExp: 0, maxExp: 499 },
  { id: "truc_co", name: "Trúc Cơ", nameHan: "築基", minExp: 500, maxExp: 1499 },
  { id: "kim_dan", name: "Kim Đan", nameHan: "金丹", minExp: 1500, maxExp: 3999 },
  { id: "nguyen_anh", name: "Nguyên Anh", nameHan: "元嬰", minExp: 4000, maxExp: 999999 },
];

export const COUNTDOWN_SECONDS = 5;
export const RANKED_ELO_BAND = 300;
export const MAX_EQUIPPED_PERKS = 2;

export const PERK_DEFS: {
  id: PerkId;
  name: string;
  han: string;
  blurb: string;
  effect: "time" | "eliminate" | "exp" | "thach";
  value: number;
  minRealm: RealmId;
  cost: number;
}[] = [
  {
    id: "bang_tam",
    name: "Băng Tâm Quyết",
    han: "冰心訣",
    blurb: "Thêm 5 giây thời gian mỗi trận Lôi Đài và mỗi tầng Thiên Tháp.",
    effect: "time",
    value: 5,
    minRealm: "luyen_khi",
    cost: 0,
  },
  {
    id: "minh_nhan",
    name: "Minh Nhãn",
    han: "明眼",
    blurb: "Loại một đáp án sai trên mỗi câu khi đang trang bị.",
    effect: "eliminate",
    value: 1,
    minRealm: "luyen_khi",
    cost: 12,
  },
  {
    id: "linh_van",
    name: "Linh Vân Bộ",
    han: "靈雲步",
    blurb: "Thắng trận hoặc vượt tầng được thêm 2 Linh Thạch.",
    effect: "thach",
    value: 2,
    minRealm: "luyen_khi",
    cost: 8,
  },
  {
    id: "kim_than",
    name: "Kim Thân Quyết",
    han: "金身訣",
    blurb: "Tu Vi nhận thêm 15%. Mở từ Trúc Cơ.",
    effect: "exp",
    value: 0.15,
    minRealm: "truc_co",
    cost: 24,
  },
];

export function realmFromExp(exp: number): RealmDef {
  let current = REALMS[0]!;
  for (const r of REALMS) if (exp >= r.minExp) current = r;
  return current;
}

export function realmLayer(exp: number): number {
  const r = realmFromExp(exp);
  const span = Math.max(1, r.maxExp - r.minExp + 1);
  const t = (exp - r.minExp) / span;
  return Math.min(9, Math.max(1, Math.floor(t * 9) + 1));
}

export function expToNext(exp: number): number {
  const r = realmFromExp(exp);
  if (r.id === "nguyen_anh") return 0;
  return Math.max(0, r.maxExp + 1 - exp);
}

export function nextRealm(exp: number): RealmDef | null {
  const r = realmFromExp(exp);
  const i = REALMS.findIndex((x) => x.id === r.id);
  return REALMS[i + 1] ?? null;
}

export function realmProgress(exp: number): { pct: number; current: number; span: number } {
  const r = realmFromExp(exp);
  const span = Math.max(1, r.maxExp - r.minExp + 1);
  const current = Math.max(0, exp - r.minExp);
  return { pct: Math.min(100, (current / span) * 100), current, span };
}

export function realmMeets(have: RealmId, need: RealmId): boolean {
  const order: RealmId[] = ["luyen_khi", "truc_co", "kim_dan", "nguyen_anh"];
  return order.indexOf(have) >= order.indexOf(need);
}

export function nextElo(myElo: number, oppElo: number, score: 0 | 0.5 | 1, realm: RealmId): number {
  const k = realm === "nguyen_anh" ? 16 : realm === "kim_dan" ? 20 : 24;
  const expected = 1 / (1 + 10 ** ((oppElo - myElo) / 400));
  return Math.round(Math.max(100, myElo + k * (score - expected)));
}

export function rewardsForResult(win: boolean, draw: boolean): { exp: number; thach: number } {
  if (win) return { exp: 28, thach: 6 };
  if (draw) return { exp: 12, thach: 3 };
  return { exp: 8, thach: 2 };
}

export function isBotId(id: string | null | undefined): boolean {
  return Boolean(id?.startsWith("bot:"));
}
