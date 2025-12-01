"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { OrderDetail } from "@/types";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiGet<OrderDetail>(`/api/orders/${orderId}`);
        setOrderData(data);
      } catch (error) {
        console.error("주문 정보 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  const orderDate = new Date().toLocaleDateString("ko-KR");

  return (
    <main className="bg-background min-h-screen py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="bg-card border-border space-y-8 rounded-lg border p-8 text-center sm:p-12">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-6">
              <Check className="h-12 w-12 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
              결제가 완료되었습니다!
            </h1>
            <p className="text-muted-foreground">주문해주셔서 감사합니다.</p>
          </div>

          {/* Order Details */}
          {loading ? (
            <div className="bg-muted space-y-4 rounded-lg p-6 text-center">
              <p className="text-muted-foreground">
                주문 정보를 불러오는 중...
              </p>
            </div>
          ) : orderData ? (
            <div className="bg-muted space-y-4 rounded-lg p-6 text-left">
              <div className="border-border flex items-center justify-between border-b pb-4">
                <span className="text-muted-foreground">주문번호</span>
                <span className="text-foreground font-semibold">
                  {orderData.orderId}
                </span>
              </div>
              <div className="border-border flex items-center justify-between border-b pb-4">
                <span className="text-muted-foreground">상품명</span>
                <span className="text-foreground font-semibold">
                  {orderData.productName}
                </span>
              </div>
              <div className="border-border flex items-center justify-between border-b pb-4">
                <span className="text-muted-foreground">주문일시</span>
                <span className="text-foreground font-semibold">
                  {orderDate}
                </span>
              </div>
              <div className="border-border flex items-center justify-between border-b pb-4">
                <span className="text-muted-foreground">결제금액</span>
                <span className="text-foreground text-lg font-semibold">
                  {formatCurrency(orderData.bidPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">예상 배송일</span>
                <span className="text-foreground font-semibold">
                  3-5 영업일
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-muted space-y-4 rounded-lg p-6 text-center">
              <p className="text-muted-foreground">
                주문 정보를 찾을 수 없습니다.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-center pt-4">
            <Link href="/">
              <Button className="rounded-lg px-8">홈으로</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-background min-h-screen py-12">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="bg-card border-border space-y-8 rounded-lg border p-8 text-center sm:p-12">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-6">
                  <Check className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
                  결제가 완료되었습니다!
                </h1>
                <p className="text-muted-foreground">
                  주문 정보를 불러오는 중...
                </p>
              </div>
            </div>
          </div>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
