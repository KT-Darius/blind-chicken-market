import { ProductFormData } from "@/types";
import { PRODUCT_CATEGORIES, PRODUCT_STATUS } from "@/lib/constants";

interface Step4ReviewProps {
  formData: ProductFormData;
  uploadedImages: string[];
}

export default function Step4Review({
  formData,
  uploadedImages,
}: Step4ReviewProps) {
  const categoryLabel =
    PRODUCT_CATEGORIES.find((c) => c.value === formData.category)?.label ||
    formData.category;
  const productStatusLabel =
    PRODUCT_STATUS.find((c) => c.value === formData.productStatus)?.label ||
    formData.productStatus;
  const endDateLabel = formData.bidEndDate
    ? new Date(formData.bidEndDate).toLocaleDateString("ko-KR")
    : "지정되지 않음";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground mb-2 text-2xl font-bold">
          등록 내용 확인
        </h2>
        <p className="text-muted-foreground">
          등록하기 전에 내용을 확인해주세요
        </p>
      </div>

      <div className="space-y-6">
        {uploadedImages.length > 0 && (
          <div>
            <h3 className="text-foreground mb-3 font-semibold">사진</h3>
            <div className="grid grid-cols-3 gap-3">
              {uploadedImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img || "/placeholder.svg"}
                  alt={`미리보기 ${idx + 1}`}
                  className="border-border h-32 w-full rounded-lg border object-cover"
                />
              ))}
            </div>
          </div>
        )}

        <div className="border-border space-y-4 border-t pt-6">
          <div>
            <p className="text-muted-foreground text-xs">상품명</p>
            <p className="text-foreground font-semibold">
              {formData.name || "입력되지 않음"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-xs">카테고리</p>
              <p className="text-foreground font-semibold capitalize">
                {categoryLabel}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">상태</p>
              <p className="text-foreground font-semibold capitalize">
                {productStatusLabel}
              </p>
            </div>
          </div>

          {formData.description && (
            <div>
              <p className="text-muted-foreground text-xs">상세 설명</p>
              <p className="text-foreground text-sm">{formData.description}</p>
            </div>
          )}

          <div className="border-border grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-muted-foreground text-xs">시작 가격</p>
              <p className="text-foreground font-semibold">
                {`₩${Number.parseInt(
                  formData.startPrice || "0",
                  10,
                ).toLocaleString()}`}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">경매 종료 날짜</p>
              <p className="text-foreground font-semibold">{endDateLabel}</p>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 border-border text-muted-foreground rounded-lg border p-4 text-xs">
          <p>
            등록 버튼을 클릭하면 이용약관에 동의하며, 상품이 진품이고 정확하게
            설명되었음을 확인하는 것입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
