// === API 통신용 타입 ===
export interface User {
  id: number;
  nickname: string;
  email: string;
  role: "USER" | "ADMIN";
  phoneNumber: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  nickname: string;
  phoneNumber: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  startPrice: number;
  bidPrice: number;
  productStatus: "GOOD" | "BAD" | "NEW" | string;
  imageUrl: string;
  user?: User;
  createdAt?: string;
  modifiedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  category: string;
  startPrice: number; // API 기준
  productStatus: "GOOD" | "BAD" | "NEW" | string;
  imageUrl: string;
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

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
