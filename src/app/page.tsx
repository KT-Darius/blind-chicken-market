"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/user/useAuth";
import { ProductListResponse, Product } from "@/types";

import mockData from "@/mocks/products.json";

export default function Home() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          "http://localhost:8080/api/products?page=0&offset=10",
        );

        if (!res.ok) {
          throw new Error("Failed to fetch products from API");
        }

        const data: ProductListResponse = await res.json();

        // API 응답은 성공했으나, 데이터가 비어있는 경우 mock 데이터 사용
        if (data.content && data.content.length > 0) {
          setProducts(data.content);
        } else {
          console.warn("API returned empty list, loading mock data.");
          setProducts(mockData as Product[]);
        }
      } catch (error) {
        // API fetch 자체가 실패한 경우(네트워크 오류, 서버 다운 등) mock 데이터 사용
        console.error("API fetch failed, loading mock data:", error);
        setProducts(mockData as Product[]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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
              {user && (
                <Button size="lg" asChild className="rounded-lg">
                  <Link href="/products/create">상품 등록</Link>
                </Button>
              )}
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
              Showing {products.length} items
            </p>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
