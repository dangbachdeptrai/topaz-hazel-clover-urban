import { r as getSql } from "./db-DvBmSZow.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seed-DGRl8yjE.js
var EXAMS = [
	{
		id: "thptqg-minh-hoa",
		title: "THPTQG Toán — Đề minh họa",
		type: "THPTQG",
		duration: 1500,
		desc: "Phong cách đề minh họa Bộ GDĐT: đạo hàm, tích phân, mũ log, hình học không gian.",
		author: "Bộ GDĐT (phong cách minh họa)",
		source: "THPTQG"
	},
	{
		id: "vact-logic",
		title: "VACT Tư duy toán",
		type: "VACT",
		duration: 1200,
		desc: "Tổ hợp, logic, dữ liệu, hình động — phong cách đánh giá năng lực.",
		author: "Tổ ra đề VACT (phong cách)",
		source: "VACT"
	},
	{
		id: "tsa-khong-gian",
		title: "TSA Tư duy không gian",
		type: "TSA",
		duration: 900,
		desc: "Xoay hình, gấp giấy, mặt cắt — luyện mắt hình học.",
		author: "TSA (phong cách)",
		source: "TSA"
	},
	{
		id: "pvp-blitz",
		title: "Lôi Đài Blitz",
		type: "PVP",
		duration: 480,
		desc: "8 câu xào từ kho — dùng khi không xào bài.",
		author: "Linh Toán Các",
		source: "PvP"
	}
];
var Qs = [
	{
		id: "q1",
		examId: "thptqg-minh-hoa",
		order: 1,
		content: "Cho $f(x)=x^3-3x^2+2$. Đạo hàm $f'(x)$ bằng",
		a: "$3x^2-6x$",
		b: "$3x^2-3x$",
		c: "$x^2-6x$",
		d: "$3x^2-6$",
		correct: "A",
		expl: "$(x^3)'=3x^2$, $(-3x^2)'=-6x$.",
		topic: "Đạo hàm",
		diff: "easy",
		score: .25
	},
	{
		id: "q2",
		examId: "thptqg-minh-hoa",
		order: 2,
		content: "Giới hạn $\\lim_{x\\to 1}\\dfrac{x^2-1}{x-1}$ bằng",
		a: "0",
		b: "1",
		c: "2",
		d: "Không tồn tại",
		correct: "C",
		expl: "Rút $(x-1)(x+1)/(x-1)=x+1\\to 2$.",
		topic: "Giới hạn",
		diff: "easy",
		score: .25
	},
	{
		id: "q3",
		examId: "thptqg-minh-hoa",
		order: 3,
		content: "$\\int_0^1 2x\\,dx$ bằng",
		a: "1",
		b: "2",
		c: "0",
		d: "$1/2$",
		correct: "A",
		expl: "$x^2$ từ 0 đến 1 bằng 1.",
		topic: "Tích phân",
		diff: "easy",
		score: .25
	},
	{
		id: "q4",
		examId: "thptqg-minh-hoa",
		order: 4,
		content: "Tiếp tuyến của $y=x^2$ tại $x=1$ có hệ số góc",
		a: "1",
		b: "2",
		c: "0",
		d: "4",
		correct: "B",
		expl: "$y'=2x$, tại 1 bằng 2.",
		topic: "Tiếp tuyến",
		diff: "easy",
		score: .25
	},
	{
		id: "q5",
		examId: "thptqg-minh-hoa",
		order: 5,
		content: "$\\log_2 8$ bằng",
		a: "2",
		b: "3",
		c: "4",
		d: "8",
		correct: "B",
		expl: "$2^3=8$.",
		topic: "Logarit",
		diff: "easy",
		score: .25
	},
	{
		id: "q6",
		examId: "thptqg-minh-hoa",
		order: 6,
		content: "Hàm $f(x)=x^3-3x$ đồng biến trên",
		a: "$(-\\infty;-1)$",
		b: "$(-1;1)$",
		c: "$(1;+\\infty)$ và $(-\\infty;-1)$",
		d: "$\\mathbb{R}$",
		correct: "C",
		expl: "$f'=3x^2-3=3(x-1)(x+1)\\ge 0$ khi $|x|\\ge 1$.",
		topic: "Đơn điệu",
		diff: "medium",
		score: .5
	},
	{
		id: "q7",
		examId: "thptqg-minh-hoa",
		order: 7,
		content: "Thể tích khối cầu bán kính 3 bằng",
		a: "$36\\pi$",
		b: "$12\\pi$",
		c: "$108\\pi$",
		d: "$4\\pi$",
		correct: "A",
		expl: "$V=\\frac{4}{3}\\pi r^3=36\\pi$.",
		topic: "Mặt cầu",
		diff: "medium",
		score: .5
	},
	{
		id: "q8",
		examId: "thptqg-minh-hoa",
		order: 8,
		content: "Số phức $z=3-4i$. Modun $|z|$ bằng",
		a: "5",
		b: "7",
		c: "1",
		d: "12",
		correct: "A",
		expl: "$\\sqrt{9+16}=5$.",
		topic: "Số phức",
		diff: "easy",
		score: .25
	},
	{
		id: "q9",
		examId: "thptqg-minh-hoa",
		order: 9,
		content: "Nguyên hàm của $\\cos x$ là",
		a: "$-\\sin x+C$",
		b: "$\\sin x+C$",
		c: "$-\\cos x+C$",
		d: "$\\tan x+C$",
		correct: "B",
		expl: "$(\\sin x)'=\\cos x$.",
		topic: "Nguyên hàm",
		diff: "easy",
		score: .25
	},
	{
		id: "q10",
		examId: "thptqg-minh-hoa",
		order: 10,
		content: "Nếu $f'(x)=6x$ và $f(0)=4$ thì $f(x)$ bằng",
		a: "$3x^2$",
		b: "$3x^2+4$",
		c: "$6x^2+4$",
		d: "$3x^2-4$",
		correct: "B",
		expl: "Nguyên hàm $3x^2+C$, $C=4$.",
		topic: "Nguyên hàm",
		diff: "medium",
		score: .5
	},
	{
		id: "q11",
		examId: "thptqg-minh-hoa",
		order: 11,
		content: "Khoảng cách từ $O(0,0,0)$ tới mặt phẳng $x+2y+2z-6=0$ bằng",
		a: "2",
		b: "3",
		c: "6",
		d: "1",
		correct: "A",
		expl: "$| -6|/\\sqrt{1+4+4}=6/3=2$.",
		topic: "Mặt phẳng",
		diff: "medium",
		score: .5
	},
	{
		id: "q12",
		examId: "thptqg-minh-hoa",
		order: 12,
		content: "Cực tiểu của $f(x)=x^3-3x+1$ đạt tại",
		a: "$x=-1$",
		b: "$x=0$",
		c: "$x=1$",
		d: "$x=2$",
		correct: "C",
		expl: "$f'=3(x^2-1)$, $x=1$ là cực tiểu.",
		topic: "Cực trị",
		diff: "hard",
		score: .75
	},
	{
		id: "v1",
		examId: "vact-logic",
		order: 1,
		content: "Trong 5 người bắt tay nhau (mỗi cặp một lần), số cái bắt tay là",
		a: "10",
		b: "5",
		c: "20",
		d: "15",
		correct: "A",
		expl: "$C_5^2=10$.",
		topic: "Tổ hợp",
		diff: "easy",
		score: 1
	},
	{
		id: "v2",
		examId: "vact-logic",
		order: 2,
		content: "Dãy 2, 6, 12, 20, 30,… số tiếp theo là",
		a: "36",
		b: "40",
		c: "42",
		d: "44",
		correct: "C",
		expl: "Cộng 4,5,8,10,12… hoặc $n(n+1)$.",
		topic: "Quy luật",
		diff: "easy",
		score: 1
	},
	{
		id: "v3",
		examId: "vact-logic",
		order: 3,
		content: "Bảng: Toán 8, Lý 7, Hóa 9. Điểm TB hệ số 2-1-1 là",
		a: "8",
		b: "7,5",
		c: "8,5",
		d: "9",
		correct: "A",
		expl: "$(16+7+9)/4=8$.",
		topic: "Dữ liệu",
		diff: "easy",
		score: 1
	},
	{
		id: "v4",
		examId: "vact-logic",
		order: 4,
		content: "Xác suất chọn số chẵn từ 1 đến 10 (đều) là",
		a: "$1/2$",
		b: "$2/5$",
		c: "$3/5$",
		d: "$1/5$",
		correct: "A",
		expl: "5 số chẵn / 10.",
		topic: "Xác suất",
		diff: "easy",
		score: 1
	},
	{
		id: "v5",
		examId: "vact-logic",
		order: 5,
		content: "Nếu mọi A là B, một số B là C. Kết luận chắc chắn:",
		a: "Mọi A là C",
		b: "Một số A là C",
		c: "Không A nào là C",
		d: "Chưa suy ra A liên quan C",
		correct: "D",
		expl: "Phần B là C có thể không giao A.",
		topic: "Logic",
		diff: "medium",
		score: 1.5
	},
	{
		id: "v6",
		examId: "vact-logic",
		order: 6,
		content: "Lãi suất 10%/năm, gửi 1 triệu. Sau 2 năm lãi kép được",
		a: "1.200.000",
		b: "1.210.000",
		c: "1.100.000",
		d: "1.220.000",
		correct: "B",
		expl: "$1\\times 1,1^2=1,21$ triệu.",
		topic: "Lãi suất",
		diff: "medium",
		score: 1.5
	},
	{
		id: "v7",
		examId: "vact-logic",
		order: 7,
		content: "Một lớp 30 em, 18 học Toán, 12 học Lý, 8 học cả hai. Số em không học môn nào:",
		a: "8",
		b: "10",
		c: "4",
		d: "6",
		correct: "A",
		expl: "Toán∪Lý=18+12-8=22, còn 8.",
		topic: "Tập hợp",
		diff: "medium",
		score: 1.5
	},
	{
		id: "v8",
		examId: "vact-logic",
		order: 8,
		content: "Tỷ lệ vàng xấp xỉ",
		a: "1,414",
		b: "1,618",
		c: "3,141",
		d: "2,718",
		correct: "B",
		expl: "$\\varphi=(1+\\sqrt{5})/2\\approx 1,618$.",
		topic: "Tỷ lệ",
		diff: "easy",
		score: 1
	},
	{
		id: "v9",
		examId: "vact-logic",
		order: 9,
		content: "Mệnh đề “nếu mưa thì đường ướt”. Phủ định là",
		a: "Mưa và đường khô",
		b: "Không mưa",
		c: "Đường khô",
		d: "Nếu không mưa thì đường khô",
		correct: "A",
		expl: "Phủ định $P\\Rightarrow Q$ là $P\\wedge \\neg Q$.",
		topic: "Mệnh đề",
		diff: "hard",
		score: 2
	},
	{
		id: "v10",
		examId: "vact-logic",
		order: 10,
		content: "Có 4 áo, 3 quần. Số cách chọn 1 áo 1 quần:",
		a: "7",
		b: "12",
		c: "6",
		d: "24",
		correct: "B",
		expl: "$4\\times 3=12$.",
		topic: "Tổ hợp",
		diff: "easy",
		score: 1
	},
	{
		id: "t1",
		examId: "tsa-khong-gian",
		order: 1,
		content: "Xoay hình chữ L (3 ô ngang + 1 ô xuống từ đầu trái) theo chiều kim đồng hồ. Nhánh dài nằm",
		a: "dọc, hướng xuống",
		b: "ngang, sang trái",
		c: "dọc, hướng lên",
		d: "ngang, sang phải",
		correct: "A",
		expl: "Cánh ngang 3 ô trở thành dọc xuống.",
		topic: "Xoay hình",
		diff: "medium",
		score: 1
	},
	{
		id: "t2",
		examId: "tsa-khong-gian",
		order: 2,
		content: "Lập phương 3×3×3 sơn ngoài rồi cắt thành 27 viên. Số viên 0 mặt sơn:",
		a: "1",
		b: "0",
		c: "8",
		d: "6",
		correct: "A",
		expl: "Viên tâm $(3-2)^3=1$.",
		topic: "Sơn khối",
		diff: "medium",
		score: 1
	},
	{
		id: "t3",
		examId: "tsa-khong-gian",
		order: 3,
		content: "Gấp giấy vuông đôi theo đường chéo. Số lớp tại tâm là",
		a: "1",
		b: "2",
		c: "3",
		d: "4",
		correct: "B",
		expl: "Gấp một lần → 2 lớp.",
		topic: "Gấp giấy",
		diff: "easy",
		score: 1
	},
	{
		id: "t4",
		examId: "tsa-khong-gian",
		order: 4,
		content: "Hình chiếu đứng của hình nón đứng (đế nằm bàn) là",
		a: "tam giác cân",
		b: "hình tròn",
		c: "hình chữ nhật",
		d: "elip",
		correct: "A",
		expl: "Nhìn ngang thấy tam giác cân.",
		topic: "Hình chiếu",
		diff: "easy",
		score: 1
	},
	{
		id: "t5",
		examId: "tsa-khong-gian",
		order: 5,
		content: "Thiết diện qua trục của hình trụ tròn xoay là",
		a: "hình tròn",
		b: "hình chữ nhật",
		c: "elip",
		d: "tam giác",
		correct: "B",
		expl: "Mặt phẳng qua trục cắt thành chữ nhật.",
		topic: "Thiết diện",
		diff: "medium",
		score: 1.5
	},
	{
		id: "t6",
		examId: "tsa-khong-gian",
		order: 6,
		content: "Khối lập phương cạnh a. Độ dài đường chéo không gian là",
		a: "$a\\sqrt{2}$",
		b: "$a\\sqrt{3}$",
		c: "$2a$",
		d: "$a\\sqrt{6}$",
		correct: "B",
		expl: "$\\sqrt{a^2+a^2+a^2}=a\\sqrt{3}$.",
		topic: "Khối đa diện",
		diff: "easy",
		score: 1
	},
	{
		id: "t7",
		examId: "tsa-khong-gian",
		order: 7,
		content: "Một điểm nhìn 12 cạnh lập phương. Số cạnh bị khuất tối đa là",
		a: "3",
		b: "4",
		c: "5",
		d: "6",
		correct: "A",
		expl: "Nhìn góc: thấy 3 mặt, 9 cạnh; khuất 3.",
		topic: "Hình học",
		diff: "hard",
		score: 2
	},
	{
		id: "t8",
		examId: "tsa-khong-gian",
		order: 8,
		content: "Tịnh tiến vectơ $\\vec{v}=(1,2)$ điểm $(0,0)$ đến",
		a: "$(1,2)$",
		b: "$(2,1)$",
		c: "$(0,2)$",
		d: "$(1,0)$",
		correct: "A",
		expl: "Cộng tọa độ vectơ.",
		topic: "Vectơ",
		diff: "easy",
		score: 1
	},
	{
		id: "t9",
		examId: "tsa-khong-gian",
		order: 9,
		content: "Hai vectơ vuông góc khi tích vô hướng",
		a: "bằng 1",
		b: "bằng 0",
		c: "âm",
		d: "bằng độ dài",
		correct: "B",
		expl: "$\\vec{u}\\cdot\\vec{v}=0$.",
		topic: "Tích vô hướng",
		diff: "easy",
		score: 1
	},
	{
		id: "t10",
		examId: "tsa-khong-gian",
		order: 10,
		content: "Mặt cầu tâm O bán kính 5. Điểm $(3,4,0)$ so với mặt cầu",
		a: "trong",
		b: "trên mặt",
		c: "ngoài",
		d: "là tâm",
		correct: "B",
		expl: "$3^2+4^2=25=R^2$.",
		topic: "Mặt cầu",
		diff: "medium",
		score: 1.5
	},
	{
		id: "p1",
		examId: "pvp-blitz",
		order: 1,
		content: "$2^{5}$ bằng",
		a: "10",
		b: "16",
		c: "32",
		d: "64",
		correct: "C",
		expl: "2×2×2×2×2=32.",
		topic: "Mũ",
		diff: "easy",
		score: 1
	},
	{
		id: "p2",
		examId: "pvp-blitz",
		order: 2,
		content: "Nghiệm của $x^2-5x+6=0$ là",
		a: "2 và 3",
		b: "1 và 6",
		c: "-2 và -3",
		d: "0 và 5",
		correct: "A",
		expl: "$(x-2)(x-3)=0$.",
		topic: "Phương trình",
		diff: "easy",
		score: 1
	},
	{
		id: "p3",
		examId: "pvp-blitz",
		order: 3,
		content: "Chu vi hình tròn bán kính 7 (lấy $\\pi=22/7$) là",
		a: "22",
		b: "44",
		c: "154",
		d: "49",
		correct: "B",
		expl: "$2\\pi r=2\\times 22=44$.",
		topic: "Chu vi",
		diff: "easy",
		score: 1
	},
	{
		id: "p4",
		examId: "pvp-blitz",
		order: 4,
		content: "Cấp số cộng 3, 7, 11,… số hạng thứ 10 là",
		a: "39",
		b: "43",
		c: "35",
		d: "40",
		correct: "A",
		expl: "$a_n=3+9\\times 4=39$.",
		topic: "Cấp số",
		diff: "medium",
		score: 1
	},
	{
		id: "p5",
		examId: "pvp-blitz",
		order: 5,
		content: "$\\sqrt{50}$ rút gọn",
		a: "$5\\sqrt{2}$",
		b: "$25\\sqrt{2}$",
		c: "$2\\sqrt{5}$",
		d: "$10\\sqrt{5}$",
		correct: "A",
		expl: "$\\sqrt{25\\times 2}=5\\sqrt{2}$.",
		topic: "Căn",
		diff: "easy",
		score: 1
	},
	{
		id: "p6",
		examId: "pvp-blitz",
		order: 6,
		content: "Đạo hàm $e^{2x}$ là",
		a: "$e^{2x}$",
		b: "$2e^{2x}$",
		c: "$e^{x}$",
		d: "$2e^{x}$",
		correct: "B",
		expl: "Nhân đạo hàm trong.",
		topic: "Đạo hàm",
		diff: "medium",
		score: 1
	},
	{
		id: "p7",
		examId: "pvp-blitz",
		order: 7,
		content: "Modulo: $17 \\bmod 5$ bằng",
		a: "2",
		b: "3",
		c: "1",
		d: "0",
		correct: "A",
		expl: "15+2.",
		topic: "Modulo",
		diff: "easy",
		score: 1
	},
	{
		id: "p8",
		examId: "pvp-blitz",
		order: 8,
		content: "Tiệm cận ngang của $y=\\dfrac{2x+1}{x-1}$ là",
		a: "$y=2$",
		b: "$y=1$",
		c: "$x=1$",
		d: "$y=0$",
		correct: "A",
		expl: "Bậc ngang, hệ số 2/1.",
		topic: "Tiệm cận",
		diff: "medium",
		score: 1
	}
];
var seeded = false;
async function ensureSeed() {
	if (seeded) return;
	const sql = await getSql();
	const existing = await sql.query("select count(*)::int as c from exams");
	if (Number(existing[0]?.c) > 0) {
		seeded = true;
		return;
	}
	for (const e of EXAMS) {
		const n = Qs.filter((q) => q.examId === e.id).length;
		await sql.query(`insert into exams (id, title, exam_type, duration_seconds, total_questions, description, author_name, source_label)
       values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict (id) do nothing`, [
			e.id,
			e.title,
			e.type,
			e.duration,
			n,
			e.desc,
			e.author,
			e.source
		]);
	}
	for (const q of Qs) await sql.query(`insert into questions
        (id, exam_id, order_index, content, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty, score)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) on conflict (id) do nothing`, [
		q.id,
		q.examId,
		q.order,
		q.content,
		q.a,
		q.b,
		q.c,
		q.d,
		q.correct,
		q.expl,
		q.topic,
		q.diff,
		q.score
	]);
	seeded = true;
}
async function insertShuffledExam(sql, spec) {
	await ensureSeed();
	const params = [Math.min(10, Math.max(6, spec.count || 8))];
	let where = "exam_id <> 'forged-placeholder'";
	if (spec.topic) {
		params.push(spec.topic);
		where += ` and topic = $${params.length}`;
	}
	if (spec.difficulty) {
		params.push(spec.difficulty);
		where += ` and difficulty = $${params.length}`;
	}
	const pool = await sql.query(`select id, content, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty, score
     from questions where ${where} order by random() limit $1`, params);
	const id = `shuffle-${crypto.randomUUID()}`;
	const title = spec.title ? spec.title : spec.topic ? `Xào bài · ${spec.topic}` : "Xào bài Lôi Đài";
	const source = spec.source ?? "Xào bài";
	await sql.query(`insert into exams (id, title, exam_type, duration_seconds, total_questions, description, author_name, source_label, is_public, created_by)
     values ($1,$2,'PVP',480,$3,'Bốc ngẫu nhiên từ kho thầy cô.',$5,$6, false, $4)`, [
		id,
		title,
		pool.length,
		spec.createdBy,
		spec.source ? spec.source : "Lôi Đài",
		source
	]);
	for (let i = 0; i < pool.length; i++) {
		const q = pool[i];
		await sql.query(`insert into questions
        (id, exam_id, order_index, content, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty, score)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, [
			`${id}-${i}`,
			id,
			i + 1,
			q.content,
			q.option_a,
			q.option_b,
			q.option_c,
			q.option_d,
			q.correct_answer,
			q.explanation,
			q.topic,
			q.difficulty,
			Number(q.score)
		]);
	}
	return id;
}
//#endregion
export { insertShuffledExam as n, ensureSeed as t };
