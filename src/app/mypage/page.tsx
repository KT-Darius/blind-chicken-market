"use client";

import type { MypageProductBid, Product, WinnerDetails } from "@/types";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/hooks/user/useAuth";
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
import { Edit2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// 초기화용 목업 데이터
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

// 🔹 날짜 포맷 변환 함수 (2025-11-14... -> 2025년 11월 가입)
const formatJoinDate = (isoString: string) => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}년 ${month}월 가입`;
};

// 🔹 상품 상태 라벨 변환 함수 (ENG -> 한글)
const getProductStatusLabel = (status?: string) => {
  if (!status) return "";
  const upper = status.toUpperCase();
  const item = PRODUCT_STATUS.find((s) => s.value === upper);
  return item ? item.label : status;
};

export default function MyPage() {
  const { updateNickname } = useAuth(); // logout은 사용하지 않아 제거함
  const router = useRouter();

  // --- State 관리 ---
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 수정 모달용 Input State
  const [nicknameInput, setNicknameInput] = useState("");
  const [phoneNumberInput, setPhoneNumberInput] = useState("");

  // 상품 목록 State
  const [sellingProducts, setSellingProducts] = useState<Product[]>([]);
  const [purchaseOngoingProducts, setPurchaseOngoingProducts] = useState<MypageProductBid[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<WinnerDetails[]>([]);

  // --- 1. 데이터 불러오기 (useEffect) ---
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const apiUser = response.data;

        // 상품 리스트 상태 업데이트
        setSellingProducts(apiUser.products ?? []);
        setPurchasedProducts(apiUser.winners ?? []);
        setPurchaseOngoingProducts(apiUser.productBids ?? []);

        // 사용자 프로필 상태 구성
        const fetchedUser: UserProfile = {
          nickname: apiUser.nickname ?? INITIAL_USER.nickname,
          joinDate: apiUser.createdAt
            ? formatJoinDate(apiUser.createdAt)
            : INITIAL_USER.joinDate,
          rating: apiUser.rating ?? INITIAL_USER.rating,
          reviews: apiUser.reviews ?? INITIAL_USER.reviews,
          phoneNumber:
            apiUser.phoneNumber && String(apiUser.phoneNumber).trim() !== ""
              ? String(apiUser.phoneNumber)
              : INITIAL_USER.phoneNumber,
        };

        // 사용자 정보 업데이트 및 모달 입력값 초기화
        setUser(fetchedUser);
        setNicknameInput(fetchedUser.nickname);
        setPhoneNumberInput(fetchedUser.phoneNumber);

      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          // 인증 오류(401, 403) 발생 시 처리 로직이 필요하면 여기에 추가
          if (status === 401 || status === 403) {
            return;
          }
        }
        // 에러 발생 시 목업 데이터 유지
        setUser(INITIAL_USER);
        setNicknameInput(INITIAL_USER.nickname);
        setPhoneNumberInput(INITIAL_USER.phoneNumber);
      }
    };

    fetchUserInfo();
  }, [router]);

  // --- 2. 프로필 수정 핸들러 ---
  const handleSave = async () => {
    if (!nicknameInput.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }
    if (nicknameInput.trim().length > 8) {
      alert("닉네임은 8자 이하로 입력해주세요.");
      return;
    }
    if (!phoneNumberInput.trim()) {
      alert("전화번호를 입력해주세요.");
      return;
    }

    try {
      const userInfoRequestData = {
        nickname: nicknameInput,
        phoneNumber: phoneNumberInput,
      };

      const result = await axios.put(
        `${API_BASE_URL}/api/users/me`,
        userInfoRequestData,
        { withCredentials: true }
      );

      if (result.status === 200) {
        alert("프로필이 성공적으로 변경되었습니다.");

        // 화면 데이터 즉시 업데이트
        setUser((prev) => ({
          ...prev,
          nickname: nicknameInput,
          phoneNumber: phoneNumberInput,
        }));

        // 전역 상태 업데이트 및 모달 닫기
        updateNickname(nicknameInput);
        setIsModalOpen(false);
      }
    } catch (err) {
      alert("프로필 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // --- 3. 데이터 필터링 (판매 중 / 판매 완료 구분) ---
  const sellingOngoingProducts = sellingProducts.filter(
    (product) => product.bidStatus !== "COMPLETED"
  );

  const soldOutProducts = sellingProducts.filter(
    (product) => product.bidStatus === "COMPLETED"
  );

  return (
    <main className="bg-background min-h-screen py-8 md:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* --- 프로필 헤더 섹션 --- */}
        <div className="bg-card border-border mb-8 rounded-lg border p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-foreground text-2xl font-bold md:text-3xl">
                {user.nickname}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {user.joinDate}
              </p>
            </div>
            
            <div className="flex gap-2">
              {/* 프로필 수정 모달 */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-lg bg-transparent"
                  >
                    <Edit2 className="h-4 w-4" />
                    프로필 수정
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
                    {/* 닉네임 입력 */}
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
                        placeholder="새 닉네임을 입력하세요"
                      />
                    </div>

                    {/* 전화번호 입력 */}
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
        </div>

        {/* --- 구매 내역 섹션 --- */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">구매 내역</h2>

          {/* 상단 요약 바 */}
          <div className="mb-6 rounded-lg border border-border bg-card p-4">
            <div className="grid grid-cols-3 text-center text-sm">
              <div>
                <p className="text-muted-foreground">전체</p>
                <p className="mt-1 text-foreground text-xl font-semibold">
                  {purchasedProducts.length + purchaseOngoingProducts.length}
                </p>
              </div>
              <div className="border-l border-border">
                <p className="text-muted-foreground">구매 중</p>
                <p className="mt-1 text-foreground text-xl font-semibold">
                  {purchaseOngoingProducts.length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">구매 완료</p>
                <p className="mt-1 text-foreground text-xl font-semibold">
                  {purchasedProducts.length}
                </p>
              </div>
            </div>
          </div>

          {/* 구매 중 리스트 */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">구매 중</h3>
            <div className="space-y-3">
              {purchaseOngoingProducts.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">현재 구매 중인 상품이 없습니다.</p>
                  <Button asChild variant="outline" className="rounded-lg bg-transparent">
                    <Link href="/">상품 둘러보러 가기</Link>
                  </Button>
                </div>
              )}
              {purchaseOngoingProducts.map((product) => (
                <div key={product.productId} className="hover:bg-muted cursor-pointer p-4 transition-colors border-b last:border-b-0">
                  <Link href={`/products/${product.productId}`} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{product.productName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground text-lg font-bold">₩{product.price.toLocaleString()}</p>
                      <p className="text-muted-foreground text-xs">전체 입찰 횟수: {product.bidCount}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* 구매 완료 리스트 */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">구매 완료</h3>
            <div className="space-y-3">
              {purchasedProducts.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">구매 완료된 상품이 없습니다.</p>
                </div>
              )}
              {purchasedProducts.map((product) => (
                <Link key={product.productId} href={`/products/${product.productId}`}>
                  <div className="border-border hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors">
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{product.productName}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">구매 완료</Badge>
                        <p className="text-muted-foreground text-xs">상태: {getProductStatusLabel(product.productStatus)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground text-lg font-bold">₩{(product.bidPrice).toLocaleString()}</p>
                      <p className="text-muted-foreground mt-1 text-xs font-medium">종료</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* --- 판매 내역 섹션 --- */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">판매 내역</h2>

          {/* 상단 요약 바 */}
          <div className="mb-6 rounded-lg border border-border bg-card p-4">
            <div className="grid grid-cols-3 text-center text-sm">
              <div>
                <p className="text-muted-foreground">전체</p>
                <p className="mt-1 text-foreground text-xl font-semibold">{sellingProducts.length}</p>
              </div>
              <div className="border-l border-border">
                <p className="text-muted-foreground">판매 중</p>
                <p className="mt-1 text-foreground text-xl font-semibold">{sellingOngoingProducts.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">판매 완료</p>
                <p className="mt-1 text-foreground text-xl font-semibold">{soldOutProducts.length}</p>
              </div>
            </div>
          </div>

          {/* 판매 중 리스트 */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">판매 중</h3>
            <div className="space-y-3">
              {sellingOngoingProducts.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">현재 판매 중인 상품이 없습니다.</p>
                  <Button asChild variant="outline" className="rounded-lg bg-transparent">
                    <Link href="/products/create">상품 등록하러 가기</Link>
                  </Button>
                </div>
              )}
              {sellingOngoingProducts.map((product) => (
                <div key={product.id} className="hover:bg-muted cursor-pointer p-4 transition-colors border-b last:border-b-0">
                  <Link href={`/products/${product.id}`} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{product.name}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <p className="text-muted-foreground text-xs">상태: {getProductStatusLabel(product.productStatus)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground text-lg font-bold">
                        ₩{(product.bidPrice ?? product.startPrice).toLocaleString()}
                      </p>
                      <p className="text-muted-foreground text-xs">전체 입찰 횟수: {product.bidCount}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* 판매 완료 리스트 */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">판매 완료</h3>
            <div className="space-y-3">
              {soldOutProducts.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">판매 완료된 상품이 없습니다.</p>
                </div>
              )}
              {soldOutProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <div className="border-border hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors">
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{product.name}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">판매 완료</Badge>
                        <p className="text-muted-foreground text-xs">상태: {getProductStatusLabel(product.productStatus)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground text-lg font-bold">
                        ₩{(product.bidPrice ?? product.startPrice).toLocaleString()}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs font-medium">종료</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}