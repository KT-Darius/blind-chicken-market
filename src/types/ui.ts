import type { User } from "./api";

// === 프론트 컨텍스트 ===
export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

// === 입찰 내역 ===
export interface Bid {
  bidder: string;
  amount: number;
  time: string;
}

// === 상품 등록/폼 상태 ===
export type ProductFormData = {
  name: string;
  description: string;
  category: string;
  startPrice: string; // string으로 입력받고, 전송 시 number로 변환
  bidEndDate?: string; // 경매 종료 날짜 (YYYY-MM-DD)
  productStatus: "GOOD" | "BAD" | "NEW" | string;
  imageUrl?: string;
};
