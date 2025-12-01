"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import AddressSearch from "@/components/payment/AddressSearch";
import { AlertCircle } from "lucide-react";
import mockData from "@/mocks/products.json";
import { formatCurrency } from "@/lib/utils";
import { apiGet, apiPatch } from "@/lib/api";
import type { OrderDetail, UpdateShippingInfoRequest } from "@/types";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }> | { orderId: string };
}) {
  const router = useRouter();
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
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [orderId, setOrderId] = useState<number>(0);

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
    setIsOpen(false); // 모달 닫기
  };

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cardNumber") {
      // 숫자만 추출
      const numbers = value.replace(/\D/g, "");
      // 16자리로 제한
      const limitedNumbers = numbers.slice(0, 16);
      // 4자리마다 하이픈 추가
      formattedValue = limitedNumbers
        .replace(/(\d{4})(?=\d)/g, "$1-")
        .slice(0, 19);
    } else if (name === "expiry") {
      // 숫자만 추출
      const numbers = value.replace(/\D/g, "");
      // 4자리로 제한 (MMYY)
      const limitedNumbers = numbers.slice(0, 4);
      // MM/YY 형식으로 포맷팅
      if (limitedNumbers.length >= 2) {
        formattedValue = `${limitedNumbers.slice(0, 2)}/${limitedNumbers.slice(2)}`;
      } else {
        formattedValue = limitedNumbers;
      }
    } else if (name === "cvc") {
      // 숫자만 추출하고 3자리로 제한
      formattedValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setCardInfo((prev) => ({ ...prev, [name]: formattedValue }));

    // 에러 메시지 제거
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!deliveryInfo.name.trim()) newErrors.name = "이름을 입력해주세요";
    if (!deliveryInfo.phone.trim()) newErrors.phone = "전화번호를 입력해주세요";
    if (!deliveryInfo.address.trim()) newErrors.address = "주소를 입력해주세요";
    if (!deliveryInfo.detailAddress.trim())
      newErrors.detailAddress = "상세주소를 입력해주세요";
    if (!deliveryInfo.postalCode.trim())
      newErrors.postalCode = "우편번호를 입력해주세요";

    if (paymentMethod === "card") {
      // 카드번호 검증
      if (!cardInfo.cardNumber.trim()) {
        newErrors.cardNumber = "카드번호를 입력해주세요";
      } else {
        const cardNumberDigits = cardInfo.cardNumber.replace(/\D/g, "");
        if (cardNumberDigits.length !== 16) {
          newErrors.cardNumber = "카드번호는 16자리여야 합니다";
        } else if (!/^\d+$/.test(cardNumberDigits)) {
          newErrors.cardNumber = "올바른 카드번호 형식이 아닙니다";
        }
      }

      // 만료일 검증
      if (!cardInfo.expiry.trim()) {
        newErrors.expiry = "만료일을 입력해주세요";
      } else {
        const expiryMatch = cardInfo.expiry.match(/^(\d{2})\/(\d{2})$/);
        if (!expiryMatch) {
          newErrors.expiry = "만료일은 MM/YY 형식이어야 합니다";
        } else {
          const month = parseInt(expiryMatch[1], 10);
          const year = parseInt(expiryMatch[2], 10);
          const currentYear = new Date().getFullYear() % 100;
          const currentMonth = new Date().getMonth() + 1;

          if (month < 1 || month > 12) {
            newErrors.expiry = "월은 01~12 사이여야 합니다";
          } else if (
            year < currentYear ||
            (year === currentYear && month < currentMonth)
          ) {
            newErrors.expiry = "만료된 카드입니다";
          }
        }
      }

      // CVC 검증
      if (!cardInfo.cvc.trim()) {
        newErrors.cvc = "CVC를 입력해주세요";
      } else if (!/^\d{3}$/.test(cardInfo.cvc)) {
        newErrors.cvc = "CVC는 3자리 숫자여야 합니다";
      }
    }

    if (!agreeTerms) newErrors.terms = "약관 동의는 필수입니다";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCompleteOrder = async () => {
    if (!validateForm()) {
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

      // 실제로는 결제 API도 호출해야 함
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 성공 페이지로 리다이렉트 (orderId 전달)
      router.push(`/payment/success?orderId=${orderId}`);
    } catch (error) {
      console.error("주문 처리 실패:", error);
      // 실패 페이지로 리다이렉트
      router.push("/payment/fail");
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
              <h2 className="text-foreground text-2xl font-bold">결제 방법</h2>

              <div className="space-y-3">
                {[
                  { id: "card", label: "신용카드" },
                  { id: "bank", label: "무통장입금" },
                  {
                    id: "toss",
                    label: "토스페이",
                    icon: "https://static.toss.im/icons/png/4x/icon-toss-logo.png",
                  },
                ].map((method) => (
                  <label
                    key={method.id}
                    className="border-border hover:bg-muted/50 flex cursor-pointer items-center rounded-lg border p-4 transition-colors"
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4"
                    />
                    {method.id === "toss" ? (
                      <img
                        src={method.icon}
                        alt="토스페이"
                        className="ml-3 h-6 w-6"
                      />
                    ) : (
                      <span className="ml-3 text-xl">{method.icon}</span>
                    )}
                    <span className="text-foreground ml-2 font-medium">
                      {method.label}
                    </span>
                  </label>
                ))}
              </div>

              {paymentMethod === "card" && (
                <div className="bg-muted border-border mt-6 space-y-4 rounded-lg border p-4">
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      카드 번호 *
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardInfo.cardNumber}
                      onChange={handleCardChange}
                      placeholder="0000-0000-0000-0000"
                      maxLength={19}
                      className={`bg-background text-foreground focus:ring-primary placeholder:text-muted-foreground w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none ${
                        errors.cardNumber ? "border-red-500" : "border-border"
                      }`}
                    />
                    {errors.cardNumber && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-foreground mb-2 block text-sm font-medium">
                        만료일 *
                      </label>
                      <input
                        type="text"
                        name="expiry"
                        value={cardInfo.expiry}
                        onChange={handleCardChange}
                        placeholder="MM/YY"
                        className={`bg-background text-foreground focus:ring-primary placeholder:text-muted-foreground w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none ${
                          errors.expiry ? "border-red-500" : "border-border"
                        }`}
                      />
                      {errors.expiry && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.expiry}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-foreground mb-2 block text-sm font-medium">
                        CVC *
                      </label>
                      <input
                        type="text"
                        name="cvc"
                        value={cardInfo.cvc}
                        onChange={handleCardChange}
                        placeholder="000"
                        maxLength={3}
                        className={`bg-background text-foreground focus:ring-primary placeholder:text-muted-foreground w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none ${
                          errors.cvc ? "border-red-500" : "border-border"
                        }`}
                      />
                      {errors.cvc && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.cvc}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="border-border mt-6 space-y-3 border-t pt-6">
                <label className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 h-4 w-4"
                  />
                  <span className="text-foreground text-sm">
                    이용약관 및 개인정보 수집에 동의합니다 *
                  </span>
                </label>
                {errors.terms && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                    <p className="text-xs text-red-600">{errors.terms}</p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleCompleteOrder}
                disabled={isProcessing}
                size="lg"
                className="w-full rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? "처리 중..." : "결제 완료"}
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
