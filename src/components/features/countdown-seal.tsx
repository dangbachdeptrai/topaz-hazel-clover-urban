import { Swords } from "lucide-react";

export function CountdownSeal({
  seconds,
  foeName,
  title = "Lôi Đài",
}: {
  seconds: number;
  foeName?: string;
  title?: string;
}) {
  const n = Math.max(0, seconds);
  const label = n <= 0 ? "Khai đấu" : String(n);
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-bg/80 px-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{title}</p>
        {foeName ? <p className="mt-2 text-sm text-muted">{foeName}</p> : null}
        <p
          key={label}
          className="countdown-pop mt-6 font-display text-8xl font-semibold tabular-nums text-gold md:text-9xl"
        >
          {label}
        </p>
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted">
          <Swords className="size-4 shrink-0 text-gold" aria-hidden />
          <span>Giữ Băng Tâm — trận bắt đầu sau nhịp đếm</span>
        </p>
      </div>
    </div>
  );
}
