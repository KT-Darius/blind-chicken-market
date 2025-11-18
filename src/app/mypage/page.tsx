"use client";

import type { Product } from "@/types";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Star, LogOut, Edit2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/hooks/user/useAuth";
import { PRODUCT_STATUS } from "@/lib/constants";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const mockUser = {
  nickname: "익명 사용자 #4821",
  joinDate: "2024년 11월 가입",
  rating: 4.8,
  reviews: 127,
  wins: 23,
  active: 5,
  phoneNumber: "010-0000-0000",
};

type UserProfile = {
  nickname: string;
  joinDate: string;
  rating: number;
  reviews: number;
  wins: number;
  active: number;
  phoneNumber: string;
};

export default function MyPage() {
  const { updateNickname } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sellingProducts, setSellingProducts] = useState<Product[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);

    // 1. 화면에 진입했을때 useEffect
    useEffect(() => {
      // createdAt(예: 2025-11-14T15:16:03.104117)을
      // "2025년 11월 가입" 형태로 바꾸는 함수
      const formatJoinDate = (isoString: string) => {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 0부터 시작하니까 +1
        return `${year}년 ${month}월 가입`;
      };

      // 🔹 1) 유저 기본 정보 가져오기
      const fetchUserAndSetNickname = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
            withCredentials: true,
          });

          const apiUser = response.data;
          console.log("🔍 /api/users/me 응답:", apiUser);

          const fetchedUser: UserProfile = {
            nickname: apiUser.nickname ?? mockUser.nickname,
            joinDate: apiUser.createdAt
              ? formatJoinDate(apiUser.createdAt)
              : mockUser.joinDate,
            rating: apiUser.rating ?? mockUser.rating,
            reviews: apiUser.reviews ?? mockUser.reviews,
            wins: apiUser.wins ?? mockUser.wins,
            active: apiUser.active ?? mockUser.active,

            // ✅ 전화번호: 서버에서 값이 비어 있거나(null/undefined/빈문자열) 하면 목업 값으로 대체
            //  - 백엔드 필드명이 phoneNumber가 아니면 여기만 바꾸면 됨
            phoneNumber:
              apiUser.phoneNumber && String(apiUser.phoneNumber).trim() !== ""
                ? String(apiUser.phoneNumber)
                : mockUser.phoneNumber,
          };

          // ✅ user 상태 및 모달 입력값 동기화
          setUser(fetchedUser);
          setNickname(fetchedUser.nickname);
          setPhoneNumber(fetchedUser.phoneNumber);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            if (status === 401 || status === 403) {
              console.warn("인증 오류로 401/403 발생:", error);
              alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
              router.push("/login");
              return;
            }
          }

          console.error("사용자 정보 가져오기 실패:", error);
          // 실패 시에도 목업 정보로 상태 세팅
          setUser(mockUser);
          setNickname(mockUser.nickname);
          setPhoneNumber(mockUser.phoneNumber);
        }
      };

      // 🔹 2) 내가 등록한 상품(판매 중 상품) 가져오기
      const fetchUserProducts = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/users/me/products`,
            { withCredentials: true },
          );

          const data = response.data;

          // 응답이 배열인지 content[]인지 모두 처리
          const products: Product[] = Array.isArray(data)
            ? data
            : (data?.content ?? []);

          setSellingProducts(products);
        } catch (error) {
          console.error("판매중 상품 조회 실패:", error);
          setSellingProducts([]);
        }
      };

      // 🔹 3) 내가 구매한 상품(구매 내역) 가져오기
      // ⚠️ 백엔드와 실제로 합의된 엔드포인트로 반드시 수정해야 합니다.
      // 예: /api/users/me/purchases, /api/users/me/bids, /api/users/me/orders 등
      const fetchPurchasedProducts = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/users/me/purchases`, // ✅ 나중에 백엔드에서 정해준 URL로 변경
            { withCredentials: true },
          );

          const data = response.data;

          // 응답이 배열인지 content[]인지 모두 처리
          const products: Product[] = Array.isArray(data)
            ? data
            : (data?.content ?? []);

          setPurchasedProducts(products);
        } catch (error) {
          console.error("구매 내역 조회 실패:", error);
          setPurchasedProducts([]); // 실패 시 깔끔하게 빈 배열
        }
      };

      // useEffect 실행할 때 세 개 다 호출
      fetchUserAndSetNickname();
      fetchUserProducts();
      fetchPurchasedProducts();
    }, [router]);


    // 3. 프로필 저장 함수 (닉네임 + 전화번호)
    const handleSave = async () => {
      // 닉네임이 비어있으면 저장하지 않음
      if (!nickname.trim()) {
        alert("닉네임을 입력해주세요.");
        return;
      }

      // 전화번호가 비어있으면 저장하지 않음
      if (!phoneNumber.trim()) {
        alert("전화번호를 입력해주세요.");
        return;
      }

      try {
        // 1. 서버에 보낼 데이터들
        const nicknameRequestData = {
          nickname: nickname,
        };

        const phoneRequestData = {
          phoneNumber: phoneNumber,
        };

        // 2-1. 닉네임 PATCH 요청
        await axios.patch(
          `${API_BASE_URL}/api/users/me/nickname`,
          nicknameRequestData,
          {
            withCredentials: true,
          },
        );

        // 2-2. 전화번호 PATCH 요청
        // ⚠️ 여기 엔드포인트 URL은 백엔드에서 정해준 것과 맞춰야 합니다.
        // 예시로 /api/users/me/phone-number 로 작성해 둡니다.
        await axios.patch(
          `${API_BASE_URL}/api/users/me/phoneNumber`,
          phoneRequestData,
          {
            withCredentials: true,
          },
        );

        // 3. 저장 성공 시, 현재 페이지의 user 상태를 바로 업데이트
        alert("프로필이 성공적으로 변경되었습니다.");
        setUser((prevUser) => ({
          ...prevUser!,
          nickname: nickname,
          phoneNumber: phoneNumber,
        }));

        // 전역 auth 컨텍스트의 닉네임도 업데이트
        updateNickname(nickname);

        // 모달 닫기
        setIsModalOpen(false);
      } catch (err) {
        console.error("프로필 수정 실패:", err);
        alert("프로필 수정에 실패했습니다. 다시 시도해주세요.");
      }
    };


  // 🔹 로그아웃 함수
  const handleLogout = async () => {
    try {
      // 나중에 백엔드에서 로그아웃 API를 만들면
      // 여기 안에 axios.post(...) 한 줄만 추가
      // 예시:
      // await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });

      alert("로그아웃되었습니다.");
      router.push("/login"); // 로그인 페이지로 이동
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃 중 문제가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 4. 서버 데이터 받음
  // 5. 화면에 렌더링, useState
  // 6. 백엔드 api주소 변경 확인
  // 7. postman으로 api작동 확인
  // 8. 디버깅 또는 오류 수정
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-foreground text-foreground" : "text-border"}`}
      />
    ));
  };

  // 🔹 productStatus 값 기준으로 판매중 / 판매완료 분리
  const sellingOngoingProducts = sellingProducts.filter(
    (product) => product.productStatus !== "SOLD", // 판매 완료가 아닌 것들
  );

  const soldOutProducts = sellingProducts.filter(
    (product) => product.productStatus === "SOLD", // 판매 완료된 것들
  );

  // 🔹 상품 상태 값을 한글 라벨("좋음" 등)로 변환하는 함수
  const getProductStatusLabel = (status?: string) => {
    if (!status) return "";

    // 백엔드에서 "good", "Good", "GOOD" 섞여 올 수 있으니까 대문자로 통일
    const upper = status.toUpperCase();

    // constants.ts 에서 가져온 매핑 테이블에서 value 비교
    const item = PRODUCT_STATUS.find((s) => s.value === upper);

    // 찾으면 label(좋음/보통/나쁨) 리턴, 못 찾으면 원래 값 그대로
    return item ? item.label : status;
  };


  // 🔹 productStatus 값 기준으로 구매 중 / 구매 완료 분리 
  const purchasingOngoingProducts = purchasedProducts.filter(
    (product) => product.productStatus !== "SOLD", // 진행 중인 구매(입찰 중)
  );

  const purchasingCompletedProducts = purchasedProducts.filter(
    (product) => product.productStatus === "SOLD", // 구매 완료된 것들
  );


  return (
    <main className="bg-background min-h-screen py-8 md:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-card border-border mb-8 rounded-lg border p-6 md:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-foreground text-3xl font-bold md:text-4xl">
                {user.nickname}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {user.joinDate}
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                {/* 1. 이 버튼이 이제 모달을 엽니다 (기존 스타일 유지) */}
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

                {/* 2. 모달이 열리면 보일 내용 */}
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>프로필 수정</DialogTitle>
                    <DialogDescription>
                      새 정보를 입력하고 변경하기 버튼을 눌러주세요.
                    </DialogDescription>
                  </DialogHeader>

                  {/* --- 닉네임 + 전화번호 수정 폼 --- */}
                  <div className="grid gap-4 py-4">
                    {/* 닉네임 입력 */}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="nickname" className="text-right">
                        닉네임
                      </Label>
                      <Input
                        id="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
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
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="col-span-3"
                        placeholder="예: 010-1234-5678"
                      />
                    </div>
                  </div>
                  {/* --- 폼 끝 --- */}

                  <DialogFooter>
                    <Button onClick={handleSave}>변경하기</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="sm"
                className="rounded-lg bg-transparent"
                onClick={handleLogout} // 🔹 여기 추가
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </Button>
            </div>
          </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:gap-6">
            {/* Wins */}
            <div className="bg-card border-border space-y-2 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                낙찰
              </p>
              <p className="text-foreground text-3xl font-bold">{user.wins}</p>
              <p className="text-muted-foreground text-xs">총 낙찰 상품</p>
            </div>

            {/* Active Bids */}
            <div className="bg-card border-border space-y-2 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                진행 중인 입찰
              </p>
              <p className="text-foreground text-3xl font-bold">
                {user.active}
              </p>
              <p className="text-muted-foreground text-xs">현재 입찰 중</p>
            </div>
          </div>
        </div>

        {/* 메인 섹션들 */}

        {/* 1. 구매 내역 섹션 */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">구매 내역</h2>

          {/* 상단 요약 바: 전체 | 입찰 중  종료 */}
          <div className="mb-6 rounded-lg border border-border bg-card p-4">
            <div className="grid grid-cols-3 text-center text-sm">
              {/* 전체 */}
              <div>
                <p className="text-muted-foreground">전체</p>
                <p className="mt-1 text-foreground text-xl font-semibold">
                  {purchasedProducts.length}
                </p>
              </div>

              {/* 입찰 중 (구매 진행 중) */}
              <div className="border-l border-border">
                <p className="text-muted-foreground">입찰 중</p>
                <p className="mt-1 text-foreground text-xl font-semibold">
                  {purchasingOngoingProducts.length}
                </p>
              </div>

              {/* 종료 = 구매 완료 */}
              <div>
                <p className="text-muted-foreground">종료</p>
                <p className="mt-1 text-foreground text-xl font-semibold">
                  {purchasingCompletedProducts.length}
                </p>
              </div>
            </div>
          </div>

          {/* (1) 구매 중 그룹 */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              입찰 중
            </h3>
            <div className="space-y-3">
              {purchasingOngoingProducts.length === 0 && (
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
              )}

              {purchasingOngoingProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <div className="border-border hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors">
                    <div className="flex-1">
                      {/* 상품 이름 */}
                      <p className="text-foreground font-medium">
                        {product.name}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="default" className="text-xs">
                          구매 진행 중
                        </Badge>
                        <p className="text-muted-foreground text-xs">
                            상태: {getProductStatusLabel(product.productStatus)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {/* 입찰가 있으면 bidPrice, 없으면 시작가(startPrice) */}
                      <p className="text-foreground text-lg font-bold">
                        ₩
                        {(
                          product.bidPrice ?? product.startPrice
                        ).toLocaleString()}
                      </p>
                      <p className="text-primary mt-1 text-xs font-medium">
                        진행 중
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* (2) 구매 완료 그룹 */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              구매 완료
            </h3>
            <div className="space-y-3">
              {purchasingCompletedProducts.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    구매 완료된 상품이 없습니다.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-lg bg-transparent"
                  >
                    <Link href="/">상품 둘러보러 가기</Link>
                  </Button>
                </div>
              )}

              {purchasingCompletedProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <div className="border-border hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors">
                    <div className="flex-1">
                      {/* 상품 이름 */}
                      <p className="text-foreground font-medium">
                        {product.name}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          구매 완료
                        </Badge>
                        <p className="text-muted-foreground text-xs">
                          상태: {getProductStatusLabel(product.productStatus)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-foreground text-lg font-bold">
                        ₩
                        {(
                          product.bidPrice ?? product.startPrice
                        ).toLocaleString()}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs font-medium">
                        종료
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>



        {/* 2. 판매 내역 섹션 */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">판매 내역</h2>

          {/* 상단 요약 바: 전체 | 입찰 중  종료 */}
          <div className="mb-6 rounded-lg border border-border bg-card p-4">
            <div className="grid grid-cols-3 text-center text-sm">
              {/* 전체 */}
              <div>
                <p className="text-muted-foreground">전체</p>
                <p className="mt-1 text-foreground text-xl font-semibold">
                  {sellingProducts.length}
                </p>
              </div>

              {/* 입찰 중 (판매 진행 중) */}
              <div className="border-l border-border">
                <p className="text-muted-foreground">입찰 중</p>
                <p className="mt-1 text-foreground text-xl font-semibold">
                  {sellingOngoingProducts.length}
                </p>
              </div>

              {/* 종료 = 판매 완료 */}
              <div>
                <p className="text-muted-foreground">종료</p>
                <p className="mt-1 text-foreground text-xl font-semibold">
                  {soldOutProducts.length}
                </p>
              </div>
            </div>
          </div>

          {/* (1) 판매 중 그룹 */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              입찰 중
            </h3>
            <div className="space-y-3">
              {sellingOngoingProducts.length === 0 && (
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
              )}

              {sellingOngoingProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <div className="border-border hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors">
                    <div className="flex-1">
                      {/* 상품 이름 */}
                      <p className="text-foreground font-medium">
                        {product.name}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="default" className="text-xs">
                          판매 중
                        </Badge>
                        <p className="text-muted-foreground text-xs">
                          상태: {getProductStatusLabel(product.productStatus)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {/* 입찰가 있으면 bidPrice, 없으면 시작가(startPrice) */}
                      <p className="text-foreground text-lg font-bold">
                        ₩
                        {(
                          product.bidPrice ?? product.startPrice
                        ).toLocaleString()}
                      </p>
                      <p className="text-primary mt-1 text-xs font-medium">
                        진행 중
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* (2) 판매 완료 그룹 */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              판매 완료
            </h3>
            <div className="space-y-3">
              {soldOutProducts.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    판매 완료된 상품이 없습니다.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-lg bg-transparent"
                  >
                    <Link href="/products/create">상품 등록하러 가기</Link>
                  </Button>
                </div>
              )}

              {soldOutProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <div className="border-border hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors">
                    <div className="flex-1">
                      {/* 상품 이름 */}
                      <p className="text-foreground font-medium">
                        {product.name}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          판매 완료
                        </Badge>
                        <p className="text-muted-foreground text-xs">
                          상태: {getProductStatusLabel(product.productStatus)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-foreground text-lg font-bold">
                        ₩
                        {(
                          product.bidPrice ?? product.startPrice
                        ).toLocaleString()}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs font-medium">
                        종료
                      </p>
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