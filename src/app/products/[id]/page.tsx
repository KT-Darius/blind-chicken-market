"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/hooks/user/useAuth";
import ProductDetailSkeleton from "@/components/product/ProductDetailSkeleton";

import { PRODUCT_CATEGORIES, PRODUCT_STATUS } from "@/lib/constants";

import SockJs from "sockjs-client";
import { Client } from "@stomp/stompjs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const clientRef = useRef<Client | null>(null);
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [showBidForm, setShowBidForm] = useState(false);
  const [productId, setProductId] = useState<string>("");
  const [priceKey, setPriceKey] = useState(0);
  const [showAllBids, setShowAllBids] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await Promise.resolve(params);
      setProductId(resolvedParams.id);
    };

    initializeParams();

    return () => {
      clientRef.current?.deactivate();
      console.log("WebSocket disconnected");
    };
  }, [params]);

  useEffect(() => {
    if (!productId) return;

    const client = new Client({
      webSocketFactory: () => new SockJs(`${API_BASE_URL}/connect`),
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    clientRef.current = client;

    clientRef.current.onConnect = () => {
      console.log("WebSocket connected");

      clientRef.current?.subscribe(
        `/topic/products/${productId}/product-bids`,
        (msg) => {
          const newBid = JSON.parse(msg.body);

          setProduct((prev) => {
            if (!prev) return prev;

            const updatedProduct = { ...prev };
            updatedProduct.bidPrice = newBid.price;
            updatedProduct.bidCount += 1;

            // 입찰 기록에 새 입찰 추가
            if (updatedProduct.productBids) {
              updatedProduct.productBids = [
                {
                  productBidId: Date.now(),
                  price: newBid.price,
                  bidTime: new Date().toISOString(),
                  bidderNickname: newBid.bidderNickname || "익명",
                },
                ...updatedProduct.productBids,
              ];
            }

            return updatedProduct;
          });

          // 입찰가 입력값을 새로운 최소 입찰가로 업데이트
          const minIncrement = getMinBidIncrement(newBid.price);
          setBidAmount((newBid.price + minIncrement).toString());

          // 가격 애니메이션 트리거
          setPriceKey((prev) => prev + 1);
        },
      );
    };

    clientRef.current.activate();

    return () => {
      clientRef.current?.deactivate();
      console.log("WebSocket disconnected");
    };
  }, [productId]);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<Product>(
          `${API_BASE_URL}/api/products/${productId}`,
        );
        setProduct(response.data);
        // 다음 최소 입찰가 설정 (현재가 + 최소 입찰 단위)
        const minIncrement = getMinBidIncrement(response.data.bidPrice);
        setBidAmount((response.data.bidPrice + minIncrement).toString());
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

  // 경매 시간 정보 계산 (남은 시간 및 종료 여부)
  const getTimeDiff = () => {
    if (!product) return 0;
    const now = new Date();
    const endDate = new Date(product.bidEndDate);
    return endDate.getTime() - now.getTime();
  };

  const calculateTimeLeft = () => {
    const diffTime = getTimeDiff();
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

  const isAuctionEnded = () => {
    return getTimeDiff() < 0;
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

  // 금액 구간별 최소 입찰 단위 계산
  const getMinBidIncrement = (currentPrice: number) => {
    const bidIncrements = [
      { threshold: 100000, increment: 1000 }, // 10만원 미만: 1천원
      { threshold: 1000000, increment: 5000 }, // 100만원 미만: 5천원
      { threshold: 5000000, increment: 10000 }, // 500만원 미만: 1만원
      { threshold: 10000000, increment: 50000 }, // 1천만원 미만: 5만원
      { threshold: 50000000, increment: 100000 }, // 5천만원 미만: 10만원
      { threshold: 100000000, increment: 500000 }, // 1억원 미만: 50만원
      { threshold: Infinity, increment: 1000000 }, // 1억원 이상: 100만원
    ];

    const tier = bidIncrements.find(
      ({ threshold }) => currentPrice < threshold,
    );
    return tier ? tier.increment : 1000000;
  };

  const handlePlaceBid = () => {
    if (!bidAmount || isNaN(Number(bidAmount))) return;

    const bidValue = Number(bidAmount);
    const minIncrement = product ? getMinBidIncrement(product.bidPrice) : 1000;
    const minBidValue = product ? product.bidPrice + minIncrement : 0;

    // 최소 입찰가 검증
    if (bidValue < minBidValue) {
      setBidError(
        `최소 입찰가는 ₩${minBidValue.toLocaleString()}입니다. (최소 입찰 단위: ₩${minIncrement.toLocaleString()})`,
      );
      return;
    }

    setBidError(null);

    clientRef.current?.publish({
      destination: `/publish/products/${productId}/product-bids`,
      body: JSON.stringify({
        price: bidValue,
        email: user?.email,
      }),
    });

    setShowBidForm(false);
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <main className="bg-background min-h-screen py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
          <p className="text-foreground text-center text-xl">
            {error || "상품을 찾을 수 없습니다."}
          </p>
        </div>
      </main>
    );
  }

  const minBidIncrement = getMinBidIncrement(product.bidPrice);
  const minBid = product.bidPrice + minBidIncrement;

  return (
    <main className="bg-background min-h-screen py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
        >
          ← 홈으로 돌아가기
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
              <motion.p
                key={priceKey}
                className="text-foreground text-4xl font-bold"
                initial={{ scale: 1, color: "inherit" }}
                animate={{
                  scale: [1, 1.1, 1],
                  color: ["inherit", "#22c55e", "inherit"],
                }}
                transition={{ duration: 0.3 }}
              >
                ₩{product.bidPrice.toLocaleString()}
              </motion.p>
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
                  disabled={
                    user?.email === product.user.email || isAuctionEnded()
                  }
                >
                  {user?.email === product.user.email
                    ? "본인 상품입니다"
                    : isAuctionEnded()
                      ? "경매 종료"
                      : "입찰하기"}
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
                    onChange={(e) => {
                      setBidAmount(e.target.value);
                      setBidError(null);
                    }}
                    className="bg-background border-border text-foreground focus:ring-primary placeholder:text-muted-foreground mt-2 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                    min={minBid}
                  />
                  {bidError && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {bidError}
                    </p>
                  )}
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

            {/* Bid History */}
            <div className="border-border space-y-4 border-t pt-6">
              <h3 className="text-foreground text-lg font-bold">입찰 기록</h3>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {product.productBids && product.productBids.length > 0 ? (
                    product.productBids
                      .sort(
                        (a, b) =>
                          new Date(b.bidTime).getTime() -
                          new Date(a.bidTime).getTime(),
                      )
                      .slice(0, showAllBids ? product.productBids.length : 1)
                      .map((bid, index) => (
                        <motion.div
                          key={bid.productBidId}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.5 }}
                          className={`bg-muted border-border flex items-center justify-between rounded-lg border p-3 text-sm ${
                            index === 0 ? "border-green-300 bg-green-50" : ""
                          }`}
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
                        </motion.div>
                      ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      아직 입찰 기록이 없습니다.
                    </p>
                  )}
                </AnimatePresence>
                {product.productBids && product.productBids.length > 1 && (
                  <Button
                    onClick={() => setShowAllBids(!showAllBids)}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  >
                    {showAllBids
                      ? "접기"
                      : `더보기 (${product.productBids.length - 1}개)`}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:gap-12">
          <div className="space-y-4">
            <h2 className="text-foreground text-2xl font-bold">상세 설명</h2>
            <p className="text-foreground leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
