"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Spring Boot API 호출
      // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password }),
      // });
      // if (!res.ok) throw new Error("로그인 실패");
      // const data = await res.json();
      // localStorage.setItem("accessToken", data.accessToken);

      await new Promise((r) => setTimeout(r, 800)); // 임시 로딩 효과
      router.push("/");
    } catch (err) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    password,
    error,
    isLoading,
    handleChange,
    handleSubmit,
  };
}
