import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 숫자를 한국 원화 형식으로 포맷팅합니다.
 * @param amount - 포맷팅할 금액 (숫자)
 * @returns 포맷팅된 원화 문자열 (예: "₩12,000")
 */
export function formatCurrency(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

/**
 * 경매 마감 여부를 확인합니다 (초 단위까지 비교).
 * @param bidEndDate - 경매 종료 날짜 (ISO 8601 문자열 또는 Date 객체)
 * @returns 경매가 종료되었으면 true, 아니면 false
 */
export function isAuctionExpired(bidEndDate: string | Date): boolean {
  const now = new Date().getTime();
  const endDate = new Date(bidEndDate).getTime();
  return now >= endDate;
}

/**
 * 현재 시간과 경매 종료 시간의 차이(밀리초)를 계산합니다.
 * @param bidEndDate - 경매 종료 날짜 (ISO 8601 문자열 또는 Date 객체)
 * @returns 시간 차이 (밀리초). 음수면 경매 종료됨
 */
export function getTimeRemainMs(bidEndDate: string | Date): number {
  const now = new Date().getTime();
  const endDate = new Date(bidEndDate).getTime();
  return endDate - now;
}

/**
 * UTC 시간을 한국 시간(KST)으로 포맷팅합니다.
 * @param dateString - ISO 8601 형식의 UTC 시간 문자열
 * @returns 한국 시간으로 포맷팅된 날짜 문자열 (예: "2025. 11. 27. 오후 3:30:45")
 */
export function formatKoreanTime(dateString: string | Date): string {
  try {
    const date = new Date(dateString);
    // UTC 시간을 한국 시간(UTC+9)으로 변환
    const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    return koreaTime.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return "시간 정보 오류";
  }
}

/**
 * JWT 토큰의 payload를 디코딩합니다.
 * @param token - JWT 액세스 토큰
 * @returns 디코딩된 payload 객체 또는 null
 */
export function decodeJWT<T = Record<string, unknown>>(
  token: string,
): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    // Base64 URL 디코딩 (- 를 +로, _ 를 /로 변환)
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    // atob로 Base64 디코딩 후 UTF-8로 변환 (한글 지원)
    const decoded = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(decoded) as T;
  } catch (error) {
    console.error("JWT 디코딩 실패:", error);
    return null;
  }
}
