"use client";

import Link from "next/link";
import { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="group flex h-full cursor-pointer flex-col">
        {/* Image Container */}
        <div className="bg-muted border-border relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-lg border">
          <img
            src={product.imageUrl || "/placeholder.svg"}
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
              \{product.bidPrice.toLocaleString("ko-KR")}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
