"use client";

import Link from "next/link";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import products from "@/mocks/products.json";

export default function Home() {
  const productList = products;

  return (
    <main className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="border-border border-b py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <h1 className="text-foreground text-4xl font-bold tracking-tight text-balance md:text-5xl">
              Blind Chicken Market
            </h1>
            <p className="text-muted-foreground max-w-2xl text-xl leading-relaxed text-pretty">
              The Last Bidder Wins. This is Blind Chicken Market. <br />
              가장 늦게, 가장 용감하게. 블라인드 치킨 마켓에서 승리하세요.
            </p>

            <div className="flex gap-3 pt-4">
              <Button size="lg" className="rounded-lg">
                <Link href="/products/create">상품 등록</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-lg bg-transparent"
              >
                <Link href="/mypage">마이페이지</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 md:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="font-bold">Hot Items🔥</p>
            <p className="text-muted-foreground text-sm">
              Showing {productList.length} items
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
