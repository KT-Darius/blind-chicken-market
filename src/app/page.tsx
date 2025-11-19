"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
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

function HomeContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [sortedProducts, setSortedProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 6;

  // 전체 상품 데이터 가져오기
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products?page=0&size=1000`,
        );

        if (!res.ok) {
          throw new Error("Failed to fetch products from API");
        }

        const data: ProductListResponse = await res.json();

        if (data.content && data.content.length > 0) {
          setAllProducts(data.content);
        } else {
          setAllProducts(mockData as Product[]);
        }
      } catch (error) {
        console.error("API fetch failed, loading mock data:", error);
        setAllProducts(mockData as Product[]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  // 검색어 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  // 필터링, 정렬, 페이지네이션 적용
  useEffect(() => {
    if (allProducts.length === 0) return;

    // 1. 검색 필터링
    let filtered = allProducts;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = allProducts.filter((product) => {
        const matchName = product.name.toLowerCase().includes(query);
        const matchDescription = product.description
          .toLowerCase()
          .includes(query);
        const matchCategory = product.category.toLowerCase().includes(query);
        return matchName || matchDescription || matchCategory;
      });
    }

    // 2. 정렬
    const sorted = [...filtered].sort((a, b) => {
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

    // 3. 페이지네이션
    const startIdx = currentPage * pageSize;
    const endIdx = startIdx + pageSize;
    setSortedProducts(sorted.slice(startIdx, endIdx));
    setTotalPages(Math.ceil(sorted.length / pageSize));
    setTotalItems(sorted.length);
  }, [allProducts, searchQuery, sortBy, currentPage]);

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
                {searchQuery
                  ? `총 ${totalItems}개 중 ${sortedProducts.length}개 표시`
                  : `Showing ${sortedProducts.length} items`}
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
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i).map(
                    (page) => {
                      // 현재 페이지 주변만 표시 (처음, 끝, 현재 ±2)
                      if (
                        page === 0 ||
                        page === totalPages - 1 ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-8 px-2 py-1 text-sm transition-colors ${
                              currentPage === page
                                ? "text-foreground font-semibold"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {page + 1}
                          </button>
                        );
                      } else if (
                        page === currentPage - 3 ||
                        page === currentPage + 3
                      ) {
                        return (
                          <span
                            key={page}
                            className="text-muted-foreground px-1 text-sm"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    },
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="bg-background min-h-screen">
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
              </div>
            </div>
          </section>
          <section className="py-12 md:py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            </div>
          </section>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
