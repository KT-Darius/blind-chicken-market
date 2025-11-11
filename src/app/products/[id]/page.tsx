"use client";

import { useState, use } from "react";
import Link from "next/link";
import type { Product } from "@/types";
import productsData from "@/mocks/products.json";

import { ProductImage } from "@/components/product/ProductImage";
import { ProductInfo } from "@/components/product/ProductInfo";
import { BidActions } from "@/components/product/BidActions";
import { ProductDescription } from "@/components/product/ProductDescription";
import { BidHistory } from "@/components/product/BidHistory";

export default function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // products.json에서 해당 상품 찾기
  const foundProduct = productsData.find((p) => p.id === parseInt(id));

  // 기본값 설정
  const product: Product | null = foundProduct
    ? {
        ...foundProduct,
        description: foundProduct.description || "상품 설명이 없습니다.",
        minBid:
          (foundProduct as Product).minBid || foundProduct.currentBid + 10000,
        seller: foundProduct.seller || "익명 판매자",
        condition: foundProduct.condition || "미개봉",
        category: foundProduct.category || "기타",
        bidHistory: (foundProduct as Product).bidHistory || [
          {
            bidder: "사용자 #1928",
            amount: foundProduct.currentBid,
            time: "5분 전",
          },
        ],
      }
    : null;

  const [bidAmount, setBidAmount] = useState(
    product?.minBid?.toString() || "0",
  );
  const [showBidForm, setShowBidForm] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  const handlePlaceBid = () => {
    alert(`₩${bidAmount}로 입찰되었습니다!`);
    setShowBidForm(false);
  };

  // 상품을 찾지 못한 경우
  if (!product) {
    return (
      <main className="bg-background min-h-screen py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-foreground mb-4 text-3xl font-bold">
              상품을 찾을 수 없습니다
            </h1>
            <Link href="/" className="text-primary hover:underline">
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background min-h-screen py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-3">
          {/* Product Image */}
          <div className="lg:col-span-2">
            <ProductImage image={product.image} title={product.title} />
          </div>

          {/* Bidding Panel */}
          <div className="space-y-6">
            <ProductInfo
              title={product.title}
              seller={product.seller!}
              condition={product.condition!}
              currentBid={product.currentBid}
              bids={product.bids}
              timeLeft={product.timeLeft}
              category={product.category!}
              minBid={product.minBid!}
            />

            <BidActions
              minBid={product.minBid!}
              bidAmount={bidAmount}
              setBidAmount={setBidAmount}
              showBidForm={showBidForm}
              setShowBidForm={setShowBidForm}
              isWatchlisted={isWatchlisted}
              setIsWatchlisted={setIsWatchlisted}
              handlePlaceBid={handlePlaceBid}
            />
          </div>
        </div>

        {/* Description & Bid History */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-3">
          <ProductDescription description={product.description!} />
          <BidHistory history={product.bidHistory!} />
        </div>
        <br />
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
