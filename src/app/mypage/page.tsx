"use client";

import type { MypageProductBid, Product, WinnerDetails } from "@/types";
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
import { Edit2 } from "lucide-react";

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

// --- [추가] 재사용 가능한 상품 리스트 아이템 컴포넌트 ---
// 반복되는 리스트 UI를 하나로 통합했습니다.
interface ProductItemProps {
  id: number | string;
  name: string;
  price: number;
  status?: string; // 판매/구매 완료 상태 표시용
  subText?: string; // "전체 입찰 횟수: 3" 등의 하단 텍스트
  badgeText?: string; // "구매 완료", "판매 완료" 뱃지 텍스트
  linkPrefix?: string;
}

const ProductListItem = ({
  id,
  name,
  price,
  status,
  subText,
  badgeText,
  linkPrefix = "/products",
}: ProductItemProps) => (
  <div className="hover:bg-muted border-border border-b p-4 transition-colors last:border-b-0">
    <Link
      href={`${linkPrefix}/${id}`}
      className="flex items-center justify-between"
    >
      <div className="flex-1">
        <p className="text-foreground font-medium">{name}</p>
        {(badgeText || status) && (
          <div className="mt-2 flex items-center gap-2">
            {badgeText && (
              <Badge variant="secondary" className="text-xs">
                {badgeText}
              </Badge>
            )}
            {status && (
              <p className="text-muted-foreground text-xs">
                상태: {getProductStatusLabel(status)}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="text-right">
        <p className="text-foreground text-lg font-bold">
          {formatCurrency(price)}
        </p>
        {subText && (
          <p className="text-muted-foreground mt-1 text-xs">{subText}</p>
        )}
      </div>
    </Link>
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
  const [purchaseOngoingProducts, setPurchaseOngoingProducts] = useState<
    MypageProductBid[]
  >([]);
  const [purchasedProducts, setPurchasedProducts] = useState<WinnerDetails[]>(
    [],
  );

  // --- 1. 데이터 불러오기 ---
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return; // 토큰이 없으면 그냥 리턴 (finally로 가서 로딩 끝남)

        const apiUser = await apiGet<ApiUserResponse>("/api/users/me");

        // 리스트 데이터 세팅
        setSellingProducts(apiUser.products ?? []);
        setPurchasedProducts(apiUser.winners ?? []);
        setPurchaseOngoingProducts(apiUser.productBids ?? []);

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
      } catch {
        // 에러 시 초기화 (목데이터 "익명 사용자" 등 유지)
        setUser(INITIAL_USER);
        setNicknameInput(INITIAL_USER.nickname);
        setPhoneNumberInput(INITIAL_USER.phoneNumber);
      } finally {
        // [중요] 성공하든 실패하든 로딩 상태 해제
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
      alert("프로필 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // --- 3. 데이터 필터링 최적화 (useMemo) ---
  // 렌더링 될 때마다 매번 필터링하지 않고, sellingProducts가 변할 때만 계산합니다.
  const { ongoing: sellingOngoing, completed: sellingCompleted } =
    useMemo(() => {
      return {
        ongoing: sellingProducts.filter((p) => p.bidStatus !== "COMPLETED"),
        completed: sellingProducts.filter((p) => p.bidStatus === "COMPLETED"),
      };
    }, [sellingProducts]);

  return (
    <main className="bg-background min-h-screen py-8 md:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* === 프로필 섹션 === */}
        <div className="bg-card border-border mb-8 rounded-lg border p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              {isLoading ? (
                // 로딩 중일 때: 회색 박스(스켈레톤) 깜빡임
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                // 로딩 끝남: 실제 닉네임과 가입일 표시
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
                  <DialogDescription>
                    새 정보를 입력하고 변경하기 버튼을 눌러주세요.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nickname" className="text-right">
                      닉네임
                    </Label>
                    <Input
                      id="nickname"
                      value={nicknameInput}
                      maxLength={8}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      className="col-span-3"
                      placeholder="새 닉네임 (8자 이하)"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phoneNumber" className="text-right">
                      전화번호
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumberInput}
                      onChange={(e) => setPhoneNumberInput(e.target.value)}
                      className="col-span-3"
                      placeholder="예: 010-1234-5678"
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

        {/* === 구매 내역 섹션 === */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">구매 내역</h2>

          {/* 요약 바 */}
          <div className="border-border bg-card mb-6 rounded-lg border p-4">
            <div className="grid grid-cols-3 text-center text-sm">
              <div>
                <p className="text-muted-foreground">전체</p>
                <p className="text-foreground mt-1 text-xl font-semibold">
                  {purchasedProducts.length + purchaseOngoingProducts.length}
                </p>
              </div>
              <div className="border-border border-l">
                <p className="text-muted-foreground">구매 중</p>
                <p className="text-foreground mt-1 text-xl font-semibold">
                  {purchaseOngoingProducts.length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">구매 완료</p>
                <p className="text-foreground mt-1 text-xl font-semibold">
                  {purchasedProducts.length}
                </p>
              </div>
            </div>
          </div>

          {/* 목록: 구매 중 */}
          <div className="mb-6">
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">
              구매 중
            </h3>
            <div className="border-border bg-card rounded-lg border">
              {purchaseOngoingProducts.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    현재 구매 중인 상품이 없습니다.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-lg bg-transparent"
                  >
                    <Link href="/">상품 둘러보러 가기</Link>
                  </Button>
                </div>
              ) : (
                purchaseOngoingProducts.map((product) => (
                  <ProductListItem
                    key={product.productId}
                    id={product.productId}
                    name={product.productName}
                    price={product.price}
                    subText={`전체 입찰 횟수: ${product.bidCount}`}
                  />
                ))
              )}
            </div>
          </div>

          {/* 목록: 구매 완료 */}
          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">
              구매 완료
            </h3>
            <div className="border-border bg-card rounded-lg border">
              {purchasedProducts.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    구매 완료된 상품이 없습니다.
                  </p>
                </div>
              ) : (
                purchasedProducts.map((product) => (
                  <ProductListItem
                    key={product.productId}
                    id={product.productId}
                    name={product.productName}
                    price={product.bidPrice}
                    status={product.productStatus}
                    badgeText="구매 완료"
                    subText="종료"
                  />
                ))
              )}
            </div>
          </div>
        </section>

        {/* === 판매 내역 섹션 === */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">판매 내역</h2>

          {/* 요약 바 */}
          <div className="border-border bg-card mb-6 rounded-lg border p-4">
            <div className="grid grid-cols-3 text-center text-sm">
              <div>
                <p className="text-muted-foreground">전체</p>
                <p className="text-foreground mt-1 text-xl font-semibold">
                  {sellingProducts.length}
                </p>
              </div>
              <div className="border-border border-l">
                <p className="text-muted-foreground">판매 중</p>
                <p className="text-foreground mt-1 text-xl font-semibold">
                  {sellingOngoing.length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">판매 완료</p>
                <p className="text-foreground mt-1 text-xl font-semibold">
                  {sellingCompleted.length}
                </p>
              </div>
            </div>
          </div>

          {/* 목록: 판매 중 */}
          <div className="mb-6">
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">
              판매 중
            </h3>
            <div className="border-border bg-card rounded-lg border">
              {sellingOngoing.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    현재 판매 중인 상품이 없습니다.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-lg bg-transparent"
                  >
                    <Link href="/products/create">상품 등록하러 가기</Link>
                  </Button>
                </div>
              ) : (
                sellingOngoing.map((product) => (
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

          {/* 목록: 판매 완료 */}
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
                    subText="종료"
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
