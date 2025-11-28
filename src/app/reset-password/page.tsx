"use client";

import { useState, useEffect, Suspense } from "react"; // [변경] useEffect 추가
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button"; 
import { Loader2, AlertCircle } from "lucide-react"; 
import { apiPost, apiGet } from "@/lib/api"; // [변경] apiGet 추가

// 실제 내용을 보여주는 컴포넌트
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  // 입력값들을 저장할 상자들
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // [추가] 토큰 검증 상태 관리
  const [isValidating, setIsValidating] = useState(true); // 검사 중인지
  const [isValidToken, setIsValidToken] = useState(false); // 유효한지

  // [추가] 페이지 진입 시 토큰 유효성 검사
  useEffect(() => {
    const checkToken = async () => {
      // 토큰이 없으면 즉시 실패 처리
      if (!token) {
        setIsValidToken(false);
        setIsValidating(false);
        return;
      }

      try {
        // 백엔드 검증 API 호출
        await apiGet(`/api/auth/password/reset/verify?token=${token}`);
        
        // 에러가 안 나면 유효한 토큰임
        setIsValidToken(true);
      } catch (error) {
        console.error("Token validation failed:", error);
        setIsValidToken(false);
      } finally {
        setIsValidating(false); // 검사 종료
      }
    };

    checkToken();
  }, [token]);


  // 비밀번호 변경 버튼을 눌렀을 때 실행되는 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 유효성 검사 (이미 토큰 검사는 위에서 했으므로 형식적 확인만)
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
      // 2. 백엔드에 전송 (비밀번호 변경 요청)
      await apiPost("/api/auth/password/reset", {
        resetToken: token,
        password: password,
      });

      // 3. 성공 시
      alert("비밀번호가 성공적으로 변경되었습니다! 로그인 페이지로 이동합니다.");
      router.push("/login"); 

    } catch (error) {
      console.error(error);
      alert("비밀번호 변경에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // [변경] 화면 렌더링 로직 (로딩 -> 에러 -> 정상 폼 순서)

  // 1. 검사 중일 때 (로딩 스피너)
  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
      </div>
    );
  }

  // 2. 토큰이 유효하지 않을 때 (에러 화면)
  if (!isValidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-xl font-bold text-gray-900">잘못된 접근입니다</h1>
          <p className="mt-2 text-gray-600">
            유효하지 않은 링크입니다.<br />
            이메일에서 링크를 다시 확인해주세요.
          </p>
          <Button 
            className="mt-6 w-full" 
            onClick={() => router.push("/login")}
          >
            로그인으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // 3. 정상적인 경우 (입력 폼 보여주기)
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">비밀번호 재설정</h1>
          <p className="mt-2 text-sm text-gray-600">
            새로운 비밀번호를 입력해 주세요.
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 새 비밀번호 입력 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              새 비밀번호
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* 비밀번호 확인 입력 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              새 비밀번호 확인
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 ${
                confirmPassword && password !== confirmPassword
                  ? "border-red-500 focus:ring-red-200" 
                  : "border-gray-300 focus:border-primary focus:ring-primary/20"
              }`}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full py-6 text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              "비밀번호 변경하기"
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}

// 메인 페이지 (Suspense 필수)
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}