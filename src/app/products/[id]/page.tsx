"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";

const mockProduct = {
  id: 1,
  title: "빈티지 가죽 재킷",
  image: "/vintage-leather-jacket.png",
  description:
    "완벽한 상태의 정품 빈티지 가죽 재킷입니다. 모든 옷장에 완벽하게 어울립니다. 최소한의 착용감, 잘 관리되었습니다. 이 아이템은 모든 옷을 돋보이게 할 수 있는 시간이 검증된 클래식입니다.",
  currentBid: 45000,
  minBid: 50000,
  bids: 8,
  timeLeft: "2시간 34분",
  seller: "익명 판매자 #4821",
  condition: "새상품 같음",
  category: "패션",
  bidHistory: [
    { bidder: "사용자 #1928", amount: 45000, time: "5분 전" },
    { bidder: "사용자 #7234", amount: 42000, time: "15분 전" },
    { bidder: "사용자 #1928", amount: 40000, time: "1시간 전" },
  ],
};

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [bidAmount, setBidAmount] = useState(mockProduct.minBid.toString());
  const [showBidForm, setShowBidForm] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  const handlePlaceBid = () => {
    alert(`₩${bidAmount}로 입찰되었습니다!`);
    setShowBidForm(false);
  };

  return (
    <main className="bg-background min-h-screen py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
        >
          ← 경매로 돌아가기
        </Link>

        <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-3">
          {/* Product Image */}
          <div className="lg:col-span-2">
            <div className="bg-muted border-border flex aspect-square items-center justify-center overflow-hidden rounded-xl border shadow-sm">
              <img
                src={mockProduct.image || "/placeholder.svg"}
                alt={mockProduct.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Bidding Panel */}
          <div className="space-y-6">
            <div className="border-border space-y-3 border-b pb-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h1 className="text-foreground text-2xl font-bold text-balance md:text-3xl">
                    {mockProduct.title}
                  </h1>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {mockProduct.seller}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="w-fit">
                {mockProduct.condition}
              </Badge>
            </div>

            {/* Current Bid Section */}
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                현재 입찰가
              </p>
              <p className="text-foreground text-4xl font-bold">
                ₩{mockProduct.currentBid.toLocaleString()}
              </p>
              <p className="text-muted-foreground text-sm">
                {mockProduct.bids}개 입찰 • 남은 시간 {mockProduct.timeLeft}
              </p>
            </div>

            {/* Item Info Grid */}
            <div className="border-border space-y-3 border-y py-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">카테고리</span>
                <span className="text-foreground font-medium">
                  {mockProduct.category}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">최소 입찰가</span>
                <span className="text-foreground font-medium">
                  ₩{mockProduct.minBid.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Bid Input */}
            {!showBidForm ? (
              <div className="space-y-3">
                <Button
                  onClick={() => setShowBidForm(true)}
                  size="lg"
                  className="w-full rounded-lg"
                >
                  입찰하기
                </Button>
                <Button
                  onClick={() => setIsWatchlisted(!isWatchlisted)}
                  variant="outline"
                  size="lg"
                  className="w-full rounded-lg"
                >
                  <Heart
                    className={`mr-2 h-4 w-4 ${isWatchlisted ? "fill-current" : ""}`}
                  />
                  {isWatchlisted ? "관심상품 등록됨" : "관심상품 등록"}
                </Button>
              </div>
            ) : (
              <div className="border-border bg-card space-y-4 rounded-lg border p-4">
                <div>
                  <label className="text-foreground text-sm font-medium">
                    입찰가
                  </label>
                  <p className="text-muted-foreground mt-1 text-xs">
                    최소: ₩{mockProduct.minBid.toLocaleString()}
                  </p>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="bg-background border-border text-foreground focus:ring-primary placeholder:text-muted-foreground mt-2 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                    min={mockProduct.minBid}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePlaceBid}
                    size="sm"
                    className="flex-1 rounded-lg"
                  >
                    입찰 확정
                  </Button>
                  <Button
                    onClick={() => setShowBidForm(false)}
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg"
                  >
                    취소
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description & Bid History */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-3">
          {/* Description */}
          <div className="space-y-4 lg:col-span-2">
            <h2 className="text-foreground text-2xl font-bold">상세 설명</h2>
            <p className="text-foreground leading-relaxed">
              {mockProduct.description}
            </p>
          </div>

          {/* Bid History */}
          <div className="space-y-4">
            <h2 className="text-foreground text-2xl font-bold">입찰 기록</h2>
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {mockProduct.bidHistory.map((bid, idx) => (
                <div
                  key={idx}
                  className="bg-muted border-border flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div className="flex-1">
                    <p className="text-foreground font-semibold">
                      ₩{bid.amount.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground text-xs">{bid.time}</p>
                  </div>
                  <span className="text-muted-foreground ml-2 text-xs">
                    {bid.bidder}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
