import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await authClient.signIn.email({ email, password });
      if (err) throw new Error(err.message);
      await navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell bare>
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md items-center px-4 py-10">
        <div className="jade-frame w-full rounded-[28px] p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Nhập môn</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">Đăng nhập</h1>
          <p className="mt-2 text-sm text-muted">
            Google, X, hoặc email. Có thể xem Kho Đề công khai mà chưa cần tài khoản.
          </p>
          {error && (
            <p className="mt-4 rounded-[12px] bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}
          {authEnabled ? (
            <div className="mt-6 grid gap-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    signIn(p.providerId, { callbackURL: "/" }).catch((err) =>
                      setError(err instanceof Error ? err.message : "Lỗi OAuth"),
                    )
                  }
                >
                  Tiếp tục với {p.label}
                </Button>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Đăng nhập đang tắt.</p>
          )}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-bg-elevated px-2 text-subtle">hoặc email</span>
            </div>
          </div>
          <form onSubmit={onEmail} className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang vào…" : "Nhập môn"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="font-medium text-primary">
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
