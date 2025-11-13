"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useCreateProductForm } from "@/hooks/useCreateProductForm";
import ProgressIndicator from "@/components/product/create/ProgressIndicator";
import Step1UploadPhotos from "@/components/product/create/Step1UploadPhotos";
import Step2Details from "@/components/product/create/Step2Details";
import Step3Pricing from "@/components/product/create/Step3Pricing";
import Step4Review from "@/components/product/create/Step4Review";

export default function CreateProductPage() {
  const {
    step,
    formData,
    uploadedImages,
    imageFiles,
    isLoading,
    error,
    isPageLoading,
    handleNextStep,
    handlePrevStep,
    handleSubmit,
    handleInputChange,
    setFormData,
    setUploadedImages,
    setImageFiles,
    user,
  } = useCreateProductForm();

  // useAuth가 로딩 중이거나, user가 없어 리디렉션 될 때
  if (isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  // user가 존재할 때만 페이지 렌더링
  return (
    <main className="bg-background min-h-screen py-8 md:py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-bold md:text-4xl">
            상품 등록
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {user?.nickname}님의 상품을 등록하세요
          </p>
        </div>

        <ProgressIndicator step={step} />

        {error && <p className="text-destructive mb-4 text-center">{error}</p>}

        <Card className="border-border bg-card border p-6 md:p-8">
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
