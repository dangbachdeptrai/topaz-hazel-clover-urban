import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shuffle, Swords, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CultivationPanel } from "@/components/features/cultivation-panel";
import { MatchmakingSearch } from "@/components/features/matchmaking-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyCultivation } from "@/lib/server/cultivation";
import { listExams, listQuestionTopics } from "@/lib/server/exams";
import { createPvpRoom, joinPvpQueue, joinPvpRoom, leavePvpQueue, pollPvpQueue } from "@/lib/server/pvp";
import type { CultivationProfile, Difficulty, Exam } from "@/lib/types";

export const Route = createFileRoute("/pvp/")({ component: PvpLobby });

function PvpLobby() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [cultivation, setCultivation] = useState<CultivationProfile | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [examId, setExamId] = useState("pvp-blitz");
  const [shuffle, setShuffle] = useState(true);
  const [ranked, setRanked] = useState(true);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [questionCount, setQuestionCount] = useState(8);
  const [status, setStatus] = useState<"idle" | "queuing">("idle");
  const [code, setCode] = useState("");
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
    listExams()
      .then((list) => {
        setExams(list);
        const blitz = list.find((e) => e.id === "pvp-blitz");
        if (blitz) setExamId(blitz.id);
      })
      .catch(() => undefined);
    listQuestionTopics().then(setTopics).catch(() => setTopics([]));
  }, []);

  useEffect(() => {
    if (status !== "queuing") return;
    const t = window.setInterval(() => {
      pollPvpQueue()
        .then((res) => {
          if (res.status === "matched" && res.match) {
            void navigate({ to: "/pvp/$matchId", params: { matchId: res.match.id } });
          }
        })
        .catch(() => undefined);
    }, 1200);
    return () => window.clearInterval(t);
  }, [status, navigate]);

  if (!isPending && !user) return <RedirectToSignIn />;

  const spec = {
    examId,
    displayName: name,
    shuffle,
    topic,
    difficulty,
    questionCount,
    ranked,
  };

  async function queue() {
    setError(null);
    setBusy(true);
    try {
      const res = await joinPvpQueue({ data: spec });
      if (res.status === "matched" && res.match) {
        await navigate({ to: "/pvp/$matchId", params: { matchId: res.match.id } });
      } else setStatus("queuing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không vào hàng đợi được");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Lôi Đài Quyết Đấu</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">1 đối 1</h1>
        <p className="mt-2 text-muted">Ranked ghép Elo. Băng Tâm Quyết cộng thêm thời gian trận.</p>
        <div className="mt-6">
          {cultivation ? <CultivationPanel profile={cultivation} compact /> : <Skeleton className="h-24 rounded-[20px]" />}
        </div>
        <div className="jade-frame mt-6 rounded-[28px] p-6">
          {status === "idle" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant={ranked ? "gold" : "outline"} className="w-full" onClick={() => setRanked(true)}>
                  Ranked
                </Button>
                <Button variant={!ranked ? "default" : "outline"} className="w-full" onClick={() => setRanked(false)}>
                  Giao hữu
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant={shuffle ? "default" : "outline"} className="w-full" onClick={() => setShuffle(true)}>
                  <Shuffle className="size-4" /> Xào bài
                </Button>
                <Button variant={!shuffle ? "default" : "outline"} className="w-full" onClick={() => setShuffle(false)}>
                  Đề cố định
                </Button>
              </div>
              {shuffle ? (
                <>
                  <div>
                    <Label htmlFor="topic">Chủ đề</Label>
                    <select
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="flex h-11 w-full rounded-[12px] border border-border bg-bg-elevated px-3 text-sm"
                    >
                      <option value="">Tổng hợp</option>
                      {topics.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="diff">Độ khó</Label>
                      <select
                        id="diff"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as Difficulty | "")}
                        className="flex h-11 w-full rounded-[12px] border border-border bg-bg-elevated px-3 text-sm"
                      >
                        <option value="">Mọi mức</option>
                        <option value="easy">Dễ</option>
                        <option value="medium">Trung bình</option>
                        <option value="hard">Khó</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="n">Số câu</Label>
                      <select
                        id="n"
                        value={questionCount}
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                        className="flex h-11 w-full rounded-[12px] border border-border bg-bg-elevated px-3 text-sm"
                      >
                        <option value={6}>6</option>
                        <option value={8}>8</option>
                        <option value={10}>10</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <Label htmlFor="exam">Chọn đề</Label>
                  <select
                    id="exam"
                    value={examId}
                    onChange={(e) => setExamId(e.target.value)}
                    className="flex h-11 w-full rounded-[12px] border border-border bg-bg-elevated px-3 text-sm"
                  >
                    {exams.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button className="w-full" size="lg" onClick={() => void queue()} disabled={busy}>
                <Swords className="size-4" /> Tìm đối thủ
              </Button>
              <Button
                className="w-full"
                size="lg"
                variant="outline"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const match = await createPvpRoom({ data: spec });
                    if (match) await navigate({ to: "/pvp/$matchId", params: { matchId: match.id } });
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Không tạo phòng");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Users className="size-4" /> Tạo phòng (mã mời)
              </Button>
              <div className="flex gap-2">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Mã phòng"
                  className="font-mono uppercase"
                />
                <Button
                  variant="paper"
                  disabled={busy || !code}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      const match = await joinPvpRoom({ data: { roomCode: code, displayName: name } });
                      if (match) await navigate({ to: "/pvp/$matchId", params: { matchId: match.id } });
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Không vào phòng");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Vào
                </Button>
              </div>
            </div>
          )}
          {status === "queuing" && (
            <MatchmakingSearch
              ranked={ranked}
              onCancel={() => {
                void leavePvpQueue();
                setStatus("idle");
              }}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
