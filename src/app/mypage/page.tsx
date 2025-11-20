"use client";

import type { MypageProductBid, Product, ProductBid, WinnerDetails } from "@/types";
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
import { Edit2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/hooks/user/useAuth";
import { PRODUCT_STATUS } from "@/lib/constants";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const mockUser = {
  nickname: "익명 사용자 #4821",
  joinDate: "2024년 11월 가입",
  rating: 4.8,
  reviews: 127,
  phoneNumber: "010-0000-0000",
};

type UserProfile = {
  nickname: string;
  joinDate: string;
  rating: number;
  reviews: number;
  phoneNumber: string;
};

export default function MyPage() {
  const { updateNickname, logout } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sellingProducts, setSellingProducts] = useState<Product[]>([]);
  const [purchaseOngoingProducts, setPurchaseOngoingProducts] = useState<MypageProductBid[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<WinnerDetails[]>([]);

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
      const fetchUserInfo = async () => {
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.get(`${API_BASE_URL}/api/users/me`, { 
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const apiUser = response.data;

          console.log("API에서 가져온 사용자 정보:", apiUser);
          setSellingProducts(apiUser.products ?? []); // 초기화
          setPurchasedProducts(apiUser.winners ?? []); // 초기화
          setPurchaseOngoingProducts(apiUser.productBids ?? []); // 초기화

          const fetchedUser: UserProfile = {
            nickname: apiUser.nickname ?? mockUser.nickname,
            joinDate: apiUser.createdAt
              ? formatJoinDate(apiUser.createdAt)
              : mockUser.joinDate,
            rating: apiUser.rating ?? mockUser.rating,
            reviews: apiUser.reviews ?? mockUser.reviews,

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

            // 🔹 인증 오류면: 진짜로 로그아웃 + 로그인 페이지 이동
            if (status === 401 || status === 403) {
              console.warn("인증 오류로 401/403 발생:", error);
              
              // alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
              // 전역 Auth 상태 비우기
              // logout();
              // router.replace("/login");

              return;
            }
          }

          // 🔹 그 외의 오류일 때만 콘솔 찍고, 목업으로 대체할지 말지 결정
          console.error("사용자 정보 가져오기 실패:", error);

          // 굳이 목업을 쓰고 싶으면 아래 3줄 유지,
          // "그냥 비워두고 싶다"면 이 3줄 지워도 됨
          setUser(mockUser);
          setNickname(mockUser.nickname);
          setPhoneNumber(mockUser.phoneNumber);
        }
      };

      // 🔹 2) 내가 등록한 상품(판매 중 상품) 가져오기
      // const fetchUserProducts = async () => {
      //   try {
      //     const response = await axios.get(
      //       `${API_BASE_URL}/api/users/me/products`,
      //       { withCredentials: true },
      //     );

      //     const data = response.data;

      //     // 응답이 배열인지 content[]인지 모두 처리
      //     const products: Product[] = Array.isArray(data)
      //       ? data
      //       : (data?.content ?? []);

      //     setSellingProducts(products);
      //   } catch (error) {
      //     console.error("판매중 상품 조회 실패:", error);
      //     setSellingProducts([]);
      //   }
      // };

      // 🔹 3) 내가 구매한 상품(구매 내역) 가져오기
      // ⚠️ 백엔드와 실제로 합의된 엔드포인트로 반드시 수정해야 합니다.
      // 예: /api/users/me/purchases, /api/users/me/bids, /api/users/me/orders 등
      // const fetchPurchasedProducts = async () => {
      //   try {
      //     const response = await axios.get(
      //       `${API_BASE_URL}/api/users/me/purchases`, // ✅ 나중에 백엔드에서 정해준 URL로 변경
      //       { withCredentials: true },
      //     );

      //     const data = response.data;

      //     // 응답이 배열인지 content[]인지 모두 처리
      //     const products: Product[] = Array.isArray(data)
      //       ? data
      //       : (data?.content ?? []);

      //     setPurchasedProducts(products);
      //   } catch (error) {
      //     console.error("구매 내역 조회 실패:", error);
      //     setPurchasedProducts([]); // 실패 시 깔끔하게 빈 배열
      //   }
      // };

      // useEffect 실행할 때 세 개 다 호출
      fetchUserInfo();
      // fetchUserProducts();
      // fetchPurchasedProducts();
    }, [router]);


    // 3. 프로필 저장 함수 (닉네임 + 전화번호)
    const handleSave = async () => {
      // 닉네임이 비어있으면 저장하지 않음
      if (!nickname.trim()) {
        alert("닉네임을 입력해주세요.");
        return;
      }

      if (nickname.trim().length > 8) {
        alert("닉네임은 8자 이하로 입력해주세요.");
        return;
      }


      // 전화번호가 비어있으면 저장하지 않음
      if (!phoneNumber.trim()) {
        alert("전화번호를 입력해주세요.");
        return;
      }

      try {
        // 1. 서버에 보낼 데이터들
        const userInfoRequestData = {
          nickname: nickname,
          phoneNumber: phoneNumber,
        };

        // 2-1. UserInfo PUT 요청
        const result = await axios.put(
          `${API_BASE_URL}/api/users/me`,
          userInfoRequestData,
          {
            withCredentials: true,
          },
        );

        if(result.status === 200) {
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
        }
      } catch (err) {
        console.error("프로필 수정 실패:", err);
        alert("프로필 수정에 실패했습니다. 다시 시도해주세요.");
      }
    };

  // 4. 서버 데이터 받음
  // 5. 화면에 렌더링, useState
  // 6. 백엔드 api주소 변경 확인
  // 7. postman으로 api작동 확인
  // 8. 디버깅 또는 오류 수정
  // const renderStars = (rating: number) => {
  //   return Array.from({ length: 5 }).map((_, i) => (
  //     <Star
  //       key={i}
  //       className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-foreground text-foreground" : "text-border"}`}
  //     />
  //   ));
  // };

  // 🔹 productStatus 값 기준으로 판매중 / 판매완료 분리
  const sellingOngoingProducts = sellingProducts.filter(
    (product) => product.bidStatus !== "COMPLETED", // 판매 완료가 아닌 것들
  );

  const soldOutProducts = sellingProducts.filter(
    (product) => product.bidStatus === "COMPLETED", // 판매 완료된 것들
  );

  // 🔹 상품 상태 값을 한글 라벨("좋음" 등)로 변환하는 함수
  const getProductStatusLabel = (status?: string) => {
    if (!status) return "";

    // 백엔드에서 "good", "Good", "GOOD" 섞여 올 수 있으니까 대문자로 통일
    // yoojin: GOOD, good, Good 섞여서 나오지 않음, 2525-11-18
    const upper = status.toUpperCase();

    // constants.ts 에서 가져온 매핑 테이블에서 value 비교
    const item = PRODUCT_STATUS.find((s) => s.value === upper);

    // 찾으면 label(좋음/보통/나쁨) 리턴, 못 찾으면 원래 값 그대로
    return item ? item.label : status;
  };


  // 🔹 productStatus 값 기준으로 구매 중 / 구매 완료 분리 
  // const purchasingOngoingProducts = purchasedProducts.filter(
  //   (product) => product.productStatus !== "SOLD", // 진행 중인 구매(입찰 중)
  // );

  // const purchasingCompletedProducts = purchasedProducts.filter(
  //   (product) => product.productStatus === "SOLD", // 구매 완료된 것들
  // );


  return (
    <main className="bg-background min-h-screen py-8 md:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
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
                        maxLength={8}
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
                  {purchasedProducts.length + purchaseOngoingProducts.length}
                </p>
              </div>

              {/* 입찰 중 (구매 진행 중) */}
              <div className="border-l border-border">
                <p className="text-muted-foreground">구매 중</p>
                <p className="mt-1 text-foreground text-xl font-semibold">
                  {purchaseOngoingProducts.length}
                </p>
              </div>

              {/* 종료 = 구매 완료 */}
              <div>
                <p className="text-muted-foreground">구매 완료</p>
                <p className="mt-1 text-foreground text-xl font-semibold">
                  {purchasedProducts.length}
                </p>
              </div>
            </div>
          </div>

          {/* (1) 구매 중 그룹 */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              구매 중
            </h3>
            <div className="space-y-3">
              {purchaseOngoingProducts.length === 0 && (
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

              {purchaseOngoingProducts.map((product) => (
                                <div
                  key={product.productId}
                  className="hover:bg-muted cursor-pointer p-4 transition-colors border-b last:border-b-0"
                >
                  <Link
                    href={`/products/${product.productId}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      {/* 상품 이름 */}
                      <p className="text-foreground font-medium">
                        {product.productName}
                      </p>
                    </div>

                    <div className="text-right">
                      {/* 입찰가 있으면 bidPrice, 없으면 시작가(startPrice) */}
                      <p className="text-foreground text-lg font-bold">
                        ₩{product.price.toLocaleString()}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        전체 입찰 횟수: {product.bidCount}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* (2) 구매 완료 그룹 */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              구매 완료
            </h3>
            <div className="space-y-3">
              {purchasedProducts.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    구매 완료된 상품이 없습니다.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-lg bg-transparent"
                  >
                  </Button>
                </div>
              )}

              {purchasedProducts.map((product) => (
                <Link key={product.productId} href={`/products/${product.productId}`}>
                  <div className="border-border hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors">
                    <div className="flex-1">
                      {/* 상품 이름 */}
                      <p className="text-foreground font-medium">
                        {product.productName}
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
                        {(product.bidPrice).toLocaleString()}
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
                <p className="text-muted-foreground">판매 중</p>
                <p className="mt-1 text-foreground text-xl font-semibold">
                  {sellingOngoingProducts.length}
                </p>
              </div>

              {/* 종료 = 판매 완료 */}
              <div>
                <p className="text-muted-foreground">판매 완료</p>
                <p className="mt-1 text-foreground text-xl font-semibold">
                  {soldOutProducts.length}
                </p>
              </div>
            </div>
          </div>

          {/* (1) 판매 중 그룹 */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              판매 중
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
                <div
                  key={product.id}
                  className="hover:bg-muted cursor-pointer p-4 transition-colors border-b last:border-b-0"
                >
                  <Link
                    href={`/products/${product.id}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      {/* 상품 이름 */}
                      <p className="text-foreground font-medium">
                        {product.name}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <p className="text-muted-foreground text-xs">
                          상태: {getProductStatusLabel(product.productStatus)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {/* 입찰가 있으면 bidPrice, 없으면 시작가(startPrice) */}
                      <p className="text-foreground text-lg font-bold">
                        ₩{(product.bidPrice ?? product.startPrice).toLocaleString()}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        전체 입찰 횟수: {product.bidCount}
                      </p>
                    </div>
                  </Link>
                </div>
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