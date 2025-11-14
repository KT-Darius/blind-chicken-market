"use client";

import type { Product, ProductListResponse } from "@/types";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const mockUser = {
  nickname: "익명 사용자 #4821",
  joinDate: "2024년 11월 가입",
  rating: 4.8,
  reviews: 127,
  wins: 23,
  active: 5,
};

type UserProfile = {
  nickname: string;
  joinDate: string;
  rating: number;
  reviews: number;
  wins: number;
  active: number;
}

const mockAuctions = [
  {
    id: 1,
    title: "판매: iPhone 13",
    status: "active",
    price: 450000,
    role: "seller",
  },
  {
    id: 2,
    title: "낙찰: 디자이너 시계",
    status: "completed",
    price: 280000,
    role: "buyer",
  },
  {
    id: 3,
    title: "판매: 빈티지 카메라",
    status: "active",
    price: 180000,
    role: "seller",
  },
  {
    id: 4,
    title: "낙찰: 게이밍 노트북",
    status: "completed",
    price: 620000,
    role: "buyer",
  },
];

export default function MyPage() {
  const { updateNickname } = useAuth();
  const router = useRouter();      
  const [activeTab, setActiveTab] = useState("activity");
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [nickname, setNickname] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sellingProducts, setSellingProducts] = useState<Product[]>([]);

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
        const response = await axios.get(
          `${API_BASE_URL}/api/users/me`,
          { withCredentials: true }
        );

        const apiUser = response.data;

        const fetchedUser: UserProfile = {
          nickname: apiUser.nickname ?? mockUser.nickname,
          joinDate: apiUser.createdAt
            ? formatJoinDate(apiUser.createdAt)
            : mockUser.joinDate,
          rating: apiUser.rating ?? mockUser.rating,
          reviews: apiUser.reviews ?? mockUser.reviews,
          wins: apiUser.wins ?? mockUser.wins,
          active: apiUser.active ?? mockUser.active,
        };

        setUser(fetchedUser);
        setNickname(fetchedUser.nickname);
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
        setUser(mockUser);
        setNickname(mockUser.nickname);
      }
    };

    // 🔹 2) 내가 등록한 상품(판매 중 상품) 가져오기
    const fetchUserProducts = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/users/me/products`,
          { withCredentials: true }
        );

        const data = response.data;

        // 응답이 배열인지 content[]인지 모두 처리
        const products: Product[] = Array.isArray(data)
          ? data
          : data?.content ?? [];

        setSellingProducts(products);
      } catch (error) {
        console.error("판매중 상품 조회 실패:", error);
        setSellingProducts([]);
      }
    };

    // 🔥 useEffect 실행할 때 두 개 다 호출
    fetchUserAndSetNickname();
    fetchUserProducts(); // ← 바로 여기가 핵심!!
  }, [router]);

  // 3. 닉네임 저장 함수
  const handleSave = async () => {
    // 닉네임이 비어있으면 저장하지 않음
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    try {
      // 1. 서버에 보낼 데이터
      const requestData = {
        nickname: nickname,
      };

      // 2. API 명세서에 맞는 PATCH 요청 보내기
      await axios.patch(
        `${API_BASE_URL}/api/users/me/nickname`,
        requestData,
        { withCredentials: true }
      );

      // 3. 저장 성공 시, 현재 페이지의 user 상태를 바로 업데이트
      alert("닉네임이 성공적으로 변경되었습니다.");
      setUser(prevUser => ({
        ...prevUser!,
        nickname: nickname,
      }));
      updateNickname(nickname);

      setIsModalOpen(false);

      // 4. (중요) TODO: 모달 닫기
      // (다음 단계에서 모달을 자동으로 닫도록 처리합니다)

    } catch (err) {
      console.error("닉네임 수정 실패:", err);
      alert("닉네임 수정에 실패했습니다. 다시 시도해주세요.");
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
                    // onClick={handleEditProfile}은 <DialogTrigger>가 대신하므로 삭제합니다.
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
                새 닉네임을 입력하고 저장 버튼을 눌러주세요.
              </DialogDescription>
            </DialogHeader>

            {/* --- 닉네임 수정 폼 --- */}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nickname" className="text-right">
                  새 닉네임
                </Label>
                <Input
                  id="nickname"
                  value={nickname} 
                  onChange={(e) => setNickname(e.target.value)}
                  className="col-span-3"
                  placeholder="새 닉네임을 입력하세요"
                />
              </div>
            </div>
            {/* --- 폼 끝 --- */}
            
            <DialogFooter>
              <Button onClick={handleSave}> {/* 👈 3. 15-A에서 만든 저장 함수와 연결 */}
                저장하기
              </Button>
            </DialogFooter>
          </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg bg-transparent"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-6 grid grid-cols-3 gap-4 md:gap-6">
            {/* Rating */}
            <div className="bg-card border-border space-y-2 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                평점
              </p>
              <div className="flex items-center gap-2">
                <p className="text-foreground text-3xl font-bold">
                  {user.rating}
                </p>
                <div className="flex gap-1">{renderStars(user.rating)}</div>
              </div>
              <p className="text-muted-foreground text-xs">
                {user.reviews}개 리뷰
              </p>
            </div>

            {/* Wins */}
            <div className="bg-card border-border space-y-2 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                낙찰
              </p>
              <p className="text-foreground text-3xl font-bold">
                {user.wins}
              </p>
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

        {/* Tabs */}
        <div className="border-border -mx-4 mb-8 border-b px-4">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: "activity", label: "활동" },
              { id: "selling", label: "판매 중" },
              { id: "watchlist", label: "관심 상품" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "text-foreground border-foreground"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}

        {/* 1) 활동 탭: 기존 목업 데이터 유지 */}
        {activeTab === "activity" && (
          <div className="space-y-3">
            {mockAuctions.map((item) => (
              <Link key={item.id} href={`/product/${item.id}`}>
                <div className="border-border hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors">
                  <div className="flex-1">
                    <p className="text-foreground font-medium">
                      {item.title}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        variant={
                          item.role === "seller" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {item.role === "seller" ? "판매" : "낙찰"}
                      </Badge>
                      <p className="text-muted-foreground text-xs">
                        {item.status === "active" ? "진행 중" : "완료"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground text-lg font-bold">
                      ₩{item.price.toLocaleString()}
                    </p>
                    <p
                      className={`mt-1 text-xs font-medium ${
                        item.status === "active"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.status === "active" ? "진행 중" : "완료"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 2) 판매중 탭: 실제 백엔드 데이터(sellingProducts) 사용 */}
        {activeTab === "selling" && (
          <div className="space-y-3">
            {sellingProducts.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-muted-foreground mb-4">
                  현재 판매 중인 상품이 없습니다.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-lg bg-transparent"
                >
                  <Link href="/products/create">상품 등록하러가기</Link>
                </Button>
              </div>
            )}

            {sellingProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="border-border hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors">
                  <div className="flex-1">
                    {/* 상품 이름 */}
                    <p className="text-foreground font-medium">
                      {product.name}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="default" className="text-xs">
                        판매
                      </Badge>
                      <p className="text-muted-foreground text-xs">
                        {product.productStatus ?? "진행 중"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {/* 입찰가 있으면 bidPrice, 없으면 시작가(startPrice) */}
                    <p className="text-foreground text-lg font-bold">
                      ₩{(product.bidPrice ?? product.startPrice).toLocaleString()}
                    </p>
                    <p className="text-primary mt-1 text-xs font-medium">
                      진행중
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}



        {/* Watchlist Tab */}
        {activeTab === "watchlist" && (
          <div className="py-16 text-center">
            <p className="text-muted-foreground mb-4">관심 상품이 없습니다.</p>
            <Button
              asChild
              variant="outline"
              className="rounded-lg bg-transparent"
            >
              <Link href="/">둘러보기 시작</Link>
            </Button>
          </div>
        )}

        <br />
        {/* Back Link */}
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
        >
          ← 홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
