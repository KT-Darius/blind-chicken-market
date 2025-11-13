"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/hooks/user/useAuth";
import { ProductFormData } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// 백엔드가 Presigned URL 응답으로 줄 타입 (예시)
interface PresignedUrlResponse {
  uploadUrl: string; // S3에 PUT할 임시 URL
  fileUrl: string; // DB에 저장할 최종 파일 URL (S3 영구 주소)
}

// 백엔드가 최종 등록 응답으로 줄 타입 (예시)
interface ProductCreateResponse {
  productId: number;
}

export function useCreateProductForm() {
  const router = useRouter();
  // isAuthLoading: Hydration 오류 및 클라이언트 예외 방지용
  const { user, isLoading: isAuthLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "ELECTRONICS",
    startPrice: "",
    duration: "3",
    productStatus: "GOOD",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]); // 미리보기용 (blob:)
  const [imageFiles, setImageFiles] = useState<File[]>([]); // 업로드용 (File)
  const [isLoading, setIsLoading] = useState(false); // 폼 제출 로딩
  const [error, setError] = useState<string | null>(null);

  // 페이지 접근 제어 (Route Guard)
  useEffect(() => {
    // useAuth 로딩이 끝나고, user가 null일 때
    if (!isAuthLoading && user === null) {
      alert("로그인이 필요한 페이지입니다.");
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  // Blob URL 메모리 누수 방지 Cleanup 로직
  useEffect(() => {
    // 이 훅(CreateProductPage)이 unmount될 때 (페이지를 떠날 때) 실행됨
    return () => {
      uploadedImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [uploadedImages]);

  // 폼 입력 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 스텝 핸들러
  const handleNextStep = () => step < 4 && setStep(step + 1);
  const handlePrevStep = () => step > 1 && setStep(step - 1);

  // handleSubmit 로직 (Presigned URL 3단계 방식)
  const handleSubmit = async () => {
    if (imageFiles.length === 0) {
      alert("이미지를 1개 이상 등록해야 합니다.");
      setStep(1);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // --- 1단계: 백엔드에 Presigned URL 요청 ---
      const fileNames = imageFiles.map((file) => file.name);

      const presignedResponse = await axios.post<PresignedUrlResponse[]>(
        `${API_BASE_URL}/api/products/presigned-urls`,
        { fileNames },
        // (useAuth가 axios 헤더에 토큰을 자동으로 설정해 줌)
      );

      // --- 2단계: 프론트엔드가 S3로 직접 파일 업로드 (병렬 처리) ---
      const uploadPromises = presignedResponse.data.map((urlData, index) => {
        const file = imageFiles[index];
        return axios.put(urlData.uploadUrl, file, {
          headers: {
            "Content-Type": file.type, // S3는 Content-Type을 명시해야 함
          },
          // S3 업로드 시에는 'Authorization' 헤더가 필요 없으므로,
          // useAuth의 기본 헤더를 비활성화하는 것이 좋습니다 (단, 지금은 생략 가능)
        });
      });

      await Promise.all(uploadPromises); // 모든 업로드가 끝날 때까지 대기

      // 업로드 완료된 S3 URL 목록 (DB 저장용)
      const imageUrls = presignedResponse.data.map((data) => data.fileUrl);

      // --- 3단계: 백엔드에 최종 데이터(JSON) 전송 ---
      // 백엔드 DTO 형식에 맞게 프론트엔드 상태(formData)를 변환
      const finalProductData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseInt(formData.startPrice, 10),
        productStatus: formData.productStatus,
        // [중요] 백엔드 DTO가 imageUrl (단일)을 받는지 imageUrls (배열)를 받는지 확인!
        // 여기서는 임시 테스트 API 형식(단일) 대신, Presigned URL 방식(배열)을 가정합니다.
        // 만약 백엔드가 'imageUrl' (단일)만 받는다면:
        // imageUrl: imageUrls[0], // -> 이렇게 첫 번째 URL만 전송
        imageUrls: imageUrls, // -> 백엔드가 리스트를 받는다고 가정
        // formData.duration은 백엔드 DTO에 없으므로 제외
      };

      const response = await axios.post<ProductCreateResponse>(
        `${API_BASE_URL}/api/products`,
        finalProductData, // JSON으로 전송
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      console.log("상품 등록 성공:", response.data);
      alert("상품이 성공적으로 등록되었습니다!");
      router.push(`/products/${response.data.productId}`); // 백엔드 응답 확인 필요
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
