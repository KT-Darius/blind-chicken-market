"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { User, AuthContextType, JWTPayload } from "@/types";
import { setAccessToken as setGlobalAccessToken, apiPost } from "@/lib/api";
import { decodeJWT } from "@/lib/utils";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 로그인 함수: 로컬 스토리지 저장 로직 보장
  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem("accessToken", token);
    setGlobalAccessToken(token);
    setUser(userData);
  }, []);

  // 로그아웃 함수: 로컬 스토리지 삭제
  const logout = useCallback(async () => {
    try {
      await apiPost("/api/auth/logout");
    } catch (error) {
      console.error("로그아웃 API 호출 실패:", error);
    } finally {
      localStorage.removeItem("accessToken");
      setGlobalAccessToken(null);
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  const updateNickname = useCallback((nickname: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, nickname };
    });
  }, []);

  // 초기화 로직: JWT 토큰 디코딩으로 사용자 정보 복구
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("accessToken");

        // 토큰이 없다면 비로그인 상태
        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        // JWT 토큰 디코딩
        const payload = decodeJWT<JWTPayload>(storedToken);
        if (!payload || !payload.nickname) {
          // 토큰이 유효하지 않으면 삭제
          localStorage.removeItem("accessToken");
          setGlobalAccessToken(null);
          setUser(null);
          setIsLoading(false);
          return;
        }

        // 토큰 만료 확인
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          // 만료된 토큰이면 삭제
          localStorage.removeItem("accessToken");
          setGlobalAccessToken(null);
          setUser(null);
          setIsLoading(false);
          return;
        }

        // API 헤더 설정 및 유저 정보 복구
        setGlobalAccessToken(storedToken);
        const userData: User = {
          id: 0,
          email: payload.sub,
          nickname: payload.nickname,
          role: payload.role === "ROLE_USER" ? "USER" : "ADMIN",
          phoneNumber: "",
        };
        setUser(userData);
      } catch (error) {
        console.error("토큰 복원 실패:", error);
        localStorage.removeItem("accessToken");
        setGlobalAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: null,
        login,
        logout,
        isLoading,
        updateNickname,
      }}
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
