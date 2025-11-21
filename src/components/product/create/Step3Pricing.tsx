import { Input } from "@/components/ui/input";
import { ProductFormData } from "@/types";

interface Step3PricingProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
}

export default function Step3Pricing({
  formData,
  setFormData,
}: Step3PricingProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground mb-2 text-2xl font-bold">가격 설정</h2>
        <p className="text-muted-foreground">
          시작 가격과 경매 기간을 설정해주세요
        </p>
      </div>

      <div className="space-y-6">
        {/* Starting Price */}
        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            시작 가격 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-lg font-semibold">
              ₩
            </span>
            <Input
              type="number"
              name="startPrice"
              placeholder="0"
              value={formData.startPrice}
              onChange={(e) => {
                const value = e.target.value;
                // 12자리(999,999,999,999) 이하만 허용
                if (value === "" || value.length <= 12) {
                  setFormData((prev) => ({
                    ...prev,
                    startPrice: value,
                  }));
                }
              }}
              className="flex-1"
              step="1"
              min="0"
              maxLength={12}
            />
          </div>
        </div>

        {/* Auction end date */}
        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            경매 종료 날짜 <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            name="bidEndDate"
            value={formData.bidEndDate || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bidEndDate: e.target.value }))
            }
            min={new Date().toISOString().split("T")[0]}
            className="max-w-xs"
          />
        </div>
      </div>
    </div>
  );
}
