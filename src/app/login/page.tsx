"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-in`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include", // 쿠키 기반 인증 시 필요
        },
      );

      if (!res.ok) {
        throw new Error("로그인 실패");
      }

      // JWT를 JSON으로 받는 경우 (ex: { accessToken: "...", refreshToken: "..." })
      const data = await res.json();

      // accessToken을 localStorage에 저장 (HttpOnly 쿠키 사용 시 생략)
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // 로그인 성공 후 홈으로 이동
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-foreground text-3xl font-bold">로그인</h1>
          <p className="text-muted-foreground text-sm">
            블라인드 치킨 마켓에 돌아오셨습니다
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border-destructive/30 flex items-start gap-3 rounded-lg border p-4">
            <AlertCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@example.com"
              className="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-primary w-full rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:outline-none"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-primary w-full rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:outline-none"
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        {/* Footer */}
        <div className="space-y-2 text-center">
          <p className="text-muted-foreground text-sm">
            계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="text-primary font-medium hover:underline"
            >
              회원가입
            </Link>
          </p>
          <Link
            href="#"
            className="text-primary block text-sm font-medium hover:underline"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </div>
      </div>
    </main>
  );
}
