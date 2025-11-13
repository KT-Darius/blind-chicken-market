// === User & Auth Types ===
export interface User {
  id: string;
  email: string;
  nickname?: string;
  [key: string]: unknown;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean; // 인증 로딩 상태
  login: (token: string, userData: User) => void;
  logout: () => void;
}

// === Bid Types ===

export interface Bid {
  bidder: string; // (입찰자 닉네임 또는 ID)
  amount: number;
  time: Date;
}

// === Product Types ===

/**
 * API에서 받아오는 상품 데이터 (목록 또는 상세)
 */
export interface Product {
  id: number;
  name: string;
  image_url: string; // (대표 이미지 URL)
  description?: string;
  currentBid: number; // (현재 입찰가)
  minBid?: number; // (최소 입찰가)
  bids: number; // (총 입찰 수)
  timeLeft: string; // (남은 시간, e.g., "2h 15m" or ISO string)
  status: string; // (e.g., 'ACTIVE', 'SOLD', 'ENDED')
  seller?: string; // (판매자 닉네임)
  condition?: string; // (e.g., 'GOOD', 'AVERAGE')
  category?: string; // (e.g., 'ELECTRONICS')
  bidHistory?: Bid[];
}

/**
 * 상품 등록 4단계 폼(Form)의 데이터 구조
 */
export type ProductFormData = {
  title: string;
  category: string; // (ERD ENUM: 'ELECTRONICS', 'FASHION'...)
  condition: string; // (ERD ENUM: 'GOOD', 'AVERAGE'...)
  description: string;
  startingPrice: string; // (UI에서는 string, 전송 시 number로 변환)
  duration: string; // (UI에서는 string, 전송 시 number로 변환)
};
