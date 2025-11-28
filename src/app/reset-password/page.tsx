"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { apiPost, apiGet } from "@/lib/api";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // 상태 관리
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  // 1. 페이지 진입 시 토큰 유효성 검사
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsValidToken(false);
        setIsValidating(false);
        return;
      }
      try {
        await apiGet(`/api/auth/password/reset/verify?token=${token}`);
        setIsValidToken(true);
      } catch (error) {
        console.error("Token validation failed:", error);
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };
    checkToken();
  }, [token]);

  // 2. 비밀번호 변경 요청
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !isValidToken) {
      alert("유효하지 않은 접근입니다.");
      return;
    }
    if (password.length < 8) {
      alert("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }
    if (password !== confirmPassword) {
      alert("비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      await apiPost("/api/auth/password/reset", {
        resetToken: token,
        password: password,
      });
      alert("비밀번호가 성공적으로 변경되었습니다! 로그인 페이지로 이동합니다.");
      router.push("/login");
    } catch (error) {
      console.error(error);
      alert("비밀번호 변경에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 화면 렌더링 (로그인 페이지 스타일 적용)

  // A. 로딩 중
  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // B. 유효하지 않은 토큰 (에러 화면)
  // 로그인 페이지의 에러 메시지 스타일(bg-destructive/10...)을 차용하여 디자인 통일
  if (!isValidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-4 text-center">
           <div className="bg-destructive/10 border-destructive/30 flex flex-col items-center gap-2 rounded-lg border p-6">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <h1 className="text-lg font-bold text-destructive">잘못된 접근입니다</h1>
            <p className="text-sm text-destructive">
              유효하지 않은 링크입니다.<br />
              이메일에서 링크를 다시 확인해주세요.
            </p>
          </div>
          <Button 
            className="w-full rounded-lg" 
            size="lg"
            onClick={() => router.push("/login")}
          >
            로그인으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // C. 정상 폼 (로그인 페이지 구조 완벽 복사)
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header (로그인 페이지와 동일한 클래스) */}
        <div className="space-y-2 text-center">
          <h1 className="text-foreground text-3xl font-bold">비밀번호 재설정</h1>
          <p className="text-muted-foreground text-sm">
            새로운 비밀번호를 입력해 주세요.
          </p>
        </div>

        {/* Form (로그인 페이지의 input 스타일 적용) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 새 비밀번호 */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              새 비밀번호
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              // 로그인 페이지 Input 클래스 그대로 적용
              className="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-primary w-full rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:outline-none"
            />
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              새 비밀번호 확인
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              // 로그인 페이지 Input 클래스 그대로 적용 + 에러 시 테두리 처리 로직 유지
              className={`bg-background text-foreground placeholder-muted-foreground focus:ring-primary w-full rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:outline-none ${
                confirmPassword && password !== confirmPassword
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-border"
              }`}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>

          {/* 버튼 (로그인 페이지와 동일한 size="lg", rounded-lg 사용) */}
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 변경 중...
              </>
            ) : (
              "비밀번호 변경하기"
            )}
          </Button>

        </form>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}