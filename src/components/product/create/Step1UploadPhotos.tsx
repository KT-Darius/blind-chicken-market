"use client";

import { Upload } from "lucide-react";
import { useEffect } from "react";

// Props 타입
interface Step1UploadPhotosProps {
  uploadedImages: string[];
  setUploadedImages: React.Dispatch<React.SetStateAction<string[]>>;
  imageFiles: File[];
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export default function Step1UploadPhotos({
  uploadedImages,
  setUploadedImages,
  imageFiles,
  setImageFiles,
}: Step1UploadPhotosProps) {
  // '이전' 버튼으로 돌아왔을 때 Blob URL을 재생성하는 로직
  useEffect(() => {
    // File 객체는 있는데, Blob URL(미리보기)이 부족하면 재생성
    if (imageFiles.length > uploadedImages.length) {
      // 기존 URL은 유지하고, 부족한 것만 추가
      const missingCount = imageFiles.length - uploadedImages.length;
      const newUrls = imageFiles
        .slice(-missingCount)
        .map((file) => URL.createObjectURL(file));
      setUploadedImages((prev) => [...prev, ...newUrls]);
    }
  }, [imageFiles.length, uploadedImages.length, imageFiles, setUploadedImages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalFiles = imageFiles.length + files.length;

    if (totalFiles > 5) {
      alert("사진은 최대 5개까지만 업로드할 수 있습니다.");
      e.target.value = ""; // input 리셋
      return;
    }

    // 모든 파일을 한 번에 처리
    const newFiles = [...files];
    const newUrls = files.map((file) => URL.createObjectURL(file));

    // 상태 업데이트를 한 번에
    setImageFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setUploadedImages((prevImages) => [...prevImages, ...newUrls]);

    // input 값 리셋 (같은 파일 재선택 가능하도록)
    e.target.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    const urlToRemove = uploadedImages[indexToRemove];
    if (urlToRemove) {
      URL.revokeObjectURL(urlToRemove); // 개별 삭제 시 메모리 해제
    }
    // 두 상태에서 모두 제거
    setUploadedImages((prev) => prev.filter((_, i) => i !== indexToRemove));
    setImageFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const remainingUploads = 5 - imageFiles.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground mb-2 text-2xl font-bold">사진 업로드</h2>
        <p className="text-muted-foreground">
          최대 5장까지 업로드 가능합니다. 첫 번째 사진이 대표 사진이 됩니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {remainingUploads > 0 && (
          <label className="border-border hover:bg-muted col-span-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors md:col-span-1">
            <Upload className="text-muted-foreground mb-2 h-8 w-8" />
            <span className="text-foreground text-sm font-medium">
              사진 업로드
            </span>
            <span className="text-muted-foreground text-xs">최대 5MB</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={imageFiles.length >= 5}
            />
          </label>
        )}

        {uploadedImages.map((img, idx) => (
          <div key={idx} className="group relative">
            <img
              src={img || "/placeholder.svg"}
              alt={`Upload ${idx + 1}`}
              className="h-32 w-full rounded-lg object-cover"
            />
            <button
              onClick={() => removeImage(idx)}
              className="bg-destructive text-primary-foreground absolute top-2 right-2 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100"
            >
              ✕
            </button>
            {idx === 0 && (
              <div className="bg-primary text-primary-foreground absolute top-2 left-2 rounded px-2 py-1 text-xs font-medium">
                대표
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-muted-foreground text-xs">
        {imageFiles.length}/5 장 업로드됨
      </p>
    </div>
  );
}
