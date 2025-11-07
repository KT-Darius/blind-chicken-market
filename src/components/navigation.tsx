"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CircleUser, LogOut, Search } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="border-border bg-background sticky top-0 z-50 border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* 로고 */}
        <Link
          href="/"
          className="text-foreground shrink-0 text-xl font-bold transition-opacity hover:opacity-80"
        >
          🐔 B.C.Market
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
              placeholder="상품 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border bg-background text-foreground placeholder-muted-foreground focus:ring-foreground w-full rounded-lg border py-2 pr-4 pl-10 transition-all focus:ring-2 focus:outline-none"
            />
          </div>
          <Button type="submit" className="rounded-lg px-4">
            검색
          </Button>
        </form>

        {/* 메뉴 링크 */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/products/create"
            className={`text-sm font-medium whitespace-nowrap transition-colors ${
              isActive("/products/create")
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            상품 등록
          </Link>
          {isLoggedIn && (
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
          )}
        </div>

        {/* 로그인/회원가입 */}
        <div className="flex shrink-0 items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/mypage"
                className="hover:bg-muted text-foreground rounded-lg p-2 transition-colors"
                title="마이페이지"
              >
                <CircleUser className="h-5 w-5" />
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground rounded-lg"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
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
