import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Skull } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CultivationPanel } from "@/components/features/cultivation-panel";
import { MatchmakingSearch } from "@/components/features/matchmaking-search";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { BR_CAPACITY } from "@/lib/catalog";
import { getMyCultivation } from "@/lib/server/cultivation";
import { joinBrQueue, leaveBrQueue, pollBrQueue } from "@/lib/server/survival";
import type { CultivationProfile } from "@/lib/types";

export const Route = createFileRoute("/survival/")({ component: SurvivalLobby });

function SurvivalLobby() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [cultivation, setCultivation] = useState<CultivationProfile | null>(null);
  const [status, setStatus] = useState<"idle" | "queuing">("idle");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const name = user?.displayName ?? user?.primaryEmail ?? "Đạo hữu";

  useEffect(() => {
    if (!user) return;
    getMyCultivation({ data: { displayName: name } })
      .then(setCultivation)
      .catch(() => setCultivation(null));
  }, [user, name]);

  useEffect(() => {
    if (status !== "queuing") return;
    const t = window.setInterval(() => {
      pollBrQueue()
        .then((res) => {
          if (res.status === "matched" && res.room) {
            void navigate({ to: "/survival/$roomId", params: { roomId: res.room.id } });
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Ghép trận lỗi");
        });

    }, 1000);
    return () => window.clearInterval(t);
  }, [status, navigate]);

  if (!isPending && !user) return <RedirectToSignIn />;

  async function queue() {
    setError(null);
    setBusy(true);
    try {
      const res = await joinBrQueue({ data: { displayName: name } });
      if (res.status === "matched" && res.room) {
        await navigate({ to: "/survival/$roomId", params: { roomId: res.room.id } });
      } else setStatus("queuing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không vào Bí Cảnh được");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Bí Cảnh Sinh Tồn</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Battle Royale</h1>
        <p className="mt-2 text-muted">
          {BR_CAPACITY} đạo hữu. Sai một câu là rơi. Người cuối cùng đứng vững nhận Linh Thạch.
        </p>
        <div className="mt-6">
          {cultivation ? (
            <CultivationPanel profile={cultivation} compact />
          ) : (
            <Skeleton className="h-24 rounded-[20px]" />
          )}
        </div>
        <div className="jade-frame mt-6 rounded-[28px] p-6">
          {status === "idle" && (
            <div className="space-y-4">
              <ul className="space-y-2 text-sm text-muted">
                <li>Mỗi vòng một câu · 18 giây.</li>
                <li>Đáp án sai hoặc hết giờ = loại.</li>
                <li>Hạng 1 nhận Tu Vi và Linh Thạch cao nhất.</li>
              </ul>
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button className="w-full" size="lg" onClick={() => void queue()} disabled={busy}>
                <Skull className="size-4" /> Vào Bí Cảnh
              </Button>
            </div>
          )}
          {status === "queuing" && (
            <div>
              {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
              <MatchmakingSearch
                ranked={false}
                title="Đang triệu tập đạo hữu vào Bí Cảnh"
                hint="Đủ 8 người, hoặc sau vài giây sẽ hóa thân lấp chỗ."
                onCancel={() => {
                  void leaveBrQueue();
                  setStatus("idle");
                }}
              />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
