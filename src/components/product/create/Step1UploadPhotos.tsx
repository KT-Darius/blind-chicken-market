"use client";

import { Upload } from "lucide-react";
import { useEffect } from "react";

interface Step1UploadPhotosProps {
  uploadedImages: string[];
  setUploadedImages: React.Dispatch<React.SetStateAction<string[]>>;
  imageFiles: File[];
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

// 랜덤 6글자 (영문 대/소문자 + 숫자)
const generateRandomId = (length = 6) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    result += chars[idx];
  }
  return result;
};

// 파일명/확장자 분리
const getFileNameAndExt = (fileName: string) => {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) {
    return { name: fileName, ext: "" };
  }
  const name = fileName.slice(0, lastDot);
  const ext = fileName.slice(lastDot + 1); // "jpg", "png" 등
  return { name, ext };
};

export default function Step1UploadPhotos({
  uploadedImages,
  setUploadedImages,
  imageFiles,
  setImageFiles,
}: Step1UploadPhotosProps) {
  useEffect(() => {
    if (imageFiles.length > uploadedImages.length) {
      const missingCount = imageFiles.length - uploadedImages.length;
      const newUrls = imageFiles
        .slice(-missingCount)
        .map((file) => URL.createObjectURL(file));
      setUploadedImages((prev) => [...prev, ...newUrls]);
    }
  }, [imageFiles.length, uploadedImages.length, imageFiles, setUploadedImages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (imageFiles.length >= 1) {
      alert("사진은 1개만 업로드할 수 있습니다.");
      e.target.value = "";
      return;
    }

    const file = files[0];
    if (!file) return;

    // 🔹 허용된 파일 형식 검증
    const allowedFormats = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/gif",
      "image/webp",
    ];
    const allowedExtensions = ["png", "jpg", "jpeg", "gif", "webp"];

    const { ext } = getFileNameAndExt(file.name);
    const isValidType = allowedFormats.includes(file.type.toLowerCase());
    const isValidExt = allowedExtensions.includes(ext.toLowerCase());

    if (!isValidType && !isValidExt) {
      alert("PNG, JPG, JPEG, GIF, WEBP 형식의 이미지만 업로드할 수 있습니다.");
      e.target.value = "";
      return;
    }

    // 🔹 새 파일 이름 생성 로직
    const { name: originalName } = getFileNameAndExt(file.name);
    const randomId = generateRandomId(6); // 영문+숫자 6글자
    const safeExt = ext || file.type.split("/")[1] || "img";

    // 예: originalName_ext_random6.ext
    const newFileName = `${originalName}_${safeExt}_${randomId}.${safeExt}`;

    // 🔹 이름만 바꾼 새 File 객체 생성
    const renamedFile = new File([file], newFileName, { type: file.type });

    console.log("original:", file.name, "=> renamed:", renamedFile.name);

    const newUrl = URL.createObjectURL(renamedFile);

    setImageFiles([renamedFile]);
    setUploadedImages([newUrl]);

    e.target.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    const urlToRemove = uploadedImages[indexToRemove];
    if (urlToRemove) {
      URL.revokeObjectURL(urlToRemove);
    }
    setUploadedImages((prev) => prev.filter((_, i) => i !== indexToRemove));
    setImageFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const remainingUploads = 1 - imageFiles.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground mb-2 text-2xl font-bold">사진 업로드</h2>

        <p className="text-muted-foreground mt-1 text-xs">
          허용 형식: PNG, JPG, JPEG, GIF, WEBP
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
              accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
              onChange={handleImageUpload}
              className="hidden"
              disabled={imageFiles.length >= 1}
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
          </div>
        ))}
      </div>

      <p className="text-muted-foreground text-xs">
        {imageFiles.length}/1 장 업로드됨
      </p>
    </div>
  );
}
