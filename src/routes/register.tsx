import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Mật khẩu không khớp");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu tối thiểu 8 ký tự");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await authClient.signUp.email({ email, password, name });
      if (err) throw new Error(err.message);
      await navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell bare>
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md items-center px-4 py-10">
        <div className="jade-frame w-full rounded-[28px] p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Nhập môn</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">Tạo đạo cơ</h1>
          <p className="mt-2 text-sm text-muted">
            Lưu kết quả thi, đấu Lôi Đài, luyện đan và Tàng Thư riêng.
          </p>
          {error && (
            <p className="mt-4 rounded-[12px] bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <div>
              <Label htmlFor="name">Đạo hiệu</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <div>
              <Label htmlFor="confirm">Xác nhận mật khẩu</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang tạo…" : "Đăng ký"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted">
            Đã có tài khoản?{" "}
            <Link to="/login" className="font-medium text-primary">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
