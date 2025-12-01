"use client";

import type { MypageProductBid, Order, Product, WinnerDetails } from "@/types";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGet, apiPut } from "@/lib/api";
import { useAuth } from "@/hooks/user/useAuth";
import { formatCurrency } from "@/lib/utils";
import { PRODUCT_STATUS } from "@/lib/constants";

// UI 컴포넌트
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2, CreditCard } from "lucide-react"; 

// --- 초기 데이터 및 타입 ---
const INITIAL_USER = {
  nickname: "익명 사용자",
  joinDate: "가입일 정보 없음",
  rating: 0,
  reviews: 0,
  phoneNumber: "",
};

type UserProfile = {
  nickname: string;
  joinDate: string;
  rating: number;
  reviews: number;
  phoneNumber: string;
};

type ApiUserResponse = {
  nickname?: string;
  createdAt?: string;
  rating?: number;
  reviews?: number;
  phoneNumber?: string;
  products?: Product[];
  winners?: WinnerDetails[];
  productBids?: MypageProductBid[];
  orders: Order[];
};

// --- 유틸리티 함수 ---
const formatJoinDate = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 가입`;
};

const getProductStatusLabel = (status?: string) => {
  if (!status) return "";
  const item = PRODUCT_STATUS.find((s) => s.value === status.toUpperCase());
  return item ? item.label : status;
};

// --- 재사용 가능한 상품 리스트 아이템 컴포넌트 ---
interface ProductItemProps {
  id: number | string;
  name: string;
  price: number;
  status?: string;
  subText?: string;
  badgeText?: string;
  linkPrefix?: string;
  actionNode?: React.ReactNode; 
}

const ProductListItem = ({
  id,
  name,
  price,
  status,
  subText,
  badgeText,
  linkPrefix = "/products",
  actionNode,
}: ProductItemProps) => (
  <div className="hover:bg-muted/50 border-border flex items-center justify-between border-b p-4 transition-colors last:border-b-0">
    <Link
      href={`${linkPrefix}/${id}`}
      className="flex flex-1 items-center justify-between pr-4"
    >
      {/* 상품 정보 */}
      <div>
        <div className="flex items-center gap-2">
            <p className="text-foreground font-medium">{name}</p>
            {badgeText && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                  {badgeText}
                </Badge>
            )}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {status && <span>{getProductStatusLabel(status)}</span>}
            {status && subText && <span>•</span>}
            {subText && <span>{subText}</span>}
        </div>
      </div>
      
      {/* 가격 정보 */}
      <div className="text-right">
        <p className="text-foreground font-bold">
          {formatCurrency(price)}
        </p>
      </div>
    </Link>

    {/* 액션 버튼이 있을 경우 렌더링 */}
    {actionNode && (
        <div className="ml-4 pl-4 border-l border-border">
            {actionNode}
        </div>
    )}
  </div>
);

export default function MyPage() {
  const { updateNickname } = useAuth();
  const router = useRouter();

  // --- State ---
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 입력값 State
  const [nicknameInput, setNicknameInput] = useState("");
  const [phoneNumberInput, setPhoneNumberInput] = useState("");

  // 상품 리스트 State
  const [sellingProducts, setSellingProducts] = useState<Product[]>([]);
  
  // 구매 관련 State (3단계)
  const [purchaseBidding, setPurchaseBidding] = useState<MypageProductBid[]>([]);
  const [purchasePending, setPurchasePending] = useState<WinnerDetails[]>([]);
  const [purchaseCompleted, setPurchaseCompleted] = useState<WinnerDetails[]>([]); 
  const [orders, setOrders] = useState<Order[]>([]);


    // --- 1. 데이터 불러오기 ---
    useEffect(() => {
      const fetchUserInfo = async () => {
        try {
          const token = localStorage.getItem("accessToken");
          if (!token) {
            // 토큰이 없으면 로딩만 해제하고 함수 종료
            setIsLoading(false); 
            return;
          }

          const apiUser = await apiGet<ApiUserResponse>("/api/users/me");

          // [판매 목록] 서버 데이터 사용
          setSellingProducts(apiUser.products ?? []);

          // [구매 목록 분리 로직]
          setPurchaseBidding(apiUser.productBids ?? []);

          // [구매 대기] 서버에서 받은 낙찰자 목록(winners) 사용
          setPurchasePending(apiUser.winners ?? []); 
          
          // [구매 완료] 현재 백엔드 데이터로 구분 불가하므로 빈 배열
          setPurchaseCompleted([]); 
          // [주문 내역] 서버 데이터 사용
          setOrders(apiUser.orders);

          
          // 프로필 데이터 가공
          const fetchedUser: UserProfile = {
            nickname: apiUser.nickname ?? INITIAL_USER.nickname,
            joinDate: apiUser.createdAt
              ? formatJoinDate(apiUser.createdAt)
              : INITIAL_USER.joinDate,
            rating: apiUser.rating ?? INITIAL_USER.rating,
            reviews: apiUser.reviews ?? INITIAL_USER.reviews,
            phoneNumber: apiUser.phoneNumber
              ? String(apiUser.phoneNumber).trim()
              : INITIAL_USER.phoneNumber,
          };

          setUser(fetchedUser);
          setNicknameInput(fetchedUser.nickname);
          setPhoneNumberInput(fetchedUser.phoneNumber);
        } catch (e) {
          // 에러 발생 시 초기화
          console.error("Failed to fetch user data:", e);
          setUser(INITIAL_USER);
          setNicknameInput(INITIAL_USER.nickname);
          setPhoneNumberInput(INITIAL_USER.phoneNumber);
        } finally {
          // 성공하든 실패하든 로딩 상태 해제
          setIsLoading(false);
        }
      };

      fetchUserInfo();
    }, [router]);

  // --- 2. 프로필 수정 핸들러 ---
  const handleSave = async () => {
    const trimmedNick = nicknameInput.trim();
    const trimmedPhone = phoneNumberInput.trim();

    if (!trimmedNick) return alert("닉네임을 입력해주세요.");
    if (trimmedNick.length > 8)
      return alert("닉네임은 8자 이하로 입력해주세요.");
    if (!trimmedPhone) return alert("전화번호를 입력해주세요.");

    try {
      await apiPut("/api/users/me", {
        nickname: trimmedNick,
        phoneNumber: trimmedPhone,
      });

      alert("프로필이 성공적으로 변경되었습니다.");
      setUser((prev) => ({
        ...prev,
        nickname: trimmedNick,
        phoneNumber: trimmedPhone,
      }));
      updateNickname(trimmedNick);
      setIsModalOpen(false);
    } catch {
      alert("프로필 수정에 실패했습니다.");
    }
  };

  // --- 3. 판매 목록 필터링 (3단계) ---
  const { bidding: sellingBidding, pending: sellingPending, completed: sellingCompleted } =
    useMemo(() => {
      // 1. 입찰 중 (판매 중)
      const bidding = sellingProducts.filter((p) => p.bidStatus !== "COMPLETED");

      // 2. 판매 대기 (낙찰됨) - 모두 대기로 분류
      const pending = sellingProducts.filter((p) => p.bidStatus === "COMPLETED");

      // 3. 판매 완료 (결제됨)
      const completed: Product[] = [];

      return {
        bidding: bidding,
        pending: pending,
        completed: completed,
      };
    }, [sellingProducts]);


  // --- 4. 결제하기 버튼 핸들러 ---
  const handlePayment = (orderId: number | string, productName: string) => {
    // 결제 페이지로 이동 (동적 라우팅 적용)
    if (!confirm(`'${productName}' 상품의 결제 페이지로 이동하시겠습니까?`)) return;

    router.push(`/payment/${orderId}`);
  };
  
  // [NEW UTILITY] 0이면 연하게, 1 이상이면 강조하는 클래스 반환
  const getStatClass = (count: number, isPrimary: boolean = false, isTitle: boolean) => {
    const isBold = count > 0;
    
    // 타이틀
    if (isTitle) {
      if (isBold) {
        return isPrimary ? "text-primary font-bold" : "text-foreground font-bold";
      } else {
        return "text-muted-foreground";
      }
    } 
    
    if (isBold) {
      return isPrimary ? "text-primary mt-1 text-xl font-bold" : "text-foreground mt-1 text-xl font-semibold";
    } else {
      return "text-muted-foreground mt-1 text-xl font-semibold";
    }
  };


  return (
    <main className="bg-background min-h-screen py-8 md:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* === 프로필 섹션 === */}
        <div className="bg-card border-border mb-8 rounded-lg border p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <h1 className="text-foreground text-2xl font-bold md:text-3xl">
                    {user.nickname}
                  </h1>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {user.joinDate}
                  </p>
                </>
              )}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-lg bg-transparent"
                >
                  <Edit2 className="h-4 w-4" /> 프로필 수정
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>프로필 수정</DialogTitle>
                    <DialogDescription>새 정보를 입력해주세요.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nickname" className="text-right">닉네임</Label>
                    <Input
                      id="nickname"
                      value={nicknameInput}
                      maxLength={8}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      className="col-span-3"
                      placeholder="새 닉네임"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phoneNumber" className="text-right">전화번호</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumberInput}
                      onChange={(e) => setPhoneNumberInput(e.target.value)}
                      className="col-span-3"
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSave}>변경하기</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* === 구매 내역 섹션 (3단계 UI 적용) === */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">구매 내역</h2>

          {/* 요약 바 */}
          <div className="border-border bg-card mb-6 rounded-lg border p-4">
            <div className="grid grid-cols-4 text-center text-sm">
              
              {/* 1. 전체 (우측에 구분선 유지) */}
              <div className="border-border border-r">
                <p className={getStatClass(purchaseBidding.length + purchasePending.length + purchaseCompleted.length, false, true)}>전체</p>
                <p className={getStatClass(purchaseBidding.length + purchasePending.length + purchaseCompleted.length, false, false)}>
                  {/* 전체 수량 합산 */}
                  {purchaseBidding.length + orders.filter(order => order.orderStatus === "PAYMENT_PENDING").length + purchaseCompleted.length}
                </p>
              </div>
              
              {/* 2. 입찰 중 (구분선 제거) */}
              <div> 
                <p className={getStatClass(purchaseBidding.length, false, true)}>입찰 중</p>
                <p className={getStatClass(purchaseBidding.length, false, false)}>
                  {purchaseBidding.length}
                </p>
              </div>

              {/* 3. 결제 대기 (강조 제거 및 구분선 제거) */}
              <div> 
                <p className={getStatClass(orders.filter(order => order.orderStatus === "PAYMENT_PENDING").length, true, true)}>결제 대기</p> 
                <p className={getStatClass(orders.filter(order => order.orderStatus === "PAYMENT_PENDING").length, true, false)}>
                  {orders.filter(order => order.orderStatus === "PAYMENT_PENDING").length}
                </p>
              </div>

              {/* 4. 구매 완료 (구분선 없음) */}
              <div> 
                <p className={getStatClass(orders.filter(order => order.orderStatus === "PAID").length, false, true)}>구매 완료</p>
                <p className={getStatClass(orders.filter(order => order.orderStatus === "PAID").length, false, false)}>
                  {orders.filter(order => order.orderStatus === "PAID").length}
                </p>
              </div>
            </div>
          </div>

          {/* 2. 입찰 중 목록 */}
          <div className="mb-6">
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">
              입찰 중
            </h3>
            <div className="border-border bg-card rounded-lg border">
              {purchaseBidding.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">현재 입찰 중인 상품이 없습니다.</p>
                </div>
              ) : (
                purchaseBidding.map((product) => (
                  <ProductListItem
                    key={product.productId}
                    id={product.productId}
                    name={product.productName}
                    price={product.price}
                    subText={`내 입찰 횟수: ${product.bidCount}`}
                  />
                ))
              )}
            </div>
          </div>

          {/* 3. 결제 대기 목록 */}
          <div className="mb-8">
            <h3 className="text-primary mb-3 text-sm font-bold flex items-center gap-2">
              결제 대기
            </h3>
            <div
              className={`rounded-lg border ${
                orders.filter(order => order.orderStatus === "PAYMENT_PENDING").length > 0
                  ? "border-primary/20 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              {orders.filter(order => order.orderStatus === "PAYMENT_PENDING").length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    결제 대기 중인 상품이 없습니다.
                  </p>
                </div>
              ) : (
                orders
                  .filter(order => order.orderStatus === "PAYMENT_PENDING")
                  .map(order => (
                    <ProductListItem
                      key={order.orderId}
                      id={order.orderId}
                      name={order.productName}
                      price={order.bidPrice}
                      subText="낙찰 성공! 결제가 필요합니다."
                      actionNode={
                        <Button
                          size="sm"
                          onClick={() =>
                            handlePayment(order.orderId, order.productName)
                          }
                        >
                          결제하기
                        </Button>
                      }
                    />
                  ))
              )}
            </div>
          </div>

          {/* 4. 구매 완료 목록 */}
          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">
              구매 완료
            </h3>
            <div className="border-border bg-card rounded-lg border">
              {orders.filter(order => order.orderStatus === "PAID").length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">구매 완료된 상품이 없습니다.</p>
                </div>
              ) : (
                orders
                .filter(order => order.orderStatus === "PAID")
                .map((order) => (
                  <ProductListItem
                    key={order.orderId}
                    id={order.orderId}
                    name={order.productName}
                    price={order.bidPrice}
                    status={order.orderStatus}
                    badgeText="구매 완료"
                    subText="배송 준비중"
                  />
                ))
              )}
            </div>
          </div>
        </section>

        {/* === 판매 내역 섹션 (3단계 UI 적용) === */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">판매 내역</h2>

          {/* 1. 요약 바 */}
          <div className="border-border bg-card mb-6 rounded-lg border p-4">
            <div className="grid grid-cols-4 text-center text-sm">
              
              {/* 1. 전체 (NEW - 우측에 구분선 유지) */}
              <div className="border-border border-r">
                <p className={getStatClass(sellingBidding.length + sellingPending.length + sellingCompleted.length, false, true)}>전체</p>
                <p className={getStatClass(sellingBidding.length + sellingPending.length + sellingCompleted.length, false, false)}>
                  {sellingBidding.length + sellingPending.length + sellingCompleted.length}
                </p>
              </div>
              
              {/* 2. 입찰 중 (구분선 제거) */}
              <div> 
                <p className={getStatClass(sellingBidding.length, false, true)}>입찰 중</p>
                <p className={getStatClass(sellingBidding.length, false, false)}>
                  {sellingBidding.length}
                </p>
              </div>

              {/* 3. 판매 대기 (조건부 강조 유지, 구분선 제거) */}
              <div> 
                <p className={getStatClass(sellingPending.length, true, true)}>입금 대기</p>
                <p className={getStatClass(sellingPending.length, true, false)}>
                  {sellingPending.length}
                </p>
              </div>

              {/* 4. 판매 완료 (구분선 제거) */}
              <div> 
                <p className={getStatClass(sellingCompleted.length, false, true)}>판매 완료</p>
                <p className={getStatClass(sellingCompleted.length, false, false)}>
                  {sellingCompleted.length}
                </p>
              </div>
            </div>
          </div>

          {/* 2. 입찰 중 목록 */}
          <div className="mb-6">
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">
              입찰 중
            </h3>
            <div className="border-border bg-card rounded-lg border">
              {sellingBidding.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    현재 입찰 중인 상품이 없습니다.
                  </p>
                </div>
              ) : (
                sellingBidding.map((product) => (
                  <ProductListItem
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.bidPrice ?? product.startPrice}
                    status={product.productStatus}
                    subText={`전체 입찰 횟수: ${product.bidCount}`}
                  />
                ))
              )}
            </div>
          </div>

          {/* 3. 판매 대기 목록 (강조 스타일 적용) */}
          <div className="mb-6">
            <h3 className={`mb-3 text-sm font-medium flex items-center gap-2 ${
                sellingPending.length > 0 ? "text-primary font-bold" : "text-muted-foreground"
            }`}>
              입금 대기
            </h3>
            <div className={`rounded-lg border ${
              sellingPending.length > 0
                ? "border-primary/20 bg-primary/5" 
                : "border-border bg-card"
            }`}> 
              {sellingPending.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    결제 확인을 기다리는 상품이 없습니다.
                  </p>
                </div>
              ) : (
                sellingPending.map((product) => (
                  <ProductListItem
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.bidPrice ?? product.startPrice}
                    status={product.productStatus}
                    subText="구매자 결제 대기 중"
                  />
                ))
              )}
            </div>
          </div>

          {/* 4. 판매 완료 목록 */}
          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">
              판매 완료
            </h3>
            <div className="border-border bg-card rounded-lg border">
              {sellingCompleted.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    판매 완료된 상품이 없습니다.
                  </p>
                </div>
              ) : (
                sellingCompleted.map((product) => (
                  <ProductListItem
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.bidPrice ?? product.startPrice}
                    status={product.productStatus}
                    badgeText="판매 완료"
                    subText="결제 완료됨"
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}