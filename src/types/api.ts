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
  refreshToken?: string;
  user: User;
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
  modifiedAt: string;
  productBids: ProductBid[];
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
