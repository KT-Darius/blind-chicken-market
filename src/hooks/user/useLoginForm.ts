"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { apiPost, apiGet, setAccessToken } from "@/lib/api";
import { SignInResponse, User } from "@/types";

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
      // --- 1단계: 로그인 API 호출 ---
      // Refresh Token은 HttpOnly 쿠키로 자동 설정됨
      // credentials: "include"는 apiPost 내부에서 자동 적용됨
      const loginResponse = await apiPost<SignInResponse>("/api/auth/sign-in", {
        email,
        password,
      });

      const { accessToken } = loginResponse;
      if (!accessToken) {
        throw new Error("로그인 응답에 accessToken이 없습니다.");
      }
      // Refresh Token은 HttpOnly Cookie로 백엔드에서 자동 설정됨

      // --- 2단계: Access Token을 전역으로 설정 ---
      // 이렇게 해야 다음 API 호출에서 Authorization 헤더가 포함됨
      setAccessToken(accessToken);

      // --- 3단계: 유저 정보 API 호출 (Access Token 사용) ---
      // 이제 apiGet이 Authorization 헤더에 Access Token을 포함시킴
      const userData = await apiGet<User>("/api/users/me");

      // --- 4단계: useAuth에 토큰과 유저 정보 저장 (메모리 상태) ---
      login(accessToken, userData);

      router.push("/"); // 메인 페이지로 이동
    } catch (err) {
      const error = err as Error;
      if (error.message.includes("401") || error.message.includes("404")) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setError(error.message || "알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { email, password, error, isLoading, handleChange, handleSubmit };
}
