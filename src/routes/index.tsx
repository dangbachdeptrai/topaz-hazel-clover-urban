import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { MathText } from "@/lib/math-text";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <p className="enter-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          VACT · THPTQG · TSA · LÔI ĐÀI
        </p>
        <h1 className="enter-2 mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.15] md:text-6xl">
          Tu luyện toán đạo
          <br />
          trong Linh Toán Các.
        </h1>
        <p className="enter-3 mt-4 max-w-xl text-muted">
          Kho đề như trận pháp, Lôi Đài 1v1, Bí Cảnh sinh tồn, Cửu Trùng Thiên Tháp,
          Tông Môn chiến, Luyện Đan Lô và Thiên Nhãn OCR bóc đề từ ảnh.
        </p>
        <div className="enter-4 mt-8 flex flex-wrap gap-3">
          <Link to="/exams">
            <Button size="lg">Vào Kho Đề</Button>
          </Link>
          <Link to="/pvp">
            <Button size="lg" variant="gold">
              Lôi Đài Quyết Đấu
            </Button>
          </Link>
          <Link to="/survival">
            <Button size="lg" variant="outline">
              Bí Cảnh
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            ["100+", "câu trong kho"],
            ["Xào bài", "mỗi trận mới"],
            ["8 người", "Bí Cảnh"],
          ].map(([k, v]) => (
            <div key={k} className="jade-frame rounded-[20px] p-5">
              <p className="font-display text-3xl font-semibold text-primary">{k}</p>
              <p className="mt-1 text-sm text-muted">{v}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="scripture-sheet rounded-[24px] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              Chính thức
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold">Trận pháp · minh họa</h2>
            <p className="mt-3 text-sm text-muted">Thời gian: 25 phút</p>
            <ol className="mt-4 space-y-2 text-sm">
              <li>
                Câu 1. Cho <MathText text="$f(x)=x^3-3x^2+2$" />. Đạo hàm bằng
              </li>
              <li className="text-muted">A. 3x² − 6x · B. 3x² − 3x · C. x² − 6x · D. 3x² − 6</li>
            </ol>
            <Link to="/exams" className="mt-6 inline-block">
              <Button>Vào ngay</Button>
            </Link>
          </div>
          <div className="grid gap-4">
            <Card title="Lôi Đài" body="Xào bài ngẫu nhiên, ranked theo Elo, 5 giây khai đấu." to="/pvp" />
            <Card title="Bí Cảnh Sinh Tồn" body="8 đạo hữu. Sai một câu là rơi. Người cuối thắng." to="/survival" />
            <Card title="Tông Môn & Chợ" body="Lập bang, cống hiến, đổi khung đạo ảnh bằng Linh Thạch." to="/guilds" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Card({
  title,
  body,
  to,
}: {
  title: string;
  body: string;
  to: "/pvp" | "/tower" | "/profile" | "/survival" | "/guilds" | "/shop";
}) {

  return (
    <Link to={to} className="jade-frame block rounded-[20px] p-5 hover:border-primary/50">
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </Link>
  );
}
