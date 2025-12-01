"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AddressSearch from "@/components/payment/AddressSearch";
import mockData from "@/mocks/products.json";
import { formatCurrency } from "@/lib/utils";
import { apiGet, apiPatch } from "@/lib/api";
import type { OrderDetail, UpdateShippingInfoRequest } from "@/types";

// 토스페이먼츠 SDK 타입 정의
interface TossPaymentsWidgets {
  setAmount: (amount: { currency: string; value: number }) => Promise<void>;
  requestPayment: (options: {
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    customerEmail: string;
    customerName: string;
    customerMobilePhone: string;
  }) => Promise<void>;
  renderPaymentMethods: (options: {
    selector: string;
    variantKey: string;
  }) => Promise<{ destroy?: () => void }>;
  renderAgreement: (options: { selector: string }) => Promise<void>;
}

declare global {
  interface Window {
    TossPayments: (clientKey: string) => {
      widgets: (options: {
        customerKey: string;
      }) => Promise<TossPaymentsWidgets>;
    };
  }
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }> | { orderId: string };
}) {
  const [winningProduct, setWinningProduct] = useState({
    id: 1,
    title: "아이폰17 프로 맥스 256GB (미개봉)",
    image: "/product01.jpeg",
    winningBid: 1970000,
    seller: "테크마니아",
    estimatedDelivery: "3-5 영업일",
  });

  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    phone: "",
    address: "",
    detailAddress: "",
    postalCode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [orderId, setOrderId] = useState<number>(0);
  const [widgetReady, setWidgetReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const paymentMethodWidgetRef = useRef<{
    destroy?: () => void;
  } | null>(null);
  const isInitializedRef = useRef(false);

  // params 초기화 및 상품 데이터 로드
  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await Promise.resolve(params);
      const id = parseInt(resolvedParams.orderId, 10);
      setOrderId(id);

      try {
        // API 호출로 주문 정보 가져오기
        const orderData = await apiGet<OrderDetail>(`/api/orders/${id}`);

        // API 응답에서 필요한 정보만 추출
        setWinningProduct({
          id: orderData.product.id,
          title: orderData.product.name,
          image: orderData.product.imageUrl,
          winningBid: orderData.bidPrice,
          seller: orderData.product.user.nickname,
          estimatedDelivery: "3-5 영업일",
        });

        // 배송 정보가 있으면 미리 채워넣기
        if (orderData.shippingInfo) {
          setDeliveryInfo({
            name: orderData.shippingInfo.name,
            phone: orderData.shippingInfo.phoneNumber,
            address: orderData.shippingInfo.address,
            detailAddress: orderData.shippingInfo.detailAddress,
            postalCode: orderData.shippingInfo.zipCode,
          });
        }
      } catch (error) {
        console.error("주문 정보 조회 실패:", error);
        // 에러 발생 시 mock 데이터 사용
        const product = (
          mockData as unknown as Array<{
            id: number;
            name: string;
            bidPrice: number;
            imageUrl: string;
            user: { nickname: string };
          }>
        ).find((p) => p.id === id);

        if (product) {
          setWinningProduct({
            id: product.id,
            title: product.name,
            image: product.imageUrl,
            winningBid: product.bidPrice,
            seller: product.user.nickname,
            estimatedDelivery: "3-5 영업일",
          });
        }
      }
    };
    initializeParams();
  }, [params]);

  const shippingFee = 3000;
  const tax = Math.floor((winningProduct.winningBid * 0.1) / 100) * 100;
  const totalAmount = winningProduct.winningBid + shippingFee + tax;

  // 토스페이먼츠 결제위젯 초기화 (한 번만 실행)
  useEffect(() => {
    const initializeTossPayments = async () => {
      // 이미 초기화되었거나 필수 값이 없으면 return
      if (isInitializedRef.current || !orderId || !totalAmount) {
        return;
      }

      if (!window.TossPayments) {
        console.error("토스페이먼츠 SDK가 로드되지 않았습니다.");
        return;
      }

      try {
        // 테스트 클라이언트 키 (실제 운영시에는 환경변수로 관리)
        const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
        const customerKey = `customer_${orderId}_${Date.now()}`;

        // 토스페이먼츠 초기화
        const tossPayments = window.TossPayments(clientKey);

        // 결제위젯 초기화
        const widgets = await tossPayments.widgets({ customerKey });
        widgetsRef.current = widgets;

        // 결제 금액 설정
        await widgets.setAmount({
          currency: "KRW",
          value: totalAmount,
        });

        // 결제 UI 렌더링
        const paymentMethodWidget = await widgets.renderPaymentMethods({
          selector: "#payment-widget",
          variantKey: "DEFAULT",
        });
        paymentMethodWidgetRef.current = paymentMethodWidget;

        // 약관 UI 렌더링
        await widgets.renderAgreement({
          selector: "#agreement",
        });

        setWidgetReady(true);
        isInitializedRef.current = true; // 초기화 완료 표시
      } catch (error) {
        console.error("토스페이먼츠 초기화 실패:", error);
        isInitializedRef.current = false; // 실패 시 재시도 가능하도록
      }
    };

    initializeTossPayments();

    // cleanup - 컴포넌트 언마운트 시에만 위젯 제거
    return () => {
      if (paymentMethodWidgetRef.current) {
        paymentMethodWidgetRef.current.destroy?.();
      }
      // DOM 요소 초기화
      const paymentWidget = document.querySelector("#payment-widget");
      const agreement = document.querySelector("#agreement");
      if (paymentWidget) paymentWidget.innerHTML = "";
      if (agreement) agreement.innerHTML = "";

      widgetsRef.current = null;
      paymentMethodWidgetRef.current = null;
      isInitializedRef.current = false;
      setWidgetReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]); // totalAmount는 초기화 시에만 사용

  // 결제 금액 변경시 업데이트
  useEffect(() => {
    if (widgetsRef.current && widgetReady) {
      widgetsRef.current.setAmount({
        currency: "KRW",
        value: totalAmount,
      });
    }
  }, [totalAmount, widgetReady]);

  // 주소 찾기 완료 시 실행될 함수
  const handleAddressComplete = (data: {
    zonecode: string;
    address: string;
  }) => {
    setDeliveryInfo((prev) => ({
      ...prev,
      postalCode: data.zonecode,
      address: data.address,
    }));
    // 주소 관련 에러 메시지 제거
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.postalCode;
      delete newErrors.address;
      return newErrors;
    });
    setIsOpen(false); // 모달 닫기
  };

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCompleteOrder = async () => {
    // 배송 정보 검증
    const newErrors: Record<string, string> = {};

    if (!deliveryInfo.name.trim()) newErrors.name = "이름을 입력해주세요";
    if (!deliveryInfo.phone.trim()) newErrors.phone = "전화번호를 입력해주세요";
    if (!deliveryInfo.address.trim()) newErrors.address = "주소를 입력해주세요";
    if (!deliveryInfo.detailAddress.trim())
      newErrors.detailAddress = "상세주소를 입력해주세요";
    if (!deliveryInfo.postalCode.trim())
      newErrors.postalCode = "우편번호를 입력해주세요";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!widgetsRef.current) {
      alert("결제 위젯이 준비되지 않았습니다.");
      return;
    }

    setIsProcessing(true);

    try {
      // 배송 정보 업데이트 API 호출
      const shippingData: UpdateShippingInfoRequest = {
        name: deliveryInfo.name,
        phoneNumber: deliveryInfo.phone,
        zipCode: deliveryInfo.postalCode,
        address: deliveryInfo.address,
        detailAddress: deliveryInfo.detailAddress,
      };

      await apiPatch<OrderDetail>(
        `/api/orders/${orderId}/shipping-info`,
        shippingData,
      );

      // 토스페이먼츠 결제 요청
      await widgetsRef.current.requestPayment({
        orderId: `ORDER_${orderId}_${Date.now()}`,
        orderName: winningProduct.title,
        successUrl: `${window.location.origin}/payment/success?orderId=${orderId}`,
        failUrl: `${window.location.origin}/payment/fail?orderId=${orderId}`,
        customerEmail: "customer@example.com",
        customerName: deliveryInfo.name,
        customerMobilePhone: deliveryInfo.phone.replace(/-/g, ""),
      });
    } catch (error) {
      console.error("주문 처리 실패:", error);
      alert("결제 요청에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="bg-background min-h-screen py-8 md:py-12">
      {isOpen && (
        <AddressSearch
          onComplete={handleAddressComplete}
          onClose={() => setIsOpen(false)}
        />
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/mypage"
          className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
        >
          ← 마이페이지로 가기
        </Link>

        <h1 className="text-foreground mb-12 text-4xl font-bold">주문 결제</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            <div className="bg-card border-border space-y-6 rounded-lg border p-6">
              <h2 className="text-foreground text-2xl font-bold">배송 정보</h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    이름 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={deliveryInfo.name}
                    onChange={handleDeliveryChange}
                    placeholder="성함을 입력하세요"
                    className={`bg-background text-foreground focus:ring-primary placeholder:text-muted-foreground w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none ${
                      errors.name ? "border-red-500" : "border-border"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    전화번호 *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={deliveryInfo.phone}
                    onChange={handleDeliveryChange}
                    placeholder="010-0000-0000"
                    className={`bg-background text-foreground focus:ring-primary placeholder:text-muted-foreground w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none ${
                      errors.phone ? "border-red-500" : "border-border"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  우편번호 *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="12345"
                    name="postalCode"
                    value={deliveryInfo.postalCode}
                    onChange={handleDeliveryChange}
                    className={`bg-background text-foreground focus:ring-primary placeholder:text-muted-foreground flex-1 rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none ${
                      errors.postalCode ? "border-red-500" : "border-border"
                    }`}
                  />
                  <Button
                    variant="outline"
                    className="rounded-lg bg-transparent"
                    onClick={() => setIsOpen(true)}
                  >
                    찾기
                  </Button>
                </div>
                {errors.postalCode && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.postalCode}
                  </p>
                )}
              </div>

              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  도로명 주소 *
                </label>
                <input
                  type="text"
                  name="address"
                  value={deliveryInfo.address}
                  onChange={handleDeliveryChange}
                  placeholder="도로명 주소"
                  className={`bg-background text-foreground focus:ring-primary placeholder:text-muted-foreground mb-2 w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none ${
                    errors.address ? "border-red-500" : "border-border"
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                )}
                <input
                  type="text"
                  name="detailAddress"
                  value={deliveryInfo.detailAddress}
                  onChange={handleDeliveryChange}
                  placeholder="상세 주소 (아파트, 동/호 등)"
                  className={`bg-background text-foreground focus:ring-primary placeholder:text-muted-foreground w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none ${
                    errors.detailAddress ? "border-red-500" : "border-border"
                  }`}
                />
                {errors.detailAddress && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.detailAddress}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-card border-border space-y-6 rounded-lg border p-6">
              <h2 className="text-foreground text-2xl font-bold">결제 정보</h2>

              {/* 토스페이먼츠 결제위젯 */}
              <div id="payment-widget" className="w-full" />

              {/* 토스페이먼츠 약관 동의 위젯 */}
              <div id="agreement" className="w-full" />

              <Button
                onClick={handleCompleteOrder}
                disabled={isProcessing || !widgetReady}
                size="lg"
                className="w-full rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing
                  ? "처리 중..."
                  : widgetReady
                    ? "결제하기"
                    : "결제 준비 중..."}
              </Button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border-border sticky top-24 space-y-6 rounded-lg border p-6">
              <div>
                <h3 className="text-foreground mb-4 font-semibold">
                  낙찰 상품
                </h3>
                <div className="border-border mb-4 overflow-hidden rounded-lg border">
                  <img
                    src={winningProduct.image || "/placeholder.svg"}
                    alt={winningProduct.title}
                    className="aspect-square w-full object-cover"
                  />
                </div>
                <p className="text-foreground line-clamp-2 text-sm font-medium">
                  {winningProduct.title}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {winningProduct.seller}
                </p>
              </div>

              <div className="border-border space-y-3 border-b pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">낙찰가</span>
                  <span className="text-foreground font-medium">
                    {formatCurrency(winningProduct.winningBid)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">배송료</span>
                  <span className="text-foreground font-medium">
                    {formatCurrency(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">수수료</span>
                  <span className="text-foreground font-medium">
                    {formatCurrency(tax)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-foreground font-semibold">총액</span>
                <span className="text-foreground text-2xl font-bold">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
