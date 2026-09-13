import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { SpiritAvatar } from "@/components/features/spirit-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { buyFrame, equipFrame, listShop, setDaoTitle, setDisplayName } from "@/lib/server/shop";
import type { CultivationProfile, FrameId, ShopFrame } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({ component: ShopPage });

function ShopPage() {
  const { user, isPending } = useCurrentUserState();
  const [profile, setProfile] = useState<CultivationProfile | null>(null);
  const [frames, setFrames] = useState<ShopFrame[]>([]);
  const [titleCost, setTitleCost] = useState(20);
  const [nameCost, setNameCost] = useState(28);
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    listShop()
      .then((r) => {
        setProfile(r.profile);
        setFrames(r.frames);
        setTitleCost(r.titleCost);
        setNameCost(r.nameCost);
        setTitle(r.profile.daoTitle);
        setName(r.profile.displayName);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (!isPending && !user) return <RedirectToSignIn />;

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thực hiện được");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Chợ Linh Bảo</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Đổi Linh Thạch</h1>
        <p className="mt-2 text-muted">
          Khung đạo ảnh, đạo hiệu, đổi tên. Đang có{" "}
          <span className="font-mono tabular-nums text-gold">{profile?.linhThach ?? 0}</span> Linh Thạch.
        </p>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

        <h2 className="mt-8 font-display text-xl font-semibold">Khung đạo ảnh</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {frames.map((f) => (
            <div key={f.id} className="jade-frame rounded-[20px] p-5">
              <div className="flex items-center gap-3">
                <SpiritAvatar name={profile?.displayName ?? "Đạo hữu"} frame={f.id} />
                <div>
                  <p className="font-display text-lg font-semibold">{f.name}</p>
                  <p className="text-xs text-gold">{f.han}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">{f.blurb}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="font-mono text-sm tabular-nums text-gold">{f.cost} LT</p>
                {f.equipped ? (
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => void run(() => equipFrame({ data: "" }))}>
                    Gỡ
                  </Button>
                ) : f.owned ? (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => void run(() => equipFrame({ data: f.id as FrameId }))}
                  >
                    Trang bị
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="gold"
                    disabled={busy}
                    onClick={() => void run(() => buyFrame({ data: f.id }))}
                  >
                    Mua
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="jade-frame rounded-[20px] p-5">
            <h2 className="font-display text-xl font-semibold">Đạo hiệu</h2>
            <p className="mt-1 text-sm text-muted">Tốn {titleCost} Linh Thạch mỗi lần đổi.</p>
            <Label htmlFor="title" className="mt-4">
              Đạo hiệu
            </Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={24} />
            <Button
              className="mt-4 w-full"
              disabled={busy}
              onClick={() => void run(() => setDaoTitle({ data: title }))}
            >
              Khắc đạo hiệu
            </Button>
          </div>
          <div className="jade-frame rounded-[20px] p-5">
            <h2 className="font-display text-xl font-semibold">Đổi tên</h2>
            <p className="mt-1 text-sm text-muted">Tốn {nameCost} Linh Thạch.</p>
            <Label htmlFor="dname" className="mt-4">
              Tên hiển thị
            </Label>
            <Input id="dname" value={name} onChange={(e) => setName(e.target.value)} maxLength={28} />
            <Button
              className="mt-4 w-full"
              variant="outline"
              disabled={busy}
              onClick={() => void run(() => setDisplayName({ data: name }))}
            >
              Đổi tên
            </Button>
          </div>
        </div>

        <p className={cn("mt-8 text-xs text-subtle")}>
          Linh Thạch nhận từ Lôi Đài, Bí Cảnh và Thiên Tháp. Công Pháp mua ở hồ sơ tu luyện.
        </p>
      </div>
    </AppShell>
  );
}
