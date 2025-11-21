"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { useAuth } from "@/hooks/user/useAuth";
import { ProductFormData } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function useCreateProductForm() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, accessToken } = useAuth();

  const [step, setStep] = useState(1);
  const defaultBidEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "ELECTRONICS",
    startPrice: "0",
    bidEndDate: defaultBidEndDate,
    productStatus: "GOOD",
    imageUrl: "",
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

    if (!formData.name || formData.name.trim() === "") {
      alert("상품명을 입력해주세요.");
      setStep(2);
      return;
    }

    if (!formData.bidEndDate || formData.bidEndDate.trim() === "") {
      alert("경매 종료 날짜를 입력해주세요.");
      setStep(3);
      return;
    }

    const endDate = new Date(formData.bidEndDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (endDate < today) {
      alert("경매 종료 날짜는 오늘 이후여야 합니다.");
      setStep(4);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      for (const file of imageFiles) {
        const presignedResponse = await axios.post(
          `${API_BASE_URL}/api/s3/upload-url`,
          {
            fileName: file.name,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        await fetch(presignedResponse.data.url, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });
      }

      // 종료 날짜를 현재 시간 이후의 랜덤한 시간으로 설정
      let bidEndDateString = null;
      if (formData.bidEndDate) {
        const selectedDate = new Date(formData.bidEndDate);
        const now = new Date();

        // 선택한 날짜가 오늘이면 현재 시간 이후로, 미래 날짜면 00:00:00 ~ 23:59:59 사이로 설정
        let minTime, maxTime;
        if (selectedDate.toDateString() === now.toDateString()) {
          // 오늘이면 현재 시간 이후부터 23:59:59까지
          minTime =
            now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
          maxTime = 86399; // 23:59:59
        } else {
          // 미래 날짜면 00:00:00 ~ 23:59:59
          minTime = 0;
          maxTime = 86399;
        }

        const randomSeconds =
          Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
        const hours = Math.floor(randomSeconds / 3600)
          .toString()
          .padStart(2, "0");
        const minutes = Math.floor((randomSeconds % 3600) / 60)
          .toString()
          .padStart(2, "0");
        const seconds = (randomSeconds % 60).toString().padStart(2, "0");

        bidEndDateString = `${formData.bidEndDate}T${hours}:${minutes}:${seconds}`;
      }

      const jsonData = JSON.stringify({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.startPrice ? parseInt(formData.startPrice, 10) : 0,
        bidEndDate: bidEndDateString,
        productStatus: formData.productStatus,
        imageUrl: imageFiles[0].name,
      });

      await axios
        .post(`${API_BASE_URL}/api/products`, jsonData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((result) => {
          alert("상품이 성공적으로 등록됐습니다.");
          router.push(`/products/${result.data.id}`);
        });
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
