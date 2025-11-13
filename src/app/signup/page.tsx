"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/user/useAuth";
import { SignupForm } from "@/components/user/SignupForm";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { user } = useAuth();

  // 로그인 상태면 메인 페이지로 리디렉션
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  // 리디렉션 중이거나 user 상태 확인 중일 때 로딩 표시
  if (user) {
    return (
      <main className="bg-background flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </main>
    );
  }

  // user가 null일 때만 (로그아웃 상태) 회원가입 폼 표시
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* 헤더 */}
        <div className="space-y-2 text-center">
          <h1 className="text-foreground text-3xl font-bold">회원가입</h1>
          <p className="text-muted-foreground text-sm">
            블라인드 치킨 마켓에 오신 걸 환영합니다
          </p>
        </div>

        {/* 회원가입 폼 */}
        <SignupForm />

        {/* 하단 링크 */}
        <p className="text-muted-foreground text-center text-sm">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
