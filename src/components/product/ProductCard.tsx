"use client";

import Link from "next/link";
import { Product } from "@/types";
import { AlarmClock } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  // 남은 일수 계산
  const calculateDaysLeft = () => {
    const now = new Date();
    const endDate = new Date(product.bidEndDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "경매 종료";
    if (diffDays === 0) return "오늘 마감";
    return `${diffDays}일 남음`;
  };

  // 경매 종료 여부 확인
  const isExpired = () => {
    const now = new Date();
    const endDate = new Date(product.bidEndDate);
    return endDate.getTime() - now.getTime() < 0;
  };

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
            <p className="text-foreground text-2xl font-bold">
              \{product.bidPrice.toLocaleString("ko-KR")}
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
