import Link from "next/link";
import { SignupForm } from "@/components/forms/SignupForm";

export default function SignupPage() {
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
