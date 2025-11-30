"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { apiPost, setAccessToken } from "@/lib/api";
import { SignInResponse, JWTPayload, User } from "@/types";
import { decodeJWT } from "@/lib/utils";

export function useLoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      // 1단계: 로그인 API 호출
      const loginResponse = await apiPost<SignInResponse>("/api/auth/sign-in", {
        email,
        password,
      });

      const { accessToken } = loginResponse;
      if (!accessToken) {
        throw new Error("로그인 응답에 accessToken이 없습니다.");
      }

      // 2단계: JWT 토큰 디코딩하여 닉네임 추출
      const payload = decodeJWT<JWTPayload>(accessToken);
      if (!payload || !payload.nickname) {
        throw new Error("토큰에서 사용자 정보를 읽을 수 없습니다.");
      }

      // 3단계: Access Token 설정 및 저장
      setAccessToken(accessToken);
      localStorage.setItem("accessToken", accessToken);

      // 4단계: JWT에서 추출한 정보로 User 객체 생성
      const userData: User = {
        id: 0, // JWT에 id가 없으므로 임시값 (필요시 /api/users/me 호출 가능)
        email: payload.sub,
        nickname: payload.nickname,
        role: payload.role === "ROLE_USER" ? "USER" : "ADMIN",
        phoneNumber: "", // JWT에 없는 정보
      };

      // 5단계: useAuth에 토큰과 유저 정보 저장
      login(accessToken, userData);

      router.push("/");
    } catch (err) {
      const error = err as Error;
      // 로그인 실패 시 모두 동일한 메시지 표시 (보안상 이유)
      if (
        error.message.includes("401") ||
        error.message.includes("404") ||
        error.message.includes("엔티티")
      ) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setError(error.message || "로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { email, password, error, isLoading, handleChange, handleSubmit };
}
