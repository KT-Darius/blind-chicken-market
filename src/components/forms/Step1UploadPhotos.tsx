"use client";

import { Upload } from "lucide-react";
import Image from "next/image";

interface Step1Props {
  uploadedImages: string[]; // 미리보기용
  setUploadedImages: React.Dispatch<React.SetStateAction<string[]>>;
  imageFiles: File[]; // 업로드용
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export default function Step1UploadPhotos({
  uploadedImages,
  setUploadedImages,
  imageFiles,
  setImageFiles,
}: Step1Props) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalFiles = imageFiles.length + files.length;

    if (totalFiles > 5) {
      alert("사진은 최대 5개까지만 업로드할 수 있습니다.");
      return;
    }

    files.forEach((file) => {
      // 업로드용 File 객체 저장 (부모 상태 업데이트)
      setImageFiles((prevFiles) => [...prevFiles, file]);

      // 미리보기용 base64 문자열 생성 (부모 상태 업데이트)
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setUploadedImages((prevImages) => [
            ...prevImages,
            reader.result as string,
          ]);
        }
      };
      reader.readAsDataURL(file); // base64로 변환
    });
  };

  // removeImage 로직
  const removeImage = (indexToRemove: number) => {
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
        {/* Upload Box */}
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
              disabled={imageFiles.length >= 5} // file 개수로 확인
            />
          </label>
        )}

        {/* Uploaded Images (미리보기는 uploadedImages(base64) 사용) */}
        {uploadedImages.map((img, idx) => (
          <div key={idx} className="group relative">
            <Image
              src={img || "/placeholder.svg"}
              alt={`Upload ${idx + 1}`}
              className="h-32 w-full rounded-lg object-cover"
            />
            <button
              onClick={() => removeImage(idx)} // 수정된 removeImage 함수
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
