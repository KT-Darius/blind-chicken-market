"use client";

import { Button } from "@/components/ui/button";
import { FormInput } from "./FormInput";
import { TermsCheckbox } from "./TermsCheckbox";
import { useSignupForm } from "@/hooks/user/useSignupForm";

export function SignupForm() {
  const {
    formData,
    errors,
    isLoading,
    termsAccepted,
    handleChange,
    handleSubmit,
    setTermsAccepted,
  } = useSignupForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label="이메일"
        name="email"
        type="email"
        placeholder="your@example.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />
      <FormInput
        label="비밀번호"
        name="password"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
      />
      <FormInput
        label="비밀번호 확인"
        name="confirmPassword"
        type="password"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
      />
      <FormInput
        label="닉네임"
        name="nickname"
        type="text"
        placeholder="익명으로 사용할 닉네임"
        value={formData.nickname}
        onChange={handleChange}
        error={errors.nickname}
      />
      <FormInput
        label="전화번호"
        name="phoneNumber"
        type="tel"
        placeholder="01012345678"
        value={formData.phoneNumber}
        onChange={handleChange}
        error={errors.phoneNumber}
      />
      <TermsCheckbox
        checked={termsAccepted}
        onCheckedChange={setTermsAccepted}
        error={errors.terms}
      />
      <Button
        type="submit"
        size="lg"
        className="w-full rounded-lg"
        disabled={isLoading}
      >
        {isLoading ? "계정 만드는 중..." : "계정 만들기"}
      </Button>
    </form>
  );
}
