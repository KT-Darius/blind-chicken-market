"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/user/useAuth";
import { ProductListResponse, Product } from "@/types";

import mockData from "@/mocks/products.json";

type SortOption =
  | "latest"
  | "price-high"
  | "price-low"
  | "bid-count"
  | "ending-soon";

export default function Home() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [sortedProducts, setSortedProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products?page=0&offset=10`,
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

  // 검색 필터링
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter((product) => {
      const matchName = product.name.toLowerCase().includes(query);
      const matchDescription = product.description
        .toLowerCase()
        .includes(query);
      const matchCategory = product.category.toLowerCase().includes(query);

      return matchName || matchDescription || matchCategory;
    });

    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // 정렬 기능
  useEffect(() => {
    const sorted = [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "price-high":
          return b.bidPrice - a.bidPrice;
        case "price-low":
          return a.bidPrice - b.bidPrice;
        case "bid-count":
          return b.bidCount - a.bidCount;
        case "ending-soon":
          return (
            new Date(a.bidEndDate).getTime() - new Date(b.bidEndDate).getTime()
          );
        default:
          return 0;
      }
    });
    setSortedProducts(sorted);
  }, [filteredProducts, sortBy]);

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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="font-bold">
                {searchQuery ? `"${searchQuery}" 검색 결과` : "Hot Items🔥"}
              </p>
              <p className="text-muted-foreground text-sm">
                Showing {sortedProducts.length} items
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border-input bg-background ring-offset-background focus:ring-ring rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                <option value="latest">최신순</option>
                <option value="ending-soon">마감임박순</option>
                <option value="price-high">높은 가격순</option>
                <option value="price-low">낮은 가격순</option>
                <option value="bid-count">입찰 많은순</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-lg">
                {searchQuery
                  ? "검색 결과가 없습니다."
                  : "등록된 상품이 없습니다."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
