"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/hooks/user/useAuth";
import { useLoginForm } from "@/hooks/user/useLoginForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Login() {
  const router = useRouter();
  const { user } = useAuth();
  const { email, password, error, isLoading, handleChange, handleSubmit } =
    useLoginForm();

  //비밀번호 재설정시
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // 로딩 중인지(true), 아닌지(false) 기억하는 상자
  const [isResetLoading, setIsResetLoading] = useState(false);

  const handleResetPassword = async () => {
    // 1. 이메일 입력 안 했으면 경고
    if (!resetEmail) {
      alert("이메일을 입력해주세요.");
      return;
    }

    setIsResetLoading(true);

    try {
      await apiPost("/api/auth/password/request-reset", {
        email: resetEmail,
      });

      alert("이메일이 성공적으로 전송되었습니다. 메일창을 확인해주세요.");

      setIsResetOpen(false);
      setResetEmail("");
    } catch (error) {
      console.error(error);
      alert("이메일 전송에 실패했습니다. 입력한 이메일을 다시 확인해주세요.");
    } finally {
      setIsResetLoading(false);
    }
  };

  // 로그인 상태에서 이 페이지 접근 시 리디렉션
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              이메일
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="your@example.com"
              autoComplete="email"
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
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
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
          <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
            {/* 버튼 역할 (누르면 모달 열림) */}
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-primary block w-full text-center text-sm font-medium hover:underline"
              >
                비밀번호를 잊으셨나요?
              </button>
            </DialogTrigger>

            {/* 모달창 내용 */}
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>비밀번호 찾기</DialogTitle>
                <DialogDescription>
                  비밀번호 재설정 링크를 확인할 이메일 주소를 입력해주세요.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your@example.com"
                  className="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-primary w-full rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:outline-none"
                />
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleResetPassword}
                  disabled={!resetEmail || isResetLoading}
                >
                  {/* 로딩 중이면 아이콘 보여주기 */}
                  {isResetLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "링크 보내기"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </main>
  );
}
