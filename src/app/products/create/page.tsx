"use client";

import { useState, useEffect } from "react"; // 1. useEffect import
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth"; // 2. useAuth 훅

import ProgressIndicator from "@/components/common/ProgressIndicator";
import Step1UploadPhotos from "@/components/forms/Step1UploadPhotos";
import Step2Details from "@/components/forms/Step2Details";
import Step3Pricing from "@/components/forms/Step3Pricing";
import Step4Review from "@/components/forms/Step4Review";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function CreateProductPage() {
  const router = useRouter();
  const { user } = useAuth(); // 3. user 객체 가져오기
  const [step, setStep] = useState(1);
  // 4. [수정] formData가 비어있는 버그 수정
  const [formData, setFormData] = useState({
    title: "",
    category: "ELECTONICS",
    condition: "GOOD",
    description: "",
    startingPrice: "",
    duration: "7",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 5. [중요] 페이지 접근 제어 (Route Guard)
  useEffect(() => {
    // AuthProvider가 user 상태를 불러오는 중일 수 있으니 잠시 대기
    // (useAuth 훅이 로딩 상태도 주면 더 좋지만, 지금은 user === null로 체크)

    // 만약 user가 null (로그아웃 상태)이면,
    if (user === null) {
      alert("로그인이 필요한 페이지입니다.");
      router.push("/login"); // 로그인 페이지로 리디렉션
    }
  }, [user, router]); // user 상태가 변경될 때마다 실행

  // ... (handleInputChange, handleNextStep, handlePrevStep, handleSubmit) ...
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => step < 4 && setStep(step + 1);
  const handlePrevStep = () => step > 1 && setStep(step - 1);

  const handleSubmit = async () => {
    if (imageFiles.length === 0) {
      alert("이미지를 1개 이상 등록해야 합니다.");
      setStep(1);
      return;
    }
    setIsLoading(true);
    setError(null);
    const productFormData = new FormData();
    const jsonData = JSON.stringify({
      ...formData,
      startingPrice: parseInt(formData.startingPrice, 10),
      duration: parseInt(formData.duration, 10),
    });
    productFormData.append(
      "requestDto",
      new Blob([jsonData], { type: "application/json" }),
    );
    imageFiles.forEach((file) => {
      productFormData.append("images", file);
    });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/products`,
        productFormData,
      );
      console.log("상품 등록 성공:", response.data);
      alert("상품이 성공적으로 등록되었습니다!");
      router.push(`/products/${response.data.productId}`);
    } catch (err) {
      console.error("상품 등록 실패:", err);
      setError("상품 등록에 실패했습니다. 다시 시도해주세요.");
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("인증이 만료되었습니다. 다시 로그인해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 6. user가 null일 때는 렌더링을 피하기 (선택 사항이지만 추천)
  if (user === null) {
    // 또는 로딩 스피너를 보여줄 수 있습니다.
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <main className="bg-background min-h-screen py-8 md:py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-bold md:text-4xl">
            상품 등록
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {user.nickname}님의 상품을 등록하세요 {/* <-- 7. UI 개인화 */}
          </p>
        </div>

        <ProgressIndicator step={step} />

        {error && <p className="text-destructive mb-4 text-center">{error}</p>}

        <Card className="border-border bg-card border p-6 md:p-8">
          {" "}
          {/* [수정] md:py-8 -> md:p-8 */}
          {/* ... (Step 1 ~ 4) ... */}
          {step === 1 && (
            <Step1UploadPhotos
              uploadedImages={uploadedImages}
              setUploadedImages={setUploadedImages}
              imageFiles={imageFiles}
              setImageFiles={setImageFiles}
            />
          )}
          {step === 2 && (
            <Step2Details formData={formData} onChange={handleInputChange} />
          )}
          {step === 3 && (
            <Step3Pricing formData={formData} setFormData={setFormData} />
          )}
          {step === 4 && (
            <Step4Review formData={formData} uploadedImages={uploadedImages} />
          )}
          {/* ... (Navigation Buttons) ... */}
          <div className="border-border mt-8 flex justify-between gap-3 border-t pt-6">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={step === 1 || isLoading}
              className="flex items-center gap-2 bg-transparent"
            >
              <ChevronLeft size={18} />
              이전
            </Button>
            <div className="flex gap-3">
              {step < 4 && (
                <Button
                  onClick={handleNextStep}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  다음
                  <ChevronRight size={18} />
                </Button>
              )}
              {step === 4 && (
                <Button
                  onClick={handleSubmit}
                  size="lg"
                  className="px-8"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "등록하기"
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
