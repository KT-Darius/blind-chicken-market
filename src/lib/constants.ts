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
  { label: "나쁨", value: "BAD" },
  { label: "새상품", value: "NEW" },
];

/**
 * 경매 기간 (Step3)
 */
export const AUCTION_DURATIONS = [
  { label: "3일", value: "3" },
  { label: "7일", value: "7" },
  { label: "14일", value: "14" },
  { label: "30일", value: "30" },
];
