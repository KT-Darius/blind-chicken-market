"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function useSignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    phone: "",
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
    if (!formData.phone.match(/^\d{10,11}$/)) {
      newErrors.phone = "유효한 전화번호를 입력해주세요.";
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      // TODO: 백엔드 회원가입 API 호출
      // await signup(formData);
      router.push("/login");
    } catch {
      setErrors({ form: "회원가입에 실패했습니다. 다시 시도해주세요." });
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
