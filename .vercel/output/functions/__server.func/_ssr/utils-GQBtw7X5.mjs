import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-GQBtw7X5.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function initials(name) {
	return (name ?? "Đạo hữu").trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "Đ";
}
function formatTime(total) {
	const s = Math.max(0, Math.floor(total));
	const m = Math.floor(s / 60);
	const r = s % 60;
	return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}
function roomCode() {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let out = "";
	for (let i = 0; i < 5; i++) out += alphabet[Math.floor(Math.random() * 32)];
	return out;
}
//#endregion
export { roomCode as i, formatTime as n, initials as r, cn as t };
