"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function useSignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "유효한 이메일을 입력해주세요.";
    }
    if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }
    if (!formData.nickname.trim()) {
      newErrors.nickname = "닉네임을 입력해주세요.";
    }
    if (!formData.phoneNumber.match(/^\d{10,11}$/)) {
      newErrors.phoneNumber =
        "유효한 전화번호를 입력해주세요. (10~11자리 숫자)";
    }
    if (!termsAccepted) {
      newErrors.terms = "약관에 동의해야 합니다.";
    }
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (errors.form) setErrors((prev) => ({ ...prev, form: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...signupData } = formData;

      await axios.post(`${API_BASE_URL}/api/auth/sign-up`, signupData);

      alert("회원가입에 성공했습니다. 로그인 페이지로 이동합니다.");
      router.push("/login");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // 409 Conflict (중복 에러)
        if (error.response.status === 409) {
          setErrors({
            form:
              error.response.data.message ||
              "이미 사용 중인 이메일 또는 닉네임입니다.",
          });
        } else {
          setErrors({
            form:
              error.response.data.message ||
              "회원가입에 실패했습니다. 다시 시도해주세요.",
          });
        }
      } else {
        setErrors({ form: "알 수 없는 오류가 발생했습니다." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    errors,
    isLoading,
    termsAccepted,
    setTermsAccepted,
    handleChange,
    handleSubmit,
  };
}
