/**
 * 상품 카테고리 (ERD: product_category ENUM)
 */
export const PRODUCT_CATEGORIES = [
  { label: "전자기기", value: "ELECTRONICS" },
  { label: "패션", value: "FASHION" },
  { label: "수집품", value: "GOODS" },
  { label: "도서", value: "BOOKS" },
  { label: "홈/가든", value: "HOME" },
  { label: "스포츠", value: "SPORTS" },
  { label: "기타", value: "ETC" },
];

/**
 * 상품 상태 (ERD: product_status ENUM)
 */
export const PRODUCT_STATUS = [
  { label: "좋음", value: "GOOD" },
  { label: "보통", value: "AVERAGE" },
  { label: "나쁨", value: "BAD" },
];

/**
 * 경매 상태
 */
export const BID_STATUS = [
  { label: "미입찰", value: "NOT_BIDDED" },
  { label: "입찰중", value: "BIDDED" },
  { label: "종료", value: "COMPLETED" },
];
