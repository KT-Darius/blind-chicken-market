"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/hooks/user/useAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function Login() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 로그인 상태에서 이 페이지 접근 시 리디렉션
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]); // user 상태가 변경될 때마다 체크

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const loginResponse = await axios.post(
        `${API_BASE_URL}/api/auth/sign-in`,
        { email, password },
      );
      const { accessToken } = loginResponse.data;
      if (!accessToken) {
        throw new Error("로그인 응답에 accessToken이 없습니다.");
      }
      const userResponse = await axios.get(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const userData = userResponse.data;
      login(accessToken, userData);

      router.push("/");
    } catch (err) {
      console.error(err);
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 401 || err.response?.status === 404)
      ) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setError("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // user가 있거나(로그인됨) 로딩 중일 때 폼 숨기기
  if (user || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-10 w-10 animate-spin" />
      </div>
    );
  }

  // user가 null일 때 (로그아웃 상태)만 폼을 렌더링
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
              name="email"
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
              name="password"
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
