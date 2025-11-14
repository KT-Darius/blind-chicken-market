"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { Product } from "@/types";
import axios from "axios";
import { PRODUCT_CATEGORIES, PRODUCT_STATUS } from "@/lib/constants";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [showBidForm, setShowBidForm] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [productId, setProductId] = useState<string>("");

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await Promise.resolve(params);
      setProductId(resolvedParams.id);
    };
    initializeParams();
  }, [params]);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<Product>(
          `${API_BASE_URL}/api/products/${productId}`,
        );
        setProduct(response.data);
        // 다음 최소 입찰가 설정 (현재가 + 10,000원)
        setBidAmount((response.data.bidPrice + 10000).toString());
        setError(null);
      } catch (err) {
        console.error("상품 조회 실패:", err);
        setError("상품을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // 남은 시간 계산
  const calculateTimeLeft = () => {
    if (!product) return "";
    const now = new Date();
    const endDate = new Date(product.bidEndDate);
    const diffTime = endDate.getTime() - now.getTime();

    if (diffTime < 0) return "경매 종료";

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) return `${diffDays}일 ${diffHours}시간`;
    if (diffHours > 0) return `${diffHours}시간 ${diffMinutes}분`;
    return `${diffMinutes}분`;
  };

  // 상품 상태 한글 변환
  const getProductStatus = (status: string) => {
    const statusItem = PRODUCT_STATUS.find((item) => item.value === status);
    return statusItem ? statusItem.label : status;
  };

  // 카테고리 한글 변환
  const getCategoryName = (category: string) => {
    const categoryItem = PRODUCT_CATEGORIES.find(
      (item) => item.value === category,
    );
    return categoryItem ? categoryItem.label : category;
  };

  const handlePlaceBid = () => {
    alert(`₩${bidAmount}로 입찰되었습니다!`);
    setShowBidForm(false);
  };

  if (isLoading) {
    return (
      <main className="bg-background min-h-screen py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="bg-background min-h-screen py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
          >
            ← 경매로 돌아가기
          </Link>
          <p className="text-foreground text-center text-xl">
            {error || "상품을 찾을 수 없습니다."}
          </p>
        </div>
      </main>
    );
  }

  const minBid = product.bidPrice + 10000;

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
                src={product.imageUrl || "/placeholder.svg"}
                alt={product.name}
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
                    {product.name}
                  </h1>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {product.user.nickname}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="w-fit">
                {getProductStatus(product.productStatus)}
              </Badge>
            </div>

            {/* Current Bid Section */}
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                현재 입찰가
              </p>
              <p className="text-foreground text-4xl font-bold">
                ₩{product.bidPrice.toLocaleString()}
              </p>
              <p className="text-muted-foreground text-sm">
                {product.bidCount}개 입찰 • 남은 시간 {calculateTimeLeft()}
              </p>
            </div>

            {/* Item Info Grid */}
            <div className="border-border space-y-3 border-y py-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">카테고리</span>
                <span className="text-foreground font-medium">
                  {getCategoryName(product.category)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">최소 입찰가</span>
                <span className="text-foreground font-medium">
                  ₩{minBid.toLocaleString()}
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
                    최소: ₩{minBid.toLocaleString()}
                  </p>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="bg-background border-border text-foreground focus:ring-primary placeholder:text-muted-foreground mt-2 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                    min={minBid}
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
              {product.description}
            </p>
          </div>

          {/* Bid History */}
          <div className="space-y-4">
            <h2 className="text-foreground text-2xl font-bold">입찰 기록</h2>
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {product.productBids && product.productBids.length > 0 ? (
                product.productBids
                  .sort(
                    (a, b) =>
                      new Date(b.bidTime).getTime() -
                      new Date(a.bidTime).getTime(),
                  )
                  .map((bid) => (
                    <div
                      key={bid.productBidId}
                      className="bg-muted border-border flex items-center justify-between rounded-lg border p-3 text-sm"
                    >
                      <div className="flex-1">
                        <p className="text-foreground font-semibold">
                          ₩{bid.price.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(bid.bidTime).toLocaleString("ko-KR")}
                        </p>
                      </div>
                      <span className="text-muted-foreground ml-2 text-xs">
                        {bid.bidderNickname}
                      </span>
                    </div>
                  ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  아직 입찰 기록이 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
