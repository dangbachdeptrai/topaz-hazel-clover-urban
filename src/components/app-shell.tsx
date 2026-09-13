import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AuthSlot } from "@/components/auth-slot";
import { SpiritField } from "@/components/spirit-field";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/exams" as const, label: "Kho Đề" },
  { to: "/pvp" as const, label: "Lôi Đài" },
  { to: "/survival" as const, label: "Bí Cảnh" },
  { to: "/tower" as const, label: "Thiên Tháp" },
  { to: "/guilds" as const, label: "Tông Môn" },
  { to: "/shop" as const, label: "Chợ" },
  { to: "/forge" as const, label: "Luyện Đan" },
  { to: "/tutor" as const, label: "Linh Sư" },
  { to: "/documents" as const, label: "Tàng Thư" },
];

export function AppShell({
  children,
  bare = false,
}: {
  children: ReactNode;
  bare?: boolean;
}) {
  return (
    <div className="relative min-h-dvh bg-bg text-fg">
      <SpiritField />
      <header className="relative z-20 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-[10px] border border-primary/30 bg-primary/15 font-display text-lg text-primary">
              ∑
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-semibold">Linh Toán Các</span>
              <span className="hidden text-[10px] uppercase tracking-[0.16em] text-gold sm:block">
                ToánMaster
              </span>
            </span>
          </Link>
          {!bare && (
            <nav className="ml-4 hidden items-center gap-1 md:flex">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="rounded-[10px] px-2.5 py-2 text-xs text-muted hover:bg-surface hover:text-fg lg:px-3 lg:text-sm"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          )}
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <AuthSlot />
          </div>
        </div>
        {!bare && (
          <nav className="flex gap-1 overflow-x-auto border-t border-border px-3 py-1 md:hidden">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="shrink-0 rounded-[10px] px-3 py-2 text-xs text-muted"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <div className={cn("relative z-10", bare && "min-h-[calc(100dvh-4rem)]")}>{children}</div>
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}
