"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useAuth } from "@/hooks/user/useAuth";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout, isLoading } = useAuth();
  const isActive = (path: string) => pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/");
      setSearchQuery("");
    }
  };

  return (
    <nav className="border-border bg-background sticky top-0 z-50 border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* 로고 */}
        <Link
          href="/"
          className="text-foreground flex shrink-0 items-center gap-2 text-xl font-bold transition-opacity hover:opacity-80"
        >
          <Image src="/BCM.png" alt="BCM 로고" width={32} height={32} />
          <span className="font-logo text-xl">ㅂㅊㅁ</span>
        </Link>

        {/* 검색바 */}
        <form
          onSubmit={handleSearch}
          className="hidden max-w-md flex-1 items-center gap-2 md:flex"
        >
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <input
              type="text"
              placeholder="제목 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border bg-background text-foreground placeholder-muted-foreground focus:ring-foreground w-full rounded-lg border py-2 pr-4 pl-10 transition-all focus:ring-2 focus:outline-none"
            />
          </div>
          <Button type="submit" className="rounded-lg px-4">
            검색
          </Button>
        </form>

        {/* 로그인/회원가입 영역 */}
        <div className="flex shrink-0 items-center gap-3">
          {/* isLoading: true이면 아무것도 렌더링하지 않음 (깜빡임 방지) */}
          {isLoading ? (
            <div className="bg-muted h-9 w-24 animate-pulse rounded-lg" /> // 스켈레톤 UI
          ) : user ? (
            // --- 로그인 된 상태 ---
            <>
              <span className="text-foreground hidden text-sm font-medium sm:block">
                {user.nickname}님
              </span>
              <Link
                href="/mypage"
                className={`text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive("/mypage")
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                마이페이지
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="rounded-lg"
              >
                로그아웃
              </Button>
            </>
          ) : (
            // --- 로그아웃 된 상태 ---
            <>
              <Link
                href="/login"
                className={`text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive("/login")
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                로그인
              </Link>
              <Button size="sm" asChild className="rounded-lg">
                <Link href="/signup">회원가입</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
