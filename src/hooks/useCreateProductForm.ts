"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/hooks/user/useAuth";
import { ProductFormData } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface ProductCreateResponse {
  productId: number;
}

export function useCreateProductForm() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [step, setStep] = useState(1);
  const defaultBidEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "ELECTRONICS",
    startPrice: "",
    bidEndDate: defaultBidEndDate,
    productStatus: "GOOD",
    imageUrl:
      "https://cdn.inflearn.com/public/files/courses/335872/cover/01jqb5mphmn93fqvvs4ad8z6t1",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user === null) {
      alert("로그인이 필요한 페이지입니다.");
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    return () => {
      uploadedImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [uploadedImages]);

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

    try {
      const productFormData = new FormData();

      const jsonData = JSON.stringify({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseInt(formData.startPrice, 10),
        bidEndDate: formData.bidEndDate
          ? new Date(formData.bidEndDate).toISOString()
          : null,
        productStatus: formData.productStatus,
        imageUrl: formData.imageUrl,
      });

      productFormData.append(
        "requestDto",
        new Blob([jsonData], { type: "application/json" }),
      );

      imageFiles.forEach((file) => {
        productFormData.append("images", file);
      });

      const response = await axios.post<ProductCreateResponse>(
        `${API_BASE_URL}/api/products`,
        productFormData,
      );

      console.log("상품 등록 성공:", response.data);
      alert("상품이 성공적으로 등록되었습니다!");
      router.push(`/products/${response.data.productId}`);
    } catch (err) {
      console.error("상품 등록 실패:", err);
      setError("상품 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const isPageLoading = isAuthLoading || (!isAuthLoading && user === null);

  return {
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
  };
}
