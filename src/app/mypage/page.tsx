"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, LogOut, Edit2 } from "lucide-react";

const mockUser = {
  username: "익명 사용자 #4821",
  joinDate: "2024년 11월 가입",
  rating: 4.8,
  reviews: 127,
  wins: 23,
  active: 5,
};

const mockAuctions = [
  {
    id: 1,
    title: "판매: iPhone 13",
    status: "active",
    price: 450000,
    role: "seller",
  },
  {
    id: 2,
    title: "낙찰: 디자이너 시계",
    status: "completed",
    price: 280000,
    role: "buyer",
  },
  {
    id: 3,
    title: "판매: 빈티지 카메라",
    status: "active",
    price: 180000,
    role: "seller",
  },
  {
    id: 4,
    title: "낙찰: 게이밍 노트북",
    status: "completed",
    price: 620000,
    role: "buyer",
  },
];

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("activity");

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-foreground text-foreground" : "text-border"}`}
      />
    ));
  };

  return (
    <main className="bg-background min-h-screen py-8 md:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="border-border mb-8 border-b pb-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-foreground text-3xl font-bold md:text-4xl">
                {mockUser.username}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {mockUser.joinDate}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg bg-transparent"
              >
                <Edit2 className="h-4 w-4" />
                프로필 수정
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg bg-transparent"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {/* Rating */}
            <div className="bg-card border-border space-y-2 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                평점
              </p>
              <div className="flex items-center gap-2">
                <p className="text-foreground text-3xl font-bold">
                  {mockUser.rating}
                </p>
                <div className="flex gap-1">{renderStars(mockUser.rating)}</div>
              </div>
              <p className="text-muted-foreground text-xs">
                {mockUser.reviews}개 리뷰
              </p>
            </div>

            {/* Wins */}
            <div className="bg-card border-border space-y-2 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                낙찰
              </p>
              <p className="text-foreground text-3xl font-bold">
                {mockUser.wins}
              </p>
              <p className="text-muted-foreground text-xs">총 낙찰 상품</p>
            </div>

            {/* Active Bids */}
            <div className="bg-card border-border space-y-2 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                진행중인 입찰
              </p>
              <p className="text-foreground text-3xl font-bold">
                {mockUser.active}
              </p>
              <p className="text-muted-foreground text-xs">현재 입찰 중</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-border -mx-4 mb-8 border-b px-4">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: "activity", label: "활동" },
              { id: "selling", label: "판매중" },
              { id: "watchlist", label: "관심상품" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "text-foreground border-foreground"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {(activeTab === "activity" || activeTab === "selling") && (
          <div className="space-y-3">
            {mockAuctions
              .filter((a) =>
                activeTab === "selling" ? a.role === "seller" : true,
              )
              .map((item) => (
                <Link key={item.id} href={`/product/${item.id}`}>
                  <div className="border-border hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors">
                    <div className="flex-1">
                      <p className="text-foreground font-medium">
                        {item.title}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge
                          variant={
                            item.role === "seller" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {item.role === "seller" ? "판매" : "낙찰"}
                        </Badge>
                        <p className="text-muted-foreground text-xs">
                          {item.status === "active" ? "진행중" : "완료"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground text-lg font-bold">
                        ₩{item.price.toLocaleString()}
                      </p>
                      <p
                        className={`mt-1 text-xs font-medium ${
                          item.status === "active"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {item.status === "active" ? "진행중" : "완료"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}

        {/* Watchlist Tab */}
        {activeTab === "watchlist" && (
          <div className="py-16 text-center">
            <p className="text-muted-foreground mb-4">관심상품이 없습니다.</p>
            <Button
              asChild
              variant="outline"
              className="rounded-lg bg-transparent"
            >
              <Link href="/">둘러보기 시작</Link>
            </Button>
          </div>
        )}

        <br />
        {/* Back Link */}
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
        >
          ← 홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
