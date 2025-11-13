"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AlarmClock } from "lucide-react";
import { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const [displayTime, setDisplayTime] = useState(product.timeLeft);

  // Simple timer animation for demo
  useEffect(() => {
    const interval = setInterval(() => {
      // In real app, calculate from server timestamp
      setDisplayTime(product.timeLeft);
    }, 1000);
    return () => clearInterval(interval);
  }, [product.timeLeft]);

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group flex h-full cursor-pointer flex-col">
        {/* Image Container */}
        <div className="bg-muted border-border relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-lg border">
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col space-y-3">
          <h3 className="text-foreground line-clamp-2 font-semibold text-balance transition-opacity group-hover:opacity-75">
            {product.name}
          </h3>

          <div className="space-y-1">
            <p className="text-foreground text-2xl font-bold">
              \{product.currentBid.toLocaleString("ko-KR")}
            </p>
            <span className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
              <AlarmClock size={14} /> {displayTime}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
