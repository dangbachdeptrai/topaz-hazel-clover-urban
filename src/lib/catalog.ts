import type { FrameId } from "./types";

export const BR_CAPACITY = 8;
export const BR_ROUND_SECONDS = 18;
export const BR_COUNTDOWN_SECONDS = 5;
export const BR_QUEUE_FILL_MS = 4000;
export const BR_QUESTION_COUNT = 8;

export const GUILD_CREATE_COST = 24;
export const GUILD_MAX_MEMBERS = 20;
export const TITLE_COST = 20;
export const NAME_COST = 28;

export const FRAME_DEFS: {
  id: FrameId;
  name: string;
  han: string;
  blurb: string;
  cost: number;
}[] = [
  { id: "jade", name: "Ngọc Bích Ấn", han: "玉碧印", blurb: "Viền ngọc quanh đạo ảnh.", cost: 12 },
  { id: "gold", name: "Kim Quang", han: "金光圈", blurb: "Hào quang kim quanh đạo ảnh.", cost: 24 },
  { id: "void", name: "Hư Không Màn", han: "虛空幕", blurb: "Viền khói huyền ảo.", cost: 36 },
  { id: "crimson", name: "Huyết Ấn", han: "血印", blurb: "Viền đỏ sát khí Lôi Đài.", cost: 18 },
];

export function frameById(id: string | null | undefined) {
  if (!id) return null;
  return FRAME_DEFS.find((f) => f.id === id) ?? null;
}

export function brRewards(place: number): { exp: number; thach: number; contribution: number } {
  if (place === 1) return { exp: 42, thach: 10, contribution: 8 };
  if (place === 2) return { exp: 24, thach: 6, contribution: 5 };
  if (place === 3) return { exp: 16, thach: 4, contribution: 3 };
  return { exp: 8, thach: 2, contribution: 1 };
}

export const BR_BOTS = [
  { id: "bot:br-ma-van", name: "Ma Vân" },
  { id: "bot:br-bach-lien", name: "Bạch Liên" },
  { id: "bot:br-hac-diem", name: "Hắc Diệm" },
  { id: "bot:br-loi-an", name: "Lôi Ẩn" },
  { id: "bot:br-tuyet-co", name: "Tuyết Cơ" },
  { id: "bot:br-phong-sat", name: "Phong Sát" },
  { id: "bot:br-han-nguyet", name: "Hàn Nguyệt" },
];
