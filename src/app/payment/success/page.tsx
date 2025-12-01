"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check } from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/user/useAuth";
import type { OrderDetail } from "@/types";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const orderId = searchParams.get("myOrderId");
  const amount = searchParams.get("amount");
  const tossOrderId = searchParams.get("orderId"); // 토스페이먼츠에서 보내주는 주문번호
  const paymentKey = searchParams.get("paymentKey"); // 토스페이먼츠 결제 키 (정상 결제 확인용)

  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      // 인증 로딩 중이면 대기
      if (authLoading) return;

      // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
      if (!user) {
        alert("로그인이 필요한 서비스입니다.");
        router.push("/login");
        return;
      }

      // paymentKey가 없으면 직접 URL 접근으로 간주
      if (!paymentKey) {
        alert("잘못된 접근입니다.");
        router.push("/");
        return;
      }

      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiGet<OrderDetail>(`/api/orders/${orderId}`);
        setOrderData(data);
      } catch (error) {
        console.error("주문 정보 조회 실패:", error);
        // 권한 없음 또는 존재하지 않는 주문일 경우
        if (error instanceof Error && 
            (error.message.includes("403") || 
             error.message.includes("404") ||
             error.message.includes("권한") ||
             error.message.includes("엔티티를 찾을 수 없습니다"))) {
          alert("접근 권한이 없거나 존재하지 않는 주문입니다.");
          router.push("/");
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, authLoading, user, router, paymentKey]);

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
            <div className="bg-muted space-y-4 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-48" />
                </div>
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            </div>
          ) : orderData ? (
            <div className="bg-muted space-y-4 rounded-lg p-6 text-left">
              <div className="border-border flex items-center justify-between border-b pb-4">
                <span className="text-muted-foreground">주문번호</span>
                <span className="text-foreground font-semibold">
                  {tossOrderId || orderId || orderData.orderId}
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
                  {amount ? formatCurrency(Number(amount)) : formatCurrency(orderData.bidPrice)}
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
