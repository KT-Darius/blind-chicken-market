// 정렬 정보
export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

// 페이지 정보
export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

// 회원정보
export interface User {
  id: number;
  nickname: string;
  email: string;
  role: "USER" | "ADMIN";
  phoneNumber: string;
}

// POST 회원가입
export interface SignUpRequest {
  email: string;
  password: string;
  nickname: string;
  phoneNumber: string;
}

// POST 로그인 요청 및 응답
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  accessToken: string;
  // refreshToken은 HttpOnly 쿠키로 전달되므로 응답 바디에 포함하지 않음
}

// JWT 토큰 페이로드
export interface JWTPayload {
  sub: string; // 이메일
  role: string; // 권한
  nickname: string; // 닉네임
  type: string; // 토큰 타입
  iat: number; // 발급 시간
  exp: number; // 만료 시간
}

// 토큰 재발급 응답
export interface ReissueResponse {
  accessToken: string;
}

// GET 상품 상세
export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  startPrice: number;
  bidPrice: number;
  bidCount: number;
  bidStatus: string;
  productStatus: string;
  imageUrl: string;
  user: User;
  createdAt: string;
  bidEndDate: string;
  modifiedAt: string;
  productBids: ProductBid[];
}

export interface WinnerDetails {
  bidPrice: number;
  productId: string;
  productName: string;
  productStatus: string;
}

export interface MypageProductBid {
  productId: number;
  productName: string;
  price: number;
  bidderNickname: string;
  bidTime: string;
  bidCount: number;
}

export interface ProductBid {
  productBidId: number;
  price: number;
  bidderNickname: string;
  bidTime: string;
}

// POST 상품 등록
export interface CreateProductRequest {
  name: string;
  description: string;
  category: string;
  startPrice: number;
  bidEndDate: Date;
  productStatus: string;
  imageUrl: string;
}

// GET 상품 리스트
export interface ProductListResponse {
  content: Product[];
  pageable: Pageable;
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: Sort;
  empty: boolean;
}

// Auth Context
export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateNickname: (nickname: string) => void;
}

// 입찰 내역
export interface Bid {
  bidder: string;
  amount: number;
  time: string;
}

// 상품 등록/폼 상태
export type ProductFormData = {
  name: string;
  description: string;
  category: string;
  startPrice: string; // string으로 입력받고, 전송 시 number로 변환
  bidEndDate?: string; // 경매 종료 날짜 (YYYY-MM-DD)
  productStatus: "GOOD" | "BAD" | "NEW" | string;
  imageUrl?: string;
};

export type Order = {
  orderId: number;
  productName: string;
  bidPrice: number;
  orderStatus: OrderStatus;
};

export type OrderStatus = "PAYMENT_PENDING" | "PAID";

export interface ShippingInfo {
  name: string;
  phoneNumber: string;
  zipCode: string;
  address: string;
  detailAddress: string;
}

export interface UpdateShippingInfoRequest {
  name: string;
  phoneNumber: string;
  zipCode: string;
  address: string;
  detailAddress: string;
}

export interface OrderDetail {
  orderId: number;
  productName: string;
  bidPrice: number;
  orderStatus: OrderStatus;
  shippingInfo: ShippingInfo;
}
