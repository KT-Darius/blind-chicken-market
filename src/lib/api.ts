/**
 * API Fetch Wrapper
 * - Access Token 자동 포함
 * - 401 에러 시 자동 토큰 재발급 및 재시도
 * - Refresh Token은 HttpOnly 쿠키로 자동 전송
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

let accessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Access Token 설정
 */
export function setAccessToken(token: string | null) {
  accessToken = token;
}

/**
 * Access Token 가져오기
 */
export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * 토큰 재발급 대기 중인 요청들을 구독
 */
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

/**
 * 토큰 재발급 완료 시 대기 중인 요청들에게 새 토큰 전달
 */
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

/**
 * Access Token 재발급
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reissue`, {
      method: "POST",
      credentials: "include", // Refresh Token 쿠키 자동 전송
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("토큰 재발급 실패");
    }

    const data = await response.json();
    const newAccessToken = data.accessToken;

    if (!newAccessToken) {
      throw new Error("새로운 Access Token을 받지 못했습니다.");
    }

    setAccessToken(newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("토큰 재발급 실패:", error);
    setAccessToken(null);

    return null;
  }
}

/**
 * API Fetch Wrapper
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  // 기본 옵션 설정
  const config: RequestInit = {
    ...options,
    credentials: "include", // 쿠키 자동 포함
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  // Access Token이 있으면 Authorization 헤더에 추가
  if (accessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  try {
    const response = await fetch(url, config);

    // 401 에러 발생 시 토큰 재발급 시도
    if (response.status === 401) {
      // 이미 토큰 재발급 중이라면 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(async (newToken: string) => {
            try {
              // 새 토큰으로 원래 요청 재시도
              config.headers = {
                ...config.headers,
                Authorization: `Bearer ${newToken}`,
              };
              const retryResponse = await fetch(url, config);

              if (!retryResponse.ok) {
                throw new Error(`API 요청 실패: ${retryResponse.status}`);
              }

              const data = await retryResponse.json();
              resolve(data);
            } catch (error) {
              reject(error);
            }
          });
        });
      }

      // 토큰 재발급 시작
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (!newToken) {
          throw new Error("토큰 재발급 실패");
        }

        // 대기 중인 요청들에게 새 토큰 전달
        onTokenRefreshed(newToken);

        // 원래 요청 재시도
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        };

        const retryResponse = await fetch(url, config);

        if (!retryResponse.ok) {
          throw new Error(`API 요청 실패: ${retryResponse.status}`);
        }

        return await retryResponse.json();
      } finally {
        isRefreshing = false;
      }
    }

    // 정상 응답 처리
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
    }

    // 응답이 204 No Content인 경우
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error("API 요청 오류:", error);
    throw error;
  }
}

/**
 * GET 요청
 */
export function apiGet<T = unknown>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  return apiFetch<T>(endpoint, { ...options, method: "GET" });
}

/**
 * POST 요청
 */
export function apiPost<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit,
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT 요청
 */
export function apiPut<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit,
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCH 요청
 */
export function apiPatch<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit,
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE 요청
 */
export function apiDelete<T = unknown>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  return apiFetch<T>(endpoint, { ...options, method: "DELETE" });
}
