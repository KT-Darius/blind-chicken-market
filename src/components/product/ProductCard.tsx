"use client";

import Link from "next/link";
import { Product } from "@/types";
import { AlarmClock } from "lucide-react";
import { formatCurrency, isAuctionExpired, getTimeRemainMs } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  // 남은 일수 계산
  const calculateDaysLeft = () => {
    const diffTime = getTimeRemainMs(product.bidEndDate);

    // 초 단위까지 비교하여 경매 종료 판단
    if (diffTime <= 0) return "경매 종료";

    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 0) {
      if (diffHours === 0) return "경매가 곧 마감됩니다";
      return `${diffHours}시간 남음`;
    }
    return `${diffDays}일 남음`;
  };

  // 경매 종료 여부 확인 (초 단위까지 비교)
  const isExpired = () => isAuctionExpired(product.bidEndDate);

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group flex h-full cursor-pointer flex-col">
        {/* Image Container */}
        <div className="bg-muted border-border relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-lg border">
          <img
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              isExpired() ? "opacity-50 grayscale" : ""
            }`}
          />
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col space-y-3">
          <h3 className="text-foreground line-clamp-2 font-semibold text-balance transition-opacity group-hover:opacity-75">
            {product.name}
          </h3>

          <div className="space-y-1">
            <p className="text-foreground text-2xl font-bold break-all">
              {formatCurrency(product.bidPrice)}
            </p>
            <span className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
              <AlarmClock size={14} /> {calculateDaysLeft()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
