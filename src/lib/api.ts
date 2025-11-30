/**
 * API Fetch Wrapper
 * - Access Token 자동 포함
 * - 401 에러 시 자동 토큰 재발급 및 재시도
 * - Refresh Token은 HttpOnly 쿠키로 자동 전송
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];
const ACCESS_TOKEN_KEY = "accessToken";

export function setAccessToken(token: string | null) {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

// 구독 추가
function subscribeTokenRefresh(callback: (token: string | null) => void) {
  refreshSubscribers.push(callback);
}

// 성공 시 토큰 전달, 실패 시 null 전달하여 대기열 해소
function onTokenRefreshed(token: string | null) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reissue`, {
      method: "POST",
      credentials: "include",
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

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const currentAccessToken = getAccessToken();
  if (currentAccessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${currentAccessToken}`,
    };
  }

  // 토큰 재발급이 필요없는 인증 엔드포인트 목록
  const authEndpoints = [
    "/api/auth/sign-in",
    "/api/auth/sign-up",
    "/api/auth/reissue",
  ];
  const shouldSkipRefresh = authEndpoints.some((path) =>
    endpoint.includes(path),
  );

  try {
    const response = await fetch(url, config);

    if (response.status === 401 && !shouldSkipRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          // [수정] newToken이 null일 수 있음을 처리
          subscribeTokenRefresh(async (newToken) => {
            if (!newToken) {
              // 재발급 실패 시 대기하던 요청도 에러 처리
              reject(new Error("토큰 재발급 실패로 인한 요청 취소"));
              return;
            }
            try {
              config.headers = {
                ...config.headers,
                Authorization: `Bearer ${newToken}`,
              };
              const retryResponse = await fetch(url, config);
              if (!retryResponse.ok) {
                const errorData = await retryResponse.json().catch(() => ({}));
                throw new Error(
                  errorData.message || `API 요청 실패: ${retryResponse.status}`,
                );
              }
              const data = await retryResponse.json();
              resolve(data);
            } catch (error) {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        // 성공이든 실패든 대기 중인 요청들에게 결과를 알려줌
        onTokenRefreshed(newToken);

        if (!newToken) {
          // 재발급 실패 시 로그아웃 이벤트 발생 (선택 사항)
          // window.dispatchEvent(new Event("auth:logout"));
          throw new Error("토큰 재발급 실패");
        }

        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        };

        const retryResponse = await fetch(url, config);

        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          throw new Error(
            errorData.message || `API 요청 실패: ${retryResponse.status}`,
          );
        }

        return await retryResponse.json();
      } catch (error) {
        // 재발급 과정 자체에서 에러 발생 시 처리
        onTokenRefreshed(null); // 대기열에게 실패 알림
        throw error;
      } finally {
        isRefreshing = false;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error("API 요청 오류:", error);
    throw error;
  }
}

export function apiGet<T = unknown>(endpoint: string, options?: RequestInit) {
  return apiFetch<T>(endpoint, { ...options, method: "GET" });
}

export function apiPost<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit,
) {
  return apiFetch<T>(endpoint, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

export function apiPut<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit,
) {
  return apiFetch<T>(endpoint, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

export function apiPatch<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit,
) {
  return apiFetch<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  });
}

export function apiDelete<T = unknown>(
  endpoint: string,
  options?: RequestInit,
) {
  return apiFetch<T>(endpoint, { ...options, method: "DELETE" });
}
