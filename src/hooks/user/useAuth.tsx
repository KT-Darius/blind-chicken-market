"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, AuthContextType } from "@/types";
import {
  setAccessToken as setGlobalAccessToken,
  getAccessToken,
  apiPost,
  apiGet,
} from "@/lib/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // accessToken 상태는 localStorage와 동기화됩니다.
  const accessToken = getAccessToken();

  const login = useCallback(
    (token: string, userData: User) => {
      // API fetch wrapper와 localStorage에 토큰 설정
      setGlobalAccessToken(token);
      setUser(userData);
      router.refresh(); // 상태 반영을 위해 페이지 새로고침
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      // 로그아웃 API 호출 (Refresh Token은 HttpOnly Cookie로 자동 전송)
      await apiPost("/api/auth/logout");
    } catch (error) {
      console.error("로그아웃 API 호출 실패:", error);
    } finally {
      // 클라이언트 상태 초기화
      setUser(null);
      setGlobalAccessToken(null);
      router.push("/login");
    }
  }, [router]);

  const updateNickname = useCallback((nickname: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, nickname };
    });
  }, []);

  // 페이지 새로고침 시 토큰 복원
  // Refresh Token이 쿠키에 있으면 새로운 Access Token 발급받아 복원
  useEffect(() => {
    const checkAuth = async () => {
      // 퍼블릭 페이지(인증 불필요)에서는 인증 체크하지 않음
      const publicPaths = ["/", "/login", "/signup"];
      if (publicPaths.includes(pathname)) {
        setIsLoading(false);
        return;
      }

      try {
        // Refresh Token이 쿠키에 있다면 자동으로 전송됨
        // 백엔드에서 Refresh Token 검증 후 새 Access Token 발급
        const response = await apiPost<{
          accessToken: string;
          refreshToken?: string;
        }>("/api/auth/reissue");

        if (response.accessToken) {
          // apiPost("/api/auth/reissue") 내부의 apiFetch가 성공 시
          // 토큰을 localStorage에 저장하므로 별도 저장은 불필요합니다.
          // 상태를 다시 동기화하기 위해 페이지를 새로고침합니다.
          router.refresh();
          return; // 새로고침 후 아래 로직은 실행되지 않도록 합니다.
        }
      } catch {
        console.log("인증 정보 없음 또는 만료됨");
        // Refresh Token이 없거나 만료된 경우는 정상적인 상황
        // 로그인 페이지로 리다이렉트하지 않음
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname]);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, logout, isLoading, updateNickname }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
