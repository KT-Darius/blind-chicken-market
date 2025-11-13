"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
      // --- 1단계: 로그인 API 호출 (토큰 받기) ---
      const loginResponse = await axios.post(
        `${API_BASE_URL}/api/auth/sign-in`,
        {
          email,
          password,
        },
      );

      const { accessToken } = loginResponse.data; // SignInResponseDto
      if (!accessToken) {
        throw new Error("로그인 응답에 accessToken이 없습니다.");
      }

      // --- 2단계: 유저 정보 API 호출 (토큰 사용) ---
      // 방금 받은 토큰을 헤더에 포함시켜 /api/users/me 호출
      const userResponse = await axios.get(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // UserResponseDto
      const userData = userResponse.data;

      // --- 3단계: useAuth에 토큰과 유저 정보 동시 저장 ---
      login(accessToken, userData);

      router.push("/"); // 메인 페이지로 이동
    } catch (err) {
      // 401 Unauthorized (비번 틀림), 404 Not Found (유저 없음)
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 401 || err.response?.status === 404)
      ) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        const error = err as Error;
        setError(error.message || "알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { email, password, error, isLoading, handleChange, handleSubmit };
}
