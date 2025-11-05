"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "유효한 이메일 형식이 아닙니다";
    }

    if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }

    if (formData.nickname.length < 2) {
      newErrors.nickname = "닉네임은 최소 2자 이상이어야 합니다";
    }

    if (!formData.phone) {
      newErrors.phone = "전화번호를 입력해주세요";
    } else if (!/^\d{10,11}$/.test(formData.phone.replace(/-/g, ""))) {
      newErrors.phone = "유효한 전화번호 형식이 아닙니다";
    }

    if (!termsAccepted) {
      newErrors.terms = "약관에 동의해야 합니다";
    }

    return newErrors;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push("/");
    } catch (err) {
      setErrors({ form: "회원가입에 실패했습니다. 다시 시도해주세요." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-foreground mt-6 text-3xl font-bold">회원가입</h1>
        </div>

        {errors.form && (
          <div className="bg-destructive/10 border-destructive/30 flex items-start gap-3 rounded-lg border p-4">
            <AlertCircle className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0" />
            <p className="text-destructive text-sm">{errors.form}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* 이메일 */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              이메일*
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@example.com"
              className={`bg-background text-foreground placeholder-muted-foreground w-full rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:outline-none ${
                errors.email
                  ? "border-destructive focus:ring-destructive"
                  : "border-border focus:ring-primary"
              }`}
              required
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-destructive mt-1 text-xs">{errors.email}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              비밀번호*
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`bg-background text-foreground placeholder-muted-foreground w-full rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:outline-none ${
                errors.password
                  ? "border-destructive focus:ring-destructive"
                  : "border-border focus:ring-primary"
              }`}
              required
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-destructive mt-1 text-xs">{errors.password}</p>
            )}
            {!errors.password && formData.password && (
              <p className="text-muted-foreground mt-1 text-xs">
                최소 8자 이상 권장됩니다
              </p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              비밀번호 확인*
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={`bg-background text-foreground placeholder-muted-foreground w-full rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:outline-none ${
                errors.confirmPassword
                  ? "border-destructive focus:ring-destructive"
                  : "border-border focus:ring-primary"
              }`}
              required
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-destructive mt-1 text-xs">
                {errors.confirmPassword}
              </p>
            )}
            {!errors.confirmPassword &&
              formData.confirmPassword &&
              formData.password === formData.confirmPassword && (
                <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" /> 비밀번호가 일치합니다
                </p>
              )}
          </div>

          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              닉네임*
            </label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="익명으로 사용할 닉네임"
              className={`bg-background text-foreground placeholder-muted-foreground w-full rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:outline-none ${
                errors.nickname
                  ? "border-destructive focus:ring-destructive"
                  : "border-border focus:ring-primary"
              }`}
              required
              disabled={isLoading}
            />
            {errors.nickname && (
              <p className="text-destructive mt-1 text-xs">{errors.nickname}</p>
            )}
          </div>

          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              전화번호*
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="01012345678"
              className={`bg-background text-foreground placeholder-muted-foreground w-full rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:outline-none ${
                errors.phone
                  ? "border-destructive focus:ring-destructive"
                  : "border-border focus:ring-primary"
              }`}
              required
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-destructive mt-1 text-xs">{errors.phone}</p>
            )}
          </div>

          <div className="bg-muted/50 flex items-start gap-3 rounded-lg p-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => {
                setTermsAccepted(checked as boolean);
                if (checked && errors.terms) {
                  setErrors((prev) => ({ ...prev, terms: "" }));
                }
              }}
              disabled={isLoading}
            />
            <label
              htmlFor="terms"
              className="text-foreground cursor-pointer text-sm"
            >
              <Link href="#" className="text-primary hover:underline">
                서비스 약관
              </Link>
              과{" "}
              <Link href="#" className="text-primary hover:underline">
                개인정보처리방침
              </Link>
              에 동의합니다
            </label>
          </div>
          {errors.terms && (
            <p className="text-destructive text-xs">{errors.terms}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "계정 만드는 중..." : "계정 만들기"}
          </Button>
        </form>

        <p className="text-muted-foreground text-center text-sm">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
