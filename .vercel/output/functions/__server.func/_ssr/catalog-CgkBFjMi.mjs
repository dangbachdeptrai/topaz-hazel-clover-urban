//#region node_modules/.nitro/vite/services/ssr/assets/catalog-CgkBFjMi.js
var FRAME_DEFS = [
	{
		id: "jade",
		name: "Ngọc Bích Ấn",
		han: "玉碧印",
		blurb: "Viền ngọc quanh đạo ảnh.",
		cost: 12
	},
	{
		id: "gold",
		name: "Kim Quang",
		han: "金光圈",
		blurb: "Hào quang kim quanh đạo ảnh.",
		cost: 24
	},
	{
		id: "void",
		name: "Hư Không Màn",
		han: "虛空幕",
		blurb: "Viền khói huyền ảo.",
		cost: 36
	},
	{
		id: "crimson",
		name: "Huyết Ấn",
		han: "血印",
		blurb: "Viền đỏ sát khí Lôi Đài.",
		cost: 18
	}
];
function brRewards(place) {
	if (place === 1) return {
		exp: 42,
		thach: 10,
		contribution: 8
	};
	if (place === 2) return {
		exp: 24,
		thach: 6,
		contribution: 5
	};
	if (place === 3) return {
		exp: 16,
		thach: 4,
		contribution: 3
	};
	return {
		exp: 8,
		thach: 2,
		contribution: 1
	};
}
var BR_BOTS = [
	{
		id: "bot:br-ma-van",
		name: "Ma Vân"
	},
	{
		id: "bot:br-bach-lien",
		name: "Bạch Liên"
	},
	{
		id: "bot:br-hac-diem",
		name: "Hắc Diệm"
	},
	{
		id: "bot:br-loi-an",
		name: "Lôi Ẩn"
	},
	{
		id: "bot:br-tuyet-co",
		name: "Tuyết Cơ"
	},
	{
		id: "bot:br-phong-sat",
		name: "Phong Sát"
	},
	{
		id: "bot:br-han-nguyet",
		name: "Hàn Nguyệt"
	}
];
//#endregion
export { FRAME_DEFS as n, brRewards as r, BR_BOTS as t };
