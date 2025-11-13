"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { ProductFormData } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// 백엔드가 Presigned URL 응답으로 줄 타입
interface PresignedUrlResponse {
  uploadUrl: string; // S3에 PUT할 임시 URL
  fileUrl: string; // DB에 저장할 최종 파일 URL (S3 영구 주소)
}

export function useCreateProductForm() {
  const router = useRouter();
  // isAuthLoading: Hydration 오류 및 클라이언트 예외 방지용
  const { user, isLoading: isAuthLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    category: "ELECTONICS",
    condition: "GOOD",
    description: "",
    startingPrice: "",
    duration: "7",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]); // 미리보기용 (blob:)
  const [imageFiles, setImageFiles] = useState<File[]>([]); // 업로드용 (File)
  const [isLoading, setIsLoading] = useState(false); // 폼 제출 로딩
  const [error, setError] = useState<string | null>(null);

  // [유지] 페이지 접근 제어 (Route Guard)
  useEffect(() => {
    // useAuth 로딩이 끝나고, user가 null일 때
    if (!isAuthLoading && user === null) {
      alert("로그인이 필요한 페이지입니다.");
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  // [유지] 폼 입력 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // [유지] 스텝 핸들러
  const handleNextStep = () => step < 4 && setStep(step + 1);
  const handlePrevStep = () => step > 1 && setStep(step - 1);

  // handleSubmit 로직 (Presigned URL 방식)
  const handleSubmit = async () => {
    if (imageFiles.length === 0) {
      alert("이미지를 1개 이상 등록해야 합니다.");
      setStep(1);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // --- 백엔드에 Presigned URL 요청 ---
      // (useAuth가 axios 헤더에 토큰을 자동으로 설정해 줌)
      // S3에 저장할 파일 이름 목록을 백엔드에 전송
      const fileNames = imageFiles.map((file) => file.name);

      const presignedResponse = await axios.post<PresignedUrlResponse[]>(
        `${API_BASE_URL}/api/products/presigned-urls`, // [백엔드 구현 필요]
        { fileNames },
      );

      // --- 프론트엔드가 S3로 직접 파일 업로드 (병렬 처리) ---
      const uploadPromises = presignedResponse.data.map((urlData, index) => {
        const file = imageFiles[index];
        // 발급받은 임시 URL(uploadUrl)로 S3에 직접 PUT 요청
        return axios.put(urlData.uploadUrl, file, {
          headers: {
            "Content-Type": file.type, // S3는 Content-Type을 명시해야 함
          },
          // (주의: axios 기본 헤더의 'Authorization' 토큰은 S3 업로드 시 불필요)
          // S3 업로드 전용 axios 인스턴스를 따로 만드는 것이 더 좋습니다.
        });
      });

      await Promise.all(uploadPromises); // 모든 업로드가 끝날 때까지 대기

      // 업로드 완료된 S3 URL 목록 (DB 저장용)
      const imageUrls = presignedResponse.data.map((data) => data.fileUrl);

      // --- 백엔드에 최종 데이터(JSON) 전송 ---
      const finalProductData = {
        ...formData,
        startingPrice: parseInt(formData.startingPrice, 10),
        duration: parseInt(formData.duration, 10),
        imageUrls: imageUrls, // [중요] S3 URL 목록 추가
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/products`, // [백엔드 수정 필요]
        finalProductData, // [중요] 이제 FormData가 아닌 JSON 전송
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      console.log("상품 등록 성공:", response.data);
      alert("상품이 성공적으로 등록되었습니다!");
      router.push(`/products/${response.data.productId}`);
    } catch (err) {
      console.error("상품 등록 실패:", err);
      setError("상품 등록에 실패했습니다. 다시 시도해주세요.");
      // 401 에러는 useAuth의 Interceptor가 자동으로 처리
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
